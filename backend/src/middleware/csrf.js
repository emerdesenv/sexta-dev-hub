function normalizeOrigin(origin) {
    return String(origin || '').trim().replace(/\/+$/, '');
}

function isAllowedOrigin(value, allowedOrigins) {
    const normalized = normalizeOrigin(value);
    if (!normalized) return false;
    return allowedOrigins.includes(normalized);
}

function extractOriginFromReferer(referer) {
    try {
        if (!referer) return '';
        const url = new URL(String(referer));
        return `${url.protocol}//${url.host}`;
    } catch {
        return '';
    }
}

function hasAuthCookie(req) {
    const authCookieName = process.env.AUTH_COOKIE_NAME || 'sdh_auth_token';
    const refreshCookieName = process.env.AUTH_REFRESH_COOKIE_NAME || 'sdh_refresh_token';
    return Boolean(req.cookies?.[authCookieName] || req.cookies?.[refreshCookieName]);
}

export function createCsrfProtection({ allowedOrigins = [] } = {}) {
    const safeAllowedOrigins = Array.isArray(allowedOrigins)
        ? allowedOrigins.map((origin) => normalizeOrigin(origin)).filter(Boolean)
        : [];

    return function csrfProtection(req, res, next) {
        const method = String(req.method || '').toUpperCase();
        const protectedMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
        if (!protectedMethods.has(method)) return next();

        // Requests authenticated with Authorization header are not vulnerable to browser CSRF.
        if (String(req.headers.authorization || '').startsWith('Bearer ')) {
            return next();
        }

        // Focus CSRF checks on browser cookie-authenticated requests.
        if (!hasAuthCookie(req)) return next();

        const origin = String(req.headers.origin || '').trim();
        const refererOrigin = extractOriginFromReferer(req.headers.referer);
        if (
            isAllowedOrigin(origin, safeAllowedOrigins) ||
            isAllowedOrigin(refererOrigin, safeAllowedOrigins)
        ) {
            return next();
        }

        return res.status(403).json({
            message: 'Requisição bloqueada por proteção CSRF (origem não confiável).'
        });
    };
}
