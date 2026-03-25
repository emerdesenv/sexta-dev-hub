import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(8).max(120)
});

const registerStudentSchema = z.object({
    username: z.string().min(3).max(80),
    password: z.string().min(8).max(120),
    confirmPassword: z.string().min(8).max(120)
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

export async function login(req, res) {
    const data = schema.parse(req.body);
    const normalizedUsername = data.username.trim().toLowerCase();

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no ambiente.');
    }

    const user = await User.findOne({ where: { username: normalizedUsername } });
    if (!user) {
        authAudit('login_failed_user_not_found', { username: normalizedUsername, ip: req.ip });
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    if (!user.is_active) {
        authAudit('login_blocked_inactive_user', { userId: user.id, username: user.username, ip: req.ip });
        return res.status(403).json({ message: 'Conta inativa. Entre em contato com o professor.' });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        authAudit('login_blocked_locked_user', { userId: user.id, username: user.username, ip: req.ip });
        return res.status(423).json({ message: 'Conta temporariamente bloqueada por tentativas inválidas.' });
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

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });
    authAudit('login_success', { userId: user.id, username: user.username, role: user.role, ip: req.ip });

    return res.json({ token, user: { username: user.username, role: user.role } });
}

export async function registerStudent(req, res) {
    const data = registerStudentSchema.parse(req.body);
    const normalizedUsername = data.username.trim().toLowerCase();
    const policyError = validatePasswordPolicy(data.password, normalizedUsername);
    if (policyError) {
        return res.status(400).json({ message: policyError });
    }

    const existing = await User.findOne({ where: { username: normalizedUsername } });
    if (existing) {
        return res.status(409).json({ message: 'Nome de usuário já está em uso.' });
    }

    const password_hash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
        username: normalizedUsername,
        password_hash,
        role: 'student'
    });
    authAudit('student_registered', { userId: user.id, username: user.username, ip: req.ip });

    return res.status(201).json({
        message: 'Conta de aluno criada com sucesso.',
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
    const user = await User.findByPk(req.user.id, {
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
    const data = updatePasswordSchema.parse(req.body);
    const user = await User.findByPk(req.user.id);
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
        where: { role: 'student' },
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

    const data = updateStudentStatusSchema.parse(req.body);
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
