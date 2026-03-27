import { Op } from 'sequelize';
import { CollectibleItem, Episode, LimitedEvent, UserCollectible, UserEpisodeProgress, UserLimitedEventClaim } from '../models/index.js';
import { z } from 'zod';

function nowUtc() {
    return new Date();
}

function toPublicEventPayload(event, { claimed = false, eligible = false } = {}) {
    if (!event) return null;
    const reward = event.rewardItem || null;
    const episode = event.episode || null;
    return {
        id: event.id,
        key: event.key,
        title: event.title,
        description: event.description,
        startAt: event.start_at,
        endAt: event.end_at,
        episodeId: event.episode_id,
        episodeSlug: episode?.slug || null,
        requiresCompletion: Boolean(event.episode_id),
        eligible,
        claimed,
        reward: reward
            ? {
                id: reward.id,
                key: reward.key,
                title: reward.title,
                type: reward.type,
                rarity: reward.rarity,
                icon: reward.icon
            }
            : null
    };
}

async function isEligibleForEvent(userId, event) {
    if (!userId) return false;
    if (!event?.episode_id) return true;
    const progress = await UserEpisodeProgress.findOne({
        where: { user_id: userId, episode_id: Number(event.episode_id) },
        attributes: ['id']
    });
    return Boolean(progress);
}

export async function getActiveEvent(req, res) {
    const now = nowUtc();
    const event = await LimitedEvent.findOne({
        where: {
            is_active: true,
            start_at: { [Op.lte]: now },
            end_at: { [Op.gt]: now }
        },
        include: [
            { model: CollectibleItem, as: 'rewardItem' },
            { model: Episode, attributes: ['id', 'slug', 'title'], required: false }
        ],
        order: [['start_at', 'DESC']]
    });

    if (!event) return res.json({ event: null });

    if (!req.user?.id) {
        return res.json({ event: toPublicEventPayload(event, { claimed: false, eligible: false }) });
    }

    const claim = await UserLimitedEventClaim.findOne({
        where: { user_id: req.user.id, event_id: event.id },
        attributes: ['id']
    });
    const eligible = await isEligibleForEvent(req.user.id, event);
    return res.json({ event: toPublicEventPayload(event, { claimed: Boolean(claim), eligible }) });
}

export async function claimEvent(req, res) {
    const eventId = Number(req.params.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ message: 'ID de evento inválido.' });
    }

    const now = nowUtc();
    const event = await LimitedEvent.findOne({
        where: {
            id: eventId,
            is_active: true,
            start_at: { [Op.lte]: now },
            end_at: { [Op.gt]: now }
        },
        include: [
            { model: CollectibleItem, as: 'rewardItem' },
            { model: Episode, attributes: ['id', 'slug', 'title'], required: false }
        ]
    });
    if (!event) {
        return res.status(404).json({ message: 'Evento não encontrado ou não está ativo.' });
    }

    const existing = await UserLimitedEventClaim.findOne({
        where: { user_id: req.user.id, event_id: event.id },
        attributes: ['id']
    });
    if (existing) {
        return res.status(409).json({ message: 'Você já resgatou este evento.' });
    }

    const eligible = await isEligibleForEvent(req.user.id, event);
    if (!eligible) {
        return res.status(403).json({ message: 'Conclua a tarefa do evento antes de resgatar o item.' });
    }

    // Idempotência adicional via unique constraint no banco.
    await UserLimitedEventClaim.create({
        user_id: req.user.id,
        event_id: event.id
    });

    if (event.rewardItem) {
        await UserCollectible.create({
            user_id: req.user.id,
            item_id: event.rewardItem.id,
            source_event_id: event.id
        });
    }

    return res.status(201).json({
        claimed: true,
        event: toPublicEventPayload(event, { claimed: true, eligible: true })
    });
}

export async function getMyCollectibles(req, res) {
    const rows = await UserCollectible.findAll({
        where: { user_id: req.user.id },
        include: [
            { model: CollectibleItem, attributes: ['id', 'key', 'title', 'type', 'rarity', 'icon'] },
            { model: LimitedEvent, attributes: ['id', 'key', 'title'], required: false }
        ],
        order: [['acquired_at', 'DESC']]
    });

    return res.json({
        items: rows.map((row) => ({
            id: row.id,
            acquiredAt: row.acquired_at,
            item: row.collectible_item
                ? {
                    id: row.collectible_item.id,
                    key: row.collectible_item.key,
                    title: row.collectible_item.title,
                    type: row.collectible_item.type,
                    rarity: row.collectible_item.rarity,
                    icon: row.collectible_item.icon
                }
                : null,
            sourceEvent: row.limited_event
                ? {
                    id: row.limited_event.id,
                    key: row.limited_event.key,
                    title: row.limited_event.title
                }
                : null
        }))
    });
}

const createItemSchema = z.object({
    key: z.string().min(3).max(80),
    title: z.string().min(3).max(120),
    type: z.enum(['badge', 'avatar_item']).optional().default('badge'),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional().default('rare'),
    icon: z.string().max(255).optional().nullable()
});

const createEventSchema = z.object({
    key: z.string().min(3).max(80),
    title: z.string().min(3).max(160),
    description: z.string().max(255).optional().nullable(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    isActive: z.coerce.boolean().optional().default(true),
    episodeId: z.coerce.number().int().positive().optional().nullable(),
    rewardItemId: z.coerce.number().int().positive()
}).refine((v) => v.endAt > v.startAt, {
    message: 'A data final deve ser maior que a data inicial.',
    path: ['endAt']
});

export async function adminListItems(req, res) {
    const rows = await CollectibleItem.findAll({
        order: [['updated_at', 'DESC'], ['id', 'DESC']]
    });
    return res.json(rows.map((row) => ({
        id: row.id,
        key: row.key,
        title: row.title,
        type: row.type,
        rarity: row.rarity,
        icon: row.icon,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    })));
}

export async function adminCreateItem(req, res) {
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Dados inválidos para criar item.' });
    }
    const data = parsed.data;
    const key = String(data.key).trim().toLowerCase();
    const existing = await CollectibleItem.findOne({ where: { key } });
    if (existing) {
        return res.status(409).json({ message: 'Já existe um item com essa key.' });
    }
    const item = await CollectibleItem.create({
        key,
        title: data.title.trim(),
        type: data.type,
        rarity: data.rarity,
        icon: data.icon ? String(data.icon).trim() : null
    });
    return res.status(201).json({
        id: item.id,
        key: item.key,
        title: item.title,
        type: item.type,
        rarity: item.rarity,
        icon: item.icon
    });
}

export async function adminListEvents(req, res) {
    const rows = await LimitedEvent.findAll({
        include: [
            { model: CollectibleItem, as: 'rewardItem' },
            { model: Episode, attributes: ['id', 'slug', 'title'], required: false }
        ],
        order: [['start_at', 'DESC']]
    });
    return res.json(rows.map((event) => ({
        id: event.id,
        key: event.key,
        title: event.title,
        description: event.description,
        startAt: event.start_at,
        endAt: event.end_at,
        isActive: Boolean(event.is_active),
        episode: event.episode ? { id: event.episode.id, slug: event.episode.slug, title: event.episode.title } : null,
        reward: event.rewardItem
            ? { id: event.rewardItem.id, key: event.rewardItem.key, title: event.rewardItem.title, rarity: event.rewardItem.rarity, icon: event.rewardItem.icon }
            : null
    })));
}

export async function adminCreateEvent(req, res) {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return res.status(400).json({ message: issue?.message || 'Dados inválidos para criar evento.' });
    }
    const data = parsed.data;
    const key = String(data.key).trim().toLowerCase();
    const existing = await LimitedEvent.findOne({ where: { key } });
    if (existing) {
        return res.status(409).json({ message: 'Já existe um evento com essa key.' });
    }

    const reward = await CollectibleItem.findByPk(Number(data.rewardItemId));
    if (!reward) {
        return res.status(400).json({ message: 'Item de recompensa inválido.' });
    }

    if (data.episodeId) {
        const episode = await Episode.findByPk(Number(data.episodeId));
        if (!episode) {
            return res.status(400).json({ message: 'Episódio inválido.' });
        }
    }

    const event = await LimitedEvent.create({
        key,
        title: data.title.trim(),
        description: data.description ? String(data.description).trim() : null,
        start_at: data.startAt,
        end_at: data.endAt,
        is_active: data.isActive,
        episode_id: data.episodeId ? Number(data.episodeId) : null,
        reward_item_id: Number(data.rewardItemId)
    });

    const full = await LimitedEvent.findByPk(event.id, {
        include: [
            { model: CollectibleItem, as: 'rewardItem' },
            { model: Episode, attributes: ['id', 'slug', 'title'], required: false }
        ]
    });

    return res.status(201).json({
        id: full.id,
        key: full.key,
        title: full.title,
        description: full.description,
        startAt: full.start_at,
        endAt: full.end_at,
        isActive: Boolean(full.is_active),
        episode: full.episode ? { id: full.episode.id, slug: full.episode.slug, title: full.episode.title } : null,
        reward: full.rewardItem ? { id: full.rewardItem.id, key: full.rewardItem.key, title: full.rewardItem.title, rarity: full.rewardItem.rarity, icon: full.rewardItem.icon } : null
    });
}


