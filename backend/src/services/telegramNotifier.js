import https from 'node:https';

function isEnabled() {
    const raw = String(process.env.TELEGRAM_NEW_STUDENT_NOTIFICATIONS || '').trim().toLowerCase();
    if (!raw) return true;
    return ['1', 'true', 'yes', 'on', 'sim'].includes(raw);
}

function notifyOnlyProduction() {
    const raw = String(process.env.TELEGRAM_NOTIFY_ONLY_PRODUCTION || '').trim().toLowerCase();
    if (!raw) return false;
    return ['1', 'true', 'yes', 'on', 'sim'].includes(raw);
}

function getEnvironmentLabel() {
    const env = String(process.env.NODE_ENV || 'development').trim().toLowerCase();
    if (env === 'production') return 'PROD';
    if (env === 'staging') return 'STAGING';
    if (env === 'test') return 'TEST';
    return 'DEV';
}

function getApprovalUrl() {
    const explicit = String(process.env.TELEGRAM_APPROVAL_URL || '').trim();
    if (explicit) return explicit;
    const frontendRaw = String(process.env.FRONTEND_URL || '').trim();
    if (!frontendRaw) return '';
    const firstUrl = frontendRaw.split(',').map((item) => item.trim()).find(Boolean);
    if (!firstUrl) return '';
    return `${firstUrl.replace(/\/+$/, '')}/professor`;
}

function getBotToken() {
    return String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
}

function getChatId() {
    return String(process.env.TELEGRAM_CHAT_ID || '').trim();
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export async function notifyNewStudentRegistration({
    username,
    userId,
    requiresApproval,
    ip,
    createdAt
}) {
    if (!requiresApproval || !isEnabled()) return;
    if (notifyOnlyProduction() && String(process.env.NODE_ENV || '').trim().toLowerCase() !== 'production') return;

    const botToken = getBotToken();
    const chatId = getChatId();
    if (!botToken || !chatId) return;

    const when = createdAt instanceof Date ? createdAt.toISOString() : new Date().toISOString();
    const safeUsername = escapeHtml(username);
    const safeIp = escapeHtml(ip || 'não informado');
    const approvalUrl = getApprovalUrl();
    const text = [
        `🔔 <b>Novo aluno cadastrado</b> <code>[${getEnvironmentLabel()}]</code>`,
        '',
        `<b>Usuário:</b> <code>${safeUsername}</code>`,
        `<b>ID:</b> <code>${userId}</code>`,
        `<b>IP:</b> <code>${safeIp}</code>`,
        `<b>Data:</b> <code>${escapeHtml(when)}</code>`,
        '',
        'Aguardando aprovação para ativação.',
        approvalUrl ? `\n👉 <a href="${escapeHtml(approvalUrl)}">Abrir painel de aprovação</a>` : ''
    ].join('\n');

    const payload = JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
    });

    await new Promise((resolve, reject) => {
        const req = https.request({
            protocol: 'https:',
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${botToken}/sendMessage`,
            method: 'POST',
            family: 4,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10_000
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                    return;
                }
                reject(new Error(`telegram_send_failed_${res.statusCode || 0}:${body}`));
            });
        });

        req.on('timeout', () => {
            req.destroy(new Error('telegram_send_timeout'));
        });
        req.on('error', (error) => {
            const code = error?.code ? `:${error.code}` : '';
            reject(new Error(`telegram_send_request_error${code}:${error?.message || 'unknown'}`));
        });
        req.write(payload);
        req.end();
    });
}
