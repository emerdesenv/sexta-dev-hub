import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getMe, login, registerStudent, updateMyPassword } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.' }
});

router.post('/login', loginLimiter, login);
router.post('/register-student', registerLimiter, registerStudent);
router.get('/me', authRequired, getMe);
router.patch('/me/password', authRequired, updateMyPassword);
export default router;
