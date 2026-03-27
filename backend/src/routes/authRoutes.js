import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { deleteMyAccount, getMe, listStudents, login, logout, refreshSession, registerStudent, updateMyPassword, updateStudentStatus } from '../controllers/authController.js';
import { authRequired, professorRequired } from '../middleware/auth.js';

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
router.post('/refresh', refreshSession);
router.post('/logout', logout);
router.post('/register-student', registerLimiter, registerStudent);
router.get('/me', authRequired, getMe);
router.delete('/me', authRequired, deleteMyAccount);
router.patch('/me/password', authRequired, updateMyPassword);
router.get('/students', authRequired, professorRequired, listStudents);
router.patch('/students/:id/status', authRequired, professorRequired, updateStudentStatus);
export default router;
