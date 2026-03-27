import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../models/index.js', () => ({
    User: {
        findAll: vi.fn()
    },
    UserCollectible: {
        destroy: vi.fn()
    }
}));

import {
    buildPurgeDate,
    purgeExpiredDeletedAccounts
} from '../accountPurgeService.js';
import { User, UserCollectible } from '../../models/index.js';

describe('accountPurgeService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        delete process.env.ACCOUNT_PURGE_DAYS;
    });

    it('buildPurgeDate respeita ACCOUNT_PURGE_DAYS quando valido', () => {
        process.env.ACCOUNT_PURGE_DAYS = '10';
        const baseDate = new Date('2026-03-01T00:00:00.000Z');

        const purgeDate = buildPurgeDate(baseDate);

        expect(purgeDate.toISOString()).toBe('2026-03-11T00:00:00.000Z');
    });

    it('buildPurgeDate usa fallback padrao quando ACCOUNT_PURGE_DAYS e invalido', () => {
        process.env.ACCOUNT_PURGE_DAYS = '0';
        const baseDate = new Date('2026-03-01T00:00:00.000Z');

        const purgeDate = buildPurgeDate(baseDate);

        expect(purgeDate.toISOString()).toBe('2026-03-31T00:00:00.000Z');
    });

    it('purgeExpiredDeletedAccounts remove relacionamentos e contas expiradas', async () => {
        const firstUser = { id: 7, username: 'deleted.7', destroy: vi.fn(async () => {}) };
        const secondUser = { id: 8, username: 'deleted.8', destroy: vi.fn(async () => {}) };
        User.findAll.mockResolvedValueOnce([firstUser, secondUser]);

        const purgedCount = await purgeExpiredDeletedAccounts();

        expect(User.findAll).toHaveBeenCalledTimes(1);
        expect(UserCollectible.destroy).toHaveBeenCalledTimes(2);
        expect(UserCollectible.destroy).toHaveBeenNthCalledWith(1, { where: { user_id: 7 } });
        expect(UserCollectible.destroy).toHaveBeenNthCalledWith(2, { where: { user_id: 8 } });
        expect(firstUser.destroy).toHaveBeenCalledTimes(1);
        expect(secondUser.destroy).toHaveBeenCalledTimes(1);
        expect(purgedCount).toBe(2);
    });

    it('purgeExpiredDeletedAccounts retorna zero quando nao ha contas para purge', async () => {
        User.findAll.mockResolvedValueOnce([]);

        const purgedCount = await purgeExpiredDeletedAccounts();

        expect(UserCollectible.destroy).not.toHaveBeenCalled();
        expect(purgedCount).toBe(0);
    });
});
