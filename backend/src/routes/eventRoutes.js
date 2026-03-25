import { Router } from 'express';
import { authRequired, optionalAuth, professorRequired } from '../middleware/auth.js';
import {
    adminCreateEvent,
    adminCreateItem,
    adminListEvents,
    adminListItems,
    claimEvent,
    getActiveEvent,
    getMyCollectibles
} from '../controllers/eventController.js';

const router = Router();

router.get('/active', optionalAuth, getActiveEvent);
router.get('/collectibles/me', authRequired, getMyCollectibles);
router.post('/:eventId/claim', authRequired, claimEvent);

router.get('/admin/items', authRequired, professorRequired, adminListItems);
router.post('/admin/items', authRequired, professorRequired, adminCreateItem);
router.get('/admin/events', authRequired, professorRequired, adminListEvents);
router.post('/admin/events', authRequired, professorRequired, adminCreateEvent);

export default router;

