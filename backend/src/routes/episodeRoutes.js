import { Router } from 'express';
import { createEpisode, deleteEpisode, getPublicBySlug, listAdmin, listPublic, updateEpisode } from '../controllers/episodeController.js';
import { authRequired, optionalAuth, professorRequired } from '../middleware/auth.js';
import { upload } from '../services/upload.js';

const router = Router();

const multipart = upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]);

router.get('/public', optionalAuth, listPublic);
router.get('/public/:slug', optionalAuth, getPublicBySlug);
router.get('/', authRequired, listAdmin);
router.post('/', authRequired, professorRequired, multipart, createEpisode);
router.put('/:id', authRequired, professorRequired, multipart, updateEpisode);
router.delete('/:id', authRequired, professorRequired, deleteEpisode);

export default router;
