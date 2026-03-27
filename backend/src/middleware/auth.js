import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    const cookieName = process.env.AUTH_COOKIE_NAME || 'sdh_auth_token';
    return req.cookies?.[cookieName] || null;
}

export async function authRequired(req, res, next) {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Token não informado.' });
    }
    
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(req.user.id, { attributes: ['id', 'role', 'is_active'] });
        if (!user || !user.is_active) {
            return res.status(403).json({ message: 'Conta inativa ou removida.' });
        }
        req.user.role = user.role;
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
}

export async function optionalAuth(req, res, next) {
    const token = getTokenFromRequest(req);
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, { attributes: ['id', 'role', 'is_active'] });
        if (!user || !user.is_active) {
            req.user = null;
            return next();
        }
        req.user = {
            ...decoded,
            role: user.role
        };
    } catch {
        req.user = null;
    }
    return next();
}

export function professorRequired(req, res, next) {
    if (!req.user || req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Acesso restrito para professor.' });
    }
    return next();
}

export function studentRequired(req, res, next) {
    if (!req.user || req.user.role !== 'student') {
        return res.status(403).json({ message: 'Acesso restrito para aluno.' });
    }
    return next();
}
