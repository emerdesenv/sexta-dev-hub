import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../models/index.js', () => ({
    CommunityModerationLog: {
        create: vi.fn()
    },
    CommunityReply: {
        findByPk: vi.fn()
    },
    CommunityReport: {
        findByPk: vi.fn()
    },
    CommunityTopic: {
        create: vi.fn(),
        findByPk: vi.fn()
    },
    CommunityVote: {},
    User: {
        findByPk: vi.fn()
    }
}));

import communityRoutes from '../communityRoutes.js';
import {
    CommunityModerationLog,
    CommunityReport,
    CommunityReply,
    CommunityTopic,
    User
} from '../../models/index.js';

function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/community', communityRoutes);
    return app;
}

describe('community routes integration', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        process.env.RATE_LIMIT_COMMUNITY_TOPICS_MAX = '8';
    });

    it('POST /community/topics bloqueia conteudo ofensivo com 422', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 7, role: 'student' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValue({ id: 7, role: 'student', is_active: true });

        const response = await request(app)
            .post('/community/topics')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Dúvida importante',
                content: 'Você deveria vai se matar hoje mesmo',
                category: 'duvida',
                isAnonymous: false
            });

        expect(response.status).toBe(422);
        expect(response.body.severity).toBe('high');
        expect(CommunityTopic.create).not.toHaveBeenCalled();
    });

    it('POST /community/topics aplica rate limit por usuario e retorna 429', async () => {
        process.env.RATE_LIMIT_COMMUNITY_TOPICS_MAX = '2';
        const app = createApp();
        const token = jwt.sign({ id: 7, role: 'student' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValue({ id: 7, role: 'student', is_active: true });

        const payload = {
            title: 'Dúvida importante',
            content: 'Você deveria vai se matar hoje mesmo',
            category: 'duvida',
            isAnonymous: false
        };

        const first = await request(app)
            .post('/community/topics')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);
        const second = await request(app)
            .post('/community/topics')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);
        const third = await request(app)
            .post('/community/topics')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        expect(first.status).toBe(422);
        expect(second.status).toBe(429);
        expect(third.status).toBe(429);
        expect(third.body.message).toContain('criação de tópico');
    });

    it('PATCH /community/reports/:id/review aplica acao e oculta topico denunciado', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 3, role: 'professor' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValueOnce({ id: 3, role: 'professor', is_active: true });

        const report = {
            id: 19,
            target_type: 'topic',
            target_id: 88,
            reason: 'Ofensa',
            status: 'pending',
            update: vi.fn(async ({ status }) => {
                report.status = status;
            })
        };
        const topic = {
            id: 88,
            status: 'open',
            update: vi.fn(async () => {})
        };
        CommunityReport.findByPk.mockResolvedValueOnce(report);
        CommunityTopic.findByPk.mockResolvedValueOnce(topic);

        const response = await request(app)
            .patch('/community/reports/19/review')
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'actioned', reason: 'Conteúdo abusivo' });

        expect(response.status).toBe(200);
        expect(topic.update).toHaveBeenCalledWith({ status: 'hidden' });
        expect(CommunityModerationLog.create).toHaveBeenCalledWith(expect.objectContaining({
            moderator_user_id: 3,
            target_type: 'topic',
            target_id: 88,
            action: 'hide'
        }));
        expect(response.body.message).toContain('moderado');
        expect(response.body.report).toEqual({ id: 19, status: 'actioned' });
    });

    it('PATCH /community/moderation/:targetType/:targetId exige perfil de professor', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 8, role: 'student' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValueOnce({ id: 8, role: 'student', is_active: true });

        const response = await request(app)
            .patch('/community/moderation/topic/10')
            .set('Authorization', `Bearer ${token}`)
            .send({ action: 'hide' });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Acesso restrito para professor.' });
    });

    it('PATCH /community/moderation/:targetType/:targetId permite ocultar resposta via moderacao direta', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 3, role: 'professor' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValueOnce({ id: 3, role: 'professor', is_active: true });

        const reply = {
            id: 77,
            is_hidden: false,
            update: vi.fn(async ({ is_hidden }) => {
                reply.is_hidden = is_hidden;
            })
        };
        CommunityReply.findByPk.mockResolvedValueOnce(reply);

        const response = await request(app)
            .patch('/community/moderation/reply/77')
            .set('Authorization', `Bearer ${token}`)
            .send({ action: 'hide', reason: 'Ataque pessoal' });

        expect(response.status).toBe(200);
        expect(reply.update).toHaveBeenCalledWith({ is_hidden: true });
        expect(CommunityModerationLog.create).toHaveBeenCalledWith(expect.objectContaining({
            moderator_user_id: 3,
            target_type: 'reply',
            target_id: 77,
            action: 'hide',
            reason: 'Ataque pessoal'
        }));
    });
});
