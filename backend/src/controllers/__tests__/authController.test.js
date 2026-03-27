import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../models/index.js', () => ({
    User: {
        findOne: vi.fn(),
        create: vi.fn()
    },
    UserSession: {
        create: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn()
    },
    UserCollectible: {
        destroy: vi.fn()
    }
}));

vi.mock('../../services/accountPurgeService.js', () => ({
    buildPurgeDate: vi.fn(() => new Date('2030-01-01T00:00:00.000Z'))
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(async () => 'hashed-password')
    }
}));

import { registerStudent, deleteMyAccount } from '../authController.js';
import { User, UserCollectible } from '../../models/index.js';

function createMockRes() {
    return {
        cookie: vi.fn().mockReturnThis(),
        clearCookie: vi.fn().mockReturnThis(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
    };
}

describe('authController', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.STUDENT_REQUIRE_APPROVAL = 'true';
        process.env.STUDENT_INVITE_CODE = '';
    });

    it('retorna erro amigavel quando username nao segue formato nome.sobrenome', async () => {
        const req = {
            body: {
                username: 'teste_a',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456'
            },
            ip: '127.0.0.1'
        };
        const res = createMockRes();

        await registerStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('formato nome.sobrenome')
        }));
    });

    it('bloqueia cadastro quando codigo de convite esta incorreto', async () => {
        process.env.STUDENT_INVITE_CODE = 'TURMA-2026';

        const req = {
            body: {
                username: 'aluno.teste',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456',
                inviteCode: 'CODIGO-ERRADO'
            },
            ip: '127.0.0.1'
        };
        const res = createMockRes();

        await registerStudent(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Código de convite inválido.' });
    });

    it('cria aluno inativo quando aprovacao obrigatoria esta ativa', async () => {
        User.findOne.mockResolvedValueOnce(null);
        User.create.mockResolvedValue({ id: 10, username: 'aluno.teste', role: 'student' });

        const req = {
            body: {
                username: 'aluno.teste',
                password: 'SenhaForte456',
                confirmPassword: 'SenhaForte456'
            },
            ip: '127.0.0.1'
        };
        const res = createMockRes();

        await registerStudent(req, res);

        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            username: 'aluno.teste',
            role: 'student',
            is_active: false
        }));
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('executa soft delete da conta do aluno', async () => {
        const mockUser = {
            id: 22,
            username: 'aluno.teste',
            role: 'student',
            update: vi.fn(async () => {})
        };
        User.findOne.mockResolvedValue(mockUser);

        const req = {
            user: { id: 22 },
            ip: '127.0.0.1'
        };
        const res = createMockRes();

        await deleteMyAccount(req, res);

        expect(UserCollectible.destroy).toHaveBeenCalledWith({ where: { user_id: 22 } });
        expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({
            is_active: false,
            deleted_at: expect.any(Date),
            purge_after: expect.any(Date),
            username: expect.stringContaining('deleted.22.')
        }));
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('prazo de retenção')
        }));
    });
});
