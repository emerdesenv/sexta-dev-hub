import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authRequired, optionalAuth, professorRequired } from '../middleware/auth.js';
import {
    createReport,
    createReply,
    createTopic,
    getTopicById,
    listReports,
    listTopics,
    moderateContent,
    reviewReport,
    setBestReply,
    updateTopic,
    updateTopicStatus,
    voteReply
} from '../controllers/communityController.js';

const router = Router();

function envMax(name, fallback) {
    const value = Number(process.env[name] || fallback);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

const communityActionKey = (req) => String(req.user?.id || req.ip || 'anonymous');

const topicsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: () => envMax('RATE_LIMIT_COMMUNITY_TOPICS_MAX', 8),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: communityActionKey,
    message: { message: 'Muitas tentativas de criação de tópico. Aguarde alguns minutos.' }
});

const repliesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: () => envMax('RATE_LIMIT_COMMUNITY_REPLIES_MAX', 20),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: communityActionKey,
    message: { message: 'Muitas respostas em sequência. Aguarde um pouco para continuar.' }
});

const reportsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: () => envMax('RATE_LIMIT_COMMUNITY_REPORTS_MAX', 20),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: communityActionKey,
    message: { message: 'Muitas denúncias em sequência. Aguarde alguns minutos.' }
});

const voteLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: () => envMax('RATE_LIMIT_COMMUNITY_VOTES_MAX', 50),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: communityActionKey,
    message: { message: 'Muitos votos em pouco tempo. Aguarde alguns instantes.' }
});

router.get('/topics', optionalAuth, listTopics);
router.get('/topics/:id', optionalAuth, getTopicById);
router.post('/topics', authRequired, topicsLimiter, createTopic);
router.patch('/topics/:id', authRequired, updateTopic);
router.post('/topics/:id/replies', authRequired, repliesLimiter, createReply);
router.patch('/topics/:id/best-reply', authRequired, setBestReply);
router.patch('/topics/:id/status', authRequired, professorRequired, updateTopicStatus);
router.post('/replies/:id/vote', authRequired, voteLimiter, voteReply);
router.post('/reports', authRequired, reportsLimiter, createReport);
router.get('/reports', authRequired, professorRequired, listReports);
router.patch('/reports/:id/review', authRequired, professorRequired, reviewReport);
router.patch('/moderation/:targetType/:targetId', authRequired, professorRequired, moderateContent);

export default router;
