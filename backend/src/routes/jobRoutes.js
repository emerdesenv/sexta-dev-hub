import { Router } from 'express';
import { getPublicJobById, listPublicJobs, registerPublicJobClick } from '../controllers/jobController.js';

const router = Router();

router.get('/public', listPublicJobs);
router.get('/public/:id', getPublicJobById);
router.post('/public/:id/click', registerPublicJobClick);

export default router;
