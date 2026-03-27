import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../models/index.js', () => ({
    User: {
        findByPk: vi.fn()
    },
    Episode: {
        findByPk: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn()
    },
    EpisodeAttempt: { findAll: vi.fn() },
    UserEpisodeAttemptCredit: { findAll: vi.fn(), findOne: vi.fn() },
    UserEpisodeProgress: { findAll: vi.fn() },
    UserGamification: { findOne: vi.fn() }
}));

import episodeRoutes from '../episodeRoutes.js';
import { Episode, User } from '../../models/index.js';

function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/episodes', episodeRoutes);
    return app;
}

describe('episode routes integration (authorization)', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    it('bloqueia aluno em DELETE /episodes/:id', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 20, role: 'student' }, process.env.JWT_SECRET);
        User.findByPk.mockResolvedValueOnce({ id: 20, role: 'student', is_active: true });

        const response = await request(app)
            .delete('/episodes/5')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Acesso restrito para professor.' });
    });

    it('permite professor em DELETE /episodes/:id', async () => {
        const app = createApp();
        const token = jwt.sign({ id: 1, role: 'professor' }, process.env.JWT_SECRET);
        const mockEpisode = {
            id: 5,
            cover_path: null,
            audio_path: null,
            pdf_path: null,
            destroy: vi.fn(async () => {})
        };
        User.findByPk.mockResolvedValueOnce({ id: 1, role: 'professor', is_active: true });
        Episode.findByPk.mockResolvedValueOnce(mockEpisode);

        const response = await request(app)
            .delete('/episodes/5')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(mockEpisode.destroy).toHaveBeenCalledTimes(1);
        expect(response.body).toEqual({ message: 'Episódio removido com sucesso.' });
    });
});
