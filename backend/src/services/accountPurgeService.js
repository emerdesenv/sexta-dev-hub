import { Op } from 'sequelize';
import { User, UserCollectible } from '../models/index.js';

const DEFAULT_PURGE_DAYS = 30;

function getPurgeDays() {
    const raw = Number(process.env.ACCOUNT_PURGE_DAYS || DEFAULT_PURGE_DAYS);
    if (!Number.isFinite(raw) || raw < 1) return DEFAULT_PURGE_DAYS;
    return Math.floor(raw);
}

export function buildPurgeDate(baseDate = new Date()) {
    const purgeAt = new Date(baseDate);
    purgeAt.setDate(purgeAt.getDate() + getPurgeDays());
    return purgeAt;
}

export async function purgeExpiredDeletedAccounts() {
    const now = new Date();
    const users = await User.findAll({
        where: {
            deleted_at: { [Op.ne]: null },
            purge_after: { [Op.lte]: now }
        },
        attributes: ['id', 'username']
    });

    let purgedCount = 0;
    for (const user of users) {
        await UserCollectible.destroy({ where: { user_id: user.id } });
        await user.destroy();
        purgedCount += 1;
    }

    return purgedCount;
}
