import { Router } from 'express';
import { authRequired, professorRequired } from '../middleware/auth.js';
import {
    activateReward,
    claimMission,
    completeEpisode,
    getAdminMetrics,
    getLeaderboard,
    getMyHistory,
    getMyGamification,
    getPreviewGamification,
    redeemReward
} from '../controllers/gamificationController.js';

const router = Router();

router.get('/preview', getPreviewGamification);
router.get('/leaderboard', getLeaderboard);
router.get('/me', authRequired, getMyGamification);
router.get('/history/me', authRequired, getMyHistory);
router.post('/episodes/:episodeId/complete', authRequired, completeEpisode);
router.post('/missions/:missionKey/claim', authRequired, claimMission);
router.post('/rewards/:rewardKey/redeem', authRequired, redeemReward);
router.post('/rewards/:rewardKey/activate', authRequired, activateReward);
router.get('/admin/metrics', authRequired, professorRequired, getAdminMetrics);

export default router;
