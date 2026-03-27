import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User, UserCollectible, UserSession } from '../models/index.js';
import { buildPurgeDate } from '../services/accountPurgeService.js';

const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(8).max(120)
});

const registerStudentSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3)
        .max(80)
        .regex(/^[a-z]+(?:\.[a-z]+)+$/, {
            message: 'O usuário deve seguir o formato nome.sobrenome (ex.: emerson.amancio), usando apenas letras minúsculas e ponto.'
        }),
    password: z.string().min(8).max(120),
    confirmPassword: z.string().min(8).max(120),
    inviteCode: z.string().trim().max(120).optional().default('')
}).refine((value) => value.password === value.confirmPassword, {
    message: 'Senha e confirmação de senha devem ser iguais.',
    path: ['confirmPassword']
});

const LOCK_MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const COMMON_PASSWORDS = new Set([
    '123456',
    '12345678',
    'password',
    'qwerty',
    'admin',
    'abc123',
    'senha123',
    '123456789'
]);

function getAuthCookieName() {
    return process.env.AUTH_COOKIE_NAME || 'sdh_auth_token';
}

function getRefreshCookieName() {
    return process.env.AUTH_REFRESH_COOKIE_NAME || 'sdh_refresh_token';
}

function getAccessExpiresIn() {
    return process.env.AUTH_ACCESS_EXPIRES_IN || '15m';
}

function getRefreshTtlMs() {
    const raw = Number(process.env.AUTH_REFRESH_TTL_MS || 30 * 24 * 60 * 60 * 1000);
    return Number.isFinite(raw) && raw > 60_000 ? Math.floor(raw) : 30 * 24 * 60 * 60 * 1000;
}

function signAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: getAccessExpiresIn() }
    );
}

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(String(rawToken || '')).digest('hex');
}

function generateRefreshToken() {
    return crypto.randomBytes(48).toString('hex');
}

function setAccessCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(getAuthCookieName(), token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000
    });
}

function setRefreshCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(getRefreshCookieName(), token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        maxAge: getRefreshTtlMs()
    });
}

function clearAuthCookie(res) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(getAuthCookieName(), {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'
    });
    res.clearCookie(getRefreshCookieName(), {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'
    });
}

async function createRefreshSession({ userId, req }) {
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + getRefreshTtlMs());
    await UserSession.create({
        user_id: userId,
        token_hash: hashToken(refreshToken),
        expires_at: expiresAt,
        ip_address: req.ip || null,
        user_agent: String(req.headers['user-agent'] || '').slice(0, 255) || null
    });
    return refreshToken;
}

function hasPasswordComplexity(password) {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
}

function validatePasswordPolicy(password, username = '') {
    const normalizedPassword = String(password || '').trim();
    const normalizedUsername = String(username || '').trim().toLowerCase();

    if (!hasPasswordComplexity(normalizedPassword)) {
        return 'A senha precisa ter pelo menos 1 letra e 1 número.';
    }
    if (COMMON_PASSWORDS.has(normalizedPassword.toLowerCase())) {
        return 'Escolha uma senha menos comum para proteger sua conta.';
    }
    if (normalizedUsername && normalizedPassword.toLowerCase().includes(normalizedUsername)) {
        return 'A senha não pode conter o nome de usuário.';
    }
    return '';
}

function authAudit(event, details = {}) {
    console.info('[auth]', event, JSON.stringify(details));
}

function buildDeletedUsername(username, userId) {
    const suffix = `deleted.${userId}.${Date.now()}`;
    const prefix = String(username || 'usuario').slice(0, 40);
    return `${prefix}.${suffix}`.slice(0, 80);
}

function envFlag(name, defaultValue = false) {
    const raw = String(process.env[name] || '').trim().toLowerCase();
    if (!raw) return defaultValue;
    return ['1', 'true', 'yes', 'on', 'sim'].includes(raw);
}

export async function login(req, res) {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos para login.' });
    }
    const data = parsed.data;
    const normalizedUsername = data.username.trim().toLowerCase();

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no ambiente.');
    }

    const user = await User.findOne({ where: { username: normalizedUsername, deleted_at: null } });
    if (!user) {
        authAudit('login_failed_user_not_found', { username: normalizedUsername, ip: req.ip });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (!user.is_active) {
        authAudit('login_blocked_inactive_user', { userId: user.id, username: user.username, ip: req.ip });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        authAudit('login_blocked_locked_user', { userId: user.id, username: user.username, ip: req.ip });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const valid = await user.checkPassword(data.password);
    if (!valid) {
        const attempts = Number(user.failed_login_attempts || 0) + 1;
        const shouldLock = attempts >= LOCK_MAX_ATTEMPTS;
        const lockedUntil = shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null;
        await user.update({
            failed_login_attempts: shouldLock ? 0 : attempts,
            locked_until: lockedUntil
        });
        authAudit('login_failed_invalid_password', {
            userId: user.id,
            username: user.username,
            ip: req.ip,
            attempts,
            locked: shouldLock
        });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    await user.update({
        failed_login_attempts: 0,
        locked_until: null
    });

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshSession({ userId: user.id, req });
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);
    authAudit('login_success', { userId: user.id, username: user.username, role: user.role, ip: req.ip });

    return res.json({ user: { id: user.id, username: user.username, role: user.role } });
}

export async function refreshSession(req, res) {
    const refreshToken = req.cookies?.[getRefreshCookieName()];
    if (!refreshToken) {
        return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
    }

    const tokenHash = hashToken(refreshToken);
    const session = await UserSession.findOne({
        where: {
            token_hash: tokenHash,
            revoked_at: null,
            expires_at: { [Op.gt]: new Date() }
        }
    });
    if (!session) {
        clearAuthCookie(res);
        return res.status(401).json({ message: 'Sessão inválida. Faça login novamente.' });
    }

    const user = await User.findOne({
        where: { id: session.user_id, deleted_at: null },
        attributes: ['id', 'username', 'role', 'is_active']
    });
    if (!user || !user.is_active) {
        await session.update({ revoked_at: new Date() });
        clearAuthCookie(res);
        return res.status(401).json({ message: 'Conta inativa ou removida.' });
    }

    await session.update({ revoked_at: new Date(), last_used_at: new Date() });
    const newRefreshToken = await createRefreshSession({ userId: user.id, req });
    const accessToken = signAccessToken(user);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, newRefreshToken);

    return res.json({ user: { id: user.id, username: user.username, role: user.role } });
}

export async function registerStudent(req, res) {
    const parsed = registerStudentSchema.safeParse(req.body);
    if (!parsed.success) {
        const usernameIssue = parsed.error.issues.find((issue) => issue.path?.[0] === 'username');
        const fallbackIssue = parsed.error.issues[0];
        return res.status(400).json({
            message: usernameIssue?.message || fallbackIssue?.message || 'Dados inválidos para cadastro.'
        });
    }
    const data = parsed.data;
    const normalizedUsername = data.username.trim().toLowerCase();
    const normalizedInviteCode = String(data.inviteCode || '').trim();
    const expectedInviteCode = String(process.env.STUDENT_INVITE_CODE || '').trim();
    const requireApproval = envFlag('STUDENT_REQUIRE_APPROVAL', true);

    if (expectedInviteCode && normalizedInviteCode !== expectedInviteCode) {
        authAudit('student_register_blocked_invalid_invite', {
            username: normalizedUsername,
            ip: req.ip
        });
        return res.status(403).json({ message: 'Código de convite inválido.' });
    }

    const policyError = validatePasswordPolicy(data.password, normalizedUsername);
    if (policyError) {
        return res.status(400).json({ message: policyError });
    }

    const existing = await User.findOne({ where: { username: normalizedUsername, deleted_at: null } });
    if (existing) {
        return res.status(409).json({ message: 'Nome de usuário já está em uso.' });
    }

    const password_hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
        username: normalizedUsername,
        password_hash,
        role: 'student',
        is_active: !requireApproval
    });
    authAudit('student_registered', {
        userId: user.id,
        username: user.username,
        ip: req.ip,
        requiresApproval: requireApproval,
        inviteProtected: Boolean(expectedInviteCode)
    });

    return res.status(201).json({
        message: requireApproval
            ? 'Cadastro enviado com sucesso. Sua conta ficará disponível após aprovação do professor.'
            : 'Conta de aluno criada com sucesso.',
        user: { id: user.id, username: user.username, role: user.role }
    });
}

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(120),
    confirmPassword: z.string().min(8).max(120)
}).refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Nova senha e confirmação devem ser iguais.',
    path: ['confirmPassword']
});

const updateStudentStatusSchema = z.object({
    isActive: z.boolean()
});

export async function getMe(req, res) {
    const user = await User.findOne({
        where: { id: req.user.id, deleted_at: null },
        attributes: ['id', 'username', 'role', 'created_at']
    });

    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.created_at
    });
}

export async function updateMyPassword(req, res) {
    const parsed = updatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return res.status(400).json({
            message: issue?.message || 'Dados inválidos para atualização de senha.'
        });
    }
    const data = parsed.data;
    const user = await User.findOne({ where: { id: req.user.id, deleted_at: null } });
    if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const valid = await user.checkPassword(data.currentPassword);
    if (!valid) {
        return res.status(400).json({ message: 'Senha atual inválida.' });
    }

    const policyError = validatePasswordPolicy(data.newPassword, user.username);
    if (policyError) {
        return res.status(400).json({ message: policyError });
    }

    const password_hash = await bcrypt.hash(data.newPassword, 10);
    await user.update({ password_hash });
    authAudit('password_updated', { userId: user.id, username: user.username, ip: req.ip });

    return res.json({ message: 'Senha atualizada com sucesso.' });
}

export async function listStudents(req, res) {
    const rows = await User.findAll({
        where: { role: 'student', deleted_at: null },
        attributes: ['id', 'username', 'role', 'is_active', 'created_at'],
        order: [['username', 'ASC']]
    });

    return res.json(rows.map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: Boolean(user.is_active),
        createdAt: user.created_at
    })));
}

export async function updateStudentStatus(req, res) {
    const studentId = Number(req.params.id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
        return res.status(400).json({ message: 'ID de aluno inválido.' });
    }

    const parsed = updateStudentStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos para atualização de status.' });
    }
    const data = parsed.data;
    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
        return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    await student.update({ is_active: data.isActive });

    return res.json({
        message: data.isActive ? 'Aluno ativado com sucesso.' : 'Aluno inativado com sucesso.',
        student: {
            id: student.id,
            username: student.username,
            role: student.role,
            isActive: Boolean(student.is_active)
        }
    });
}

export async function deleteMyAccount(req, res) {
    try {
        const user = await User.findOne({ where: { id: req.user.id, deleted_at: null } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (user.role !== 'student') {
            return res.status(403).json({ message: 'Somente contas de aluno podem ser excluídas por este fluxo.' });
        }

        // Keep explicit cleanup for schemas where FK constraints are not ON DELETE CASCADE.
        await UserCollectible.destroy({ where: { user_id: user.id } });

        const username = user.username;
        await user.update({
            is_active: false,
            deleted_at: new Date(),
            purge_after: buildPurgeDate(),
            username: buildDeletedUsername(username, user.id)
        });
        clearAuthCookie(res);
        authAudit('account_soft_deleted_by_student', { userId: req.user.id, username, ip: req.ip });

        return res.json({
            message: 'Conta excluída com sucesso. Seu progresso ficará indisponível agora e será removido permanentemente após o prazo de retenção.'
        });
    } catch (error) {
        console.error('[auth] delete_account_failed', {
            userId: req.user?.id,
            message: error?.message
        });
        return res.status(500).json({
            message: 'Não foi possível excluir sua conta agora. Tente novamente em instantes.'
        });
    }
}

export async function logout(req, res) {
    const refreshToken = req.cookies?.[getRefreshCookieName()];
    if (refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await UserSession.update(
            { revoked_at: new Date() },
            { where: { token_hash: tokenHash, revoked_at: null } }
        );
    }
    clearAuthCookie(res);
    return res.json({ message: 'Sessão encerrada com sucesso.' });
}
