import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { UniqueConstraintError } from 'sequelize';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../models/index.js', () => ({
    User: {
        findByPk: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn()
    },
    UserSession: {
        create: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn(async () => [0])
    },
    UserCollectible: {
        destroy: vi.fn()
    }
}));

vi.mock('../../services/accountPurgeService.js', () => ({
    buildPurgeDate: vi.fn(() => new Date('2030-01-01T00:00:00.000Z'))
}));

import authRoutes from '../authRoutes.js';
import { User, UserCollectible, UserSession } from '../../models/index.js';

function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    return app;
}

describe('auth routes integration', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        process.env.STUDENT_REQUIRE_APPROVAL = 'true';
        process.env.STUDENT_INVITE_CODE = '';
    });

    it('POST /auth/register-student retorna erro amigavel para username invalido', async () => {
        const app = createApp();

        const response = await request(app)
            .post('/auth/register-student')
            .send({
                username: 'teste_a',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('formato nome.sobrenome');
    });

    it('POST /auth/register-student aplica limite por usuario (mesmo IP pode cadastrar varios alunos)', async () => {
        const app = createApp();
        for (let i = 0; i < 8; i += 1) {
            const letter = String.fromCharCode(97 + i);
            const response = await request(app)
                .post('/auth/register-student')
                .send({
                    username: `turma.${letter}`,
                    password: '123',
                    confirmPassword: '123'
                });
            expect(response.status).not.toBe(429);
            expect(response.status).toBe(400);
        }
    });

    it('POST /auth/register-student retorna 429 apos 5 tentativas com mesmo usuario (mesmo IP)', async () => {
        const app = createApp();
        const body = {
            username: 'limite.aluno',
            password: '123',
            confirmPassword: '123'
        };
        for (let i = 0; i < 5; i += 1) {
            const response = await request(app).post('/auth/register-student').send(body);
            expect(response.status).toBe(400);
        }
        const blocked = await request(app).post('/auth/register-student').send(body);
        expect(blocked.status).toBe(429);
        expect(blocked.body.message).toContain('Muitas tentativas de cadastro');
    });

    it('POST /auth/register-student retorna 409 quando usuario ja existe', async () => {
        const app = createApp();
        User.findOne.mockResolvedValueOnce({
            id: 7,
            username: 'dup.silva',
            deleted_at: null
        });

        const response = await request(app)
            .post('/auth/register-student')
            .send({
                username: 'dup.silva',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456'
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ message: 'Nome de usuário já está em uso.' });
        expect(User.create).not.toHaveBeenCalled();
    });

    it('POST /auth/register-student retorna 201 quando dados validos', async () => {
        const app = createApp();
        User.findOne.mockResolvedValueOnce(null);
        User.create.mockResolvedValue({
            id: 42,
            username: 'novo.aluno',
            role: 'student',
            created_at: new Date('2026-01-15T12:00:00.000Z')
        });

        const response = await request(app)
            .post('/auth/register-student')
            .send({
                username: 'novo.aluno',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456'
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            expect.objectContaining({
                requiresApproval: true,
                user: { id: 42, username: 'novo.aluno', role: 'student' }
            })
        );
        expect(response.body.message).toContain('aprovação');
        expect(User.create).toHaveBeenCalled();
    });

    it('POST /auth/register-student retorna 409 quando create falha por unicidade', async () => {
        const app = createApp();
        User.findOne.mockResolvedValueOnce(null);
        User.create.mockRejectedValueOnce(new UniqueConstraintError({ message: 'username' }));

        const response = await request(app)
            .post('/auth/register-student')
            .send({
                username: 'corrida.aluno',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456'
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ message: 'Nome de usuário já está em uso.' });
    });

    it('POST /auth/login retorna 429 apos 10 tentativas com mesmo usuario (mesmo IP)', async () => {
        const app = createApp();
        User.findOne.mockResolvedValue(null);

        const payload = { username: 'falha.login', password: 'QualquerCoisa123' };
        for (let i = 0; i < 10; i += 1) {
            const response = await request(app).post('/auth/login').send(payload);
            expect(response.status).toBe(401);
        }
        const blocked = await request(app).post('/auth/login').send(payload);
        expect(blocked.status).toBe(429);
        expect(blocked.body.message).toContain('Muitas tentativas de login');
    });

    it('GET /auth/me sem token retorna 401', async () => {
        const app = createApp();

        const response = await request(app).get('/auth/me');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Token não informado.' });
    });

    it('DELETE /auth/me com token valido faz soft delete', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 99, role: 'student' }, process.env.JWT_SECRET);

        User.findByPk.mockResolvedValueOnce({ id: 99, role: 'student', is_active: true });
        User.findOne.mockResolvedValueOnce({
                id: 99,
                username: 'aluno.teste',
                role: 'student',
                update: vi.fn(async () => {})
            });

        const response = await request(app)
            .delete('/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(UserCollectible.destroy).toHaveBeenCalledWith({ where: { user_id: 99 } });
        expect(response.body.message).toContain('prazo de retenção');
    });

    it('PATCH /auth/students/:id/status bloqueia aluno sem perfil professor', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 20, role: 'student' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValueOnce({ id: 20, role: 'student', is_active: true });

        const response = await request(app)
            .patch('/auth/students/55/status')
            .set('Authorization', `Bearer ${token}`)
            .send({ isActive: true });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Acesso restrito para professor.' });
    });

    it('PATCH /auth/students/:id/status permite professor ativar aluno pendente', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 1, role: 'professor' }, process.env.JWT_SECRET);
        const student = {
            id: 55,
            username: 'aluno.pendente',
            role: 'student',
            is_active: false,
            update: vi.fn(async ({ is_active }) => {
                student.is_active = is_active;
            })
        };

        User.findByPk
            .mockResolvedValueOnce({ id: 1, role: 'professor', is_active: true })
            .mockResolvedValueOnce(student);

        const response = await request(app)
            .patch('/auth/students/55/status')
            .set('Authorization', `Bearer ${token}`)
            .send({ isActive: true });

        expect(response.status).toBe(200);
        expect(student.update).toHaveBeenCalledWith({ is_active: true });
        expect(response.body).toEqual({
            message: 'Aluno ativado com sucesso.',
            student: {
                id: 55,
                username: 'aluno.pendente',
                role: 'student',
                isActive: true
            }
        });
    });

    it('POST /auth/students/:id/reset-password bloqueia quem nao e professor', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 20, role: 'student' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValueOnce({ id: 20, role: 'student', is_active: true });

        const response = await request(app)
            .post('/auth/students/77/reset-password')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Acesso restrito para professor.' });
    });

    it('POST /auth/students/:id/reset-password gera senha e revoga sessoes do aluno', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 1, role: 'professor' }, process.env.JWT_SECRET);

        const student = {
            id: 77,
            username: 'aluno.z',
            role: 'student',
            deleted_at: null,
            update: vi.fn(async () => {})
        };

        User.findByPk.mockResolvedValueOnce({ id: 1, role: 'professor', is_active: true });
        User.findOne.mockResolvedValueOnce(student);
        UserSession.update.mockResolvedValueOnce([2]);

        const response = await request(app)
            .post('/auth/students/77/reset-password')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('Nova senha gerada');
        expect(typeof response.body.temporaryPassword).toBe('string');
        expect(response.body.temporaryPassword.length).toBeGreaterThanOrEqual(8);
        expect(response.body.student).toEqual({ id: 77, username: 'aluno.z' });
        expect(student.update).toHaveBeenCalledWith(
            expect.objectContaining({
                failed_login_attempts: 0,
                locked_until: null,
                password_hash: expect.any(String)
            })
        );
        expect(UserSession.update).toHaveBeenCalledWith(
            { revoked_at: expect.any(Date) },
            { where: { user_id: 77, revoked_at: null } }
        );
    });
});
