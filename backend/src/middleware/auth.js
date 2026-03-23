import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token não informado.' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
}

export function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
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
