import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { ensureSeedAdmin } from './scripts/seed.js';
import { purgeExpiredDeletedAccounts } from './services/accountPurgeService.js';

dotenv.config();

const port = Number(process.env.PORT || 3000);
const purgeIntervalMs = Number(process.env.ACCOUNT_PURGE_INTERVAL_MS || 6 * 60 * 60 * 1000);

function ensureProductionSecurityConfig() {
    if (process.env.NODE_ENV !== 'production') return;

    const jwtSecret = String(process.env.JWT_SECRET || '').trim();
    const insecureDefaults = new Set([
        'supersecretjwt',
        'secret',
        'changeme',
        '123456',
        'password'
    ]);

    if (!jwtSecret || jwtSecret.length < 24 || insecureDefaults.has(jwtSecret.toLowerCase())) {
        throw new Error('Configuração insegura: JWT_SECRET ausente ou fraco para produção.');
    }
}

ensureProductionSecurityConfig();

async function runAccountPurge(reason = 'startup') {
    try {
        const purged = await purgeExpiredDeletedAccounts();
        if (purged > 0) {
            console.info(`[auth] purge_deleted_accounts (${reason})`, { purged });
        }
    } catch (error) {
        console.error('[auth] purge_deleted_accounts_failed', {
            reason,
            message: error?.message
        });
    }
}

connectDatabase()
.then(ensureSeedAdmin)
.then(() => runAccountPurge('startup'))
.then(() => {
    app.listen(port, () => {
        console.log(`API rodando na porta ${port}`);
    });
    setInterval(() => {
        runAccountPurge('interval');
    }, purgeIntervalMs);
})
.catch((error) => {
    console.error('Falha ao iniciar aplicação:', error);
    process.exit(1);
});
