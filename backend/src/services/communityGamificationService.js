import { Op } from 'sequelize';
import {
    CollectibleItem,
    CommunityReply,
    CommunityTopic,
    GamificationEvent,
    UserCollectible,
    UserGamification
} from '../models/index.js';

const COMMUNITY_REWARD_EVENT_TYPES = {
    TOPIC_REWARDED: 'community_topic_rewarded',
    REPLY_REWARDED: 'community_reply_rewarded',
    REPLY_UPVOTED_REWARDED: 'community_reply_upvoted_rewarded',
    BEST_REPLY_REWARDED: 'community_best_reply_rewarded'
};

const COMMUNITY_REVERSAL_EVENT_TYPE = 'community_reward_reversed';
const COMMUNITY_COLLECTIBLE_KEYS = {
    FIRST_TOPIC: 'community_first_topic',
    HELPFUL_ENGINEER: 'community_helpful_engineer'
};

function envInt(name, fallback) {
    const raw = Number(process.env[name]);
    return Number.isFinite(raw) ? Math.trunc(raw) : fallback;
}

function envBool(name, fallback = true) {
    const raw = String(process.env[name] ?? '').trim().toLowerCase();
    if (!raw) return fallback;
    if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
    if (['0', 'false', 'no', 'off'].includes(raw)) return false;
    return fallback;
}

function xpNeededForNextLevel(level) {
    return 100 + (level - 1) * 60;
}

function buildLevelState(xpTotal) {
    let level = 1;
    let remaining = xpTotal;
    let needed = xpNeededForNextLevel(level);
    while (remaining >= needed) {
        remaining -= needed;
        level += 1;
        needed = xpNeededForNextLevel(level);
    }
    return { level };
}

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

async function ensureProfile(userId) {
    const [profile] = await UserGamification.findOrCreate({
        where: { user_id: Number(userId) },
        defaults: { user_id: Number(userId) }
    });
    return profile;
}

function getConfig() {
    return {
        enabled: envBool('COMMUNITY_GAMIFICATION_ENABLED', true),
        topic: {
            xp: envInt('COMMUNITY_GAMIFICATION_TOPIC_XP', 8),
            coins: envInt('COMMUNITY_GAMIFICATION_TOPIC_COINS', 1),
            dailyCap: Math.max(0, envInt('COMMUNITY_GAMIFICATION_DAILY_CAP_TOPIC', 2)),
            cooldownSec: Math.max(0, envInt('COMMUNITY_GAMIFICATION_COOLDOWN_TOPIC_SECONDS', 3600)),
            minChars: Math.max(1, envInt('COMMUNITY_GAMIFICATION_MIN_TOPIC_CHARS', 40))
        },
        reply: {
            xp: envInt('COMMUNITY_GAMIFICATION_REPLY_XP', 5),
            coins: envInt('COMMUNITY_GAMIFICATION_REPLY_COINS', 1),
            dailyCap: Math.max(0, envInt('COMMUNITY_GAMIFICATION_DAILY_CAP_REPLY', 6)),
            cooldownSec: Math.max(0, envInt('COMMUNITY_GAMIFICATION_COOLDOWN_REPLY_SECONDS', 180)),
            minChars: Math.max(1, envInt('COMMUNITY_GAMIFICATION_MIN_REPLY_CHARS', 20))
        },
        upvote: {
            xp: envInt('COMMUNITY_GAMIFICATION_UPVOTE_XP', 3),
            coins: envInt('COMMUNITY_GAMIFICATION_UPVOTE_COINS', 0),
            dailyCap: Math.max(0, envInt('COMMUNITY_GAMIFICATION_DAILY_CAP_UPVOTE_RECEIVED', 20)),
            cooldownSec: Math.max(0, envInt('COMMUNITY_GAMIFICATION_COOLDOWN_UPVOTE_SECONDS', 0))
        },
        bestReply: {
            xp: envInt('COMMUNITY_GAMIFICATION_BEST_REPLY_XP', 15),
            coins: envInt('COMMUNITY_GAMIFICATION_BEST_REPLY_COINS', 3),
            dailyCap: Math.max(0, envInt('COMMUNITY_GAMIFICATION_DAILY_CAP_BEST_REPLY', 2)),
            cooldownSec: Math.max(0, envInt('COMMUNITY_GAMIFICATION_COOLDOWN_BEST_REPLY_SECONDS', 0))
        }
    };
}

async function reachedDailyCap(userId, rewardEventType, dailyCap) {
    if (dailyCap <= 0) return true;
    const count = await GamificationEvent.count({
        where: {
            user_id: Number(userId),
            event_type: rewardEventType,
            created_at: { [Op.gte]: startOfToday() }
        }
    });
    return count >= dailyCap;
}

async function withinCooldown(userId, rewardEventType, cooldownSec) {
    if (cooldownSec <= 0) return false;
    const latest = await GamificationEvent.findOne({
        where: {
            user_id: Number(userId),
            event_type: rewardEventType
        },
        order: [['created_at', 'DESC']],
        attributes: ['created_at']
    });
    if (!latest?.created_at) return false;
    const elapsedMs = Date.now() - new Date(latest.created_at).getTime();
    return elapsedMs < cooldownSec * 1000;
}

async function grantReward({ userId, eventType, referenceId, xpDelta, coinsDelta, metadata, caps }) {
    if (!userId || userId <= 0) return { awarded: false, reason: 'invalid_user' };
    const cfg = getConfig();
    if (!cfg.enabled) return { awarded: false, reason: 'disabled' };
    if (xpDelta === 0 && coinsDelta === 0) return { awarded: false, reason: 'empty_reward' };

    if (await reachedDailyCap(userId, eventType, caps.dailyCap)) {
        return { awarded: false, reason: 'daily_cap_reached' };
    }
    if (await withinCooldown(userId, eventType, caps.cooldownSec)) {
        return { awarded: false, reason: 'cooldown_active' };
    }

    const profile = await ensureProfile(userId);
    const nextXp = Number(profile.xp_total || 0) + xpDelta;
    const nextCoins = Number(profile.coins || 0) + coinsDelta;
    const levelState = buildLevelState(Math.max(0, nextXp));
    await profile.update({
        xp_total: Math.max(0, nextXp),
        coins: Math.max(0, nextCoins),
        level: levelState.level
    });

    await GamificationEvent.create({
        user_id: Number(userId),
        event_type: eventType,
        reference_id: referenceId ? String(referenceId) : null,
        xp_delta: xpDelta,
        coins_delta: coinsDelta,
        metadata
    });

    return { awarded: true };
}

async function ensureCollectibleItem({ key, title, rarity = 'rare', icon = null }) {
    const [item] = await CollectibleItem.findOrCreate({
        where: { key },
        defaults: { key, title, rarity, type: 'badge', icon }
    });
    return item;
}

async function grantCollectibleIfMissing({ userId, itemId }) {
    const existing = await UserCollectible.findOne({
        where: {
            user_id: Number(userId),
            item_id: Number(itemId),
            source_event_id: null
        },
        attributes: ['id']
    });
    if (existing) return false;
    await UserCollectible.create({
        user_id: Number(userId),
        item_id: Number(itemId),
        source_event_id: null
    });
    return true;
}

async function maybeGrantCommunityCollectibles({ userId }) {
    const [topicCount, replyCount] = await Promise.all([
        CommunityTopic.count({ where: { author_user_id: Number(userId) } }),
        CommunityReply.count({ where: { author_user_id: Number(userId), is_hidden: false } })
    ]);

    if (topicCount >= 1) {
        const item = await ensureCollectibleItem({
            key: COMMUNITY_COLLECTIBLE_KEYS.FIRST_TOPIC,
            title: 'Microfone da Comunidade',
            rarity: 'rare'
        });
        await grantCollectibleIfMissing({ userId, itemId: item.id });
    }

    if (replyCount >= 10) {
        const item = await ensureCollectibleItem({
            key: COMMUNITY_COLLECTIBLE_KEYS.HELPFUL_ENGINEER,
            title: 'Engrenagem de Ajuda',
            rarity: 'epic'
        });
        await grantCollectibleIfMissing({ userId, itemId: item.id });
    }
}

export async function awardForTopicCreated({ userId, topicId, content }) {
    const cfg = getConfig();
    if (String(content || '').trim().length < cfg.topic.minChars) {
        return { awarded: false, reason: 'topic_too_short' };
    }
    const granted = await grantReward({
        userId,
        eventType: COMMUNITY_REWARD_EVENT_TYPES.TOPIC_REWARDED,
        referenceId: topicId,
        xpDelta: cfg.topic.xp,
        coinsDelta: cfg.topic.coins,
        metadata: { source: 'community_topic_created' },
        caps: cfg.topic
    });
    if (granted.awarded) {
        await maybeGrantCommunityCollectibles({ userId });
    }
    return granted;
}

export async function awardForReplyCreated({ userId, replyId, topicId, content }) {
    const cfg = getConfig();
    if (String(content || '').trim().length < cfg.reply.minChars) {
        return { awarded: false, reason: 'reply_too_short' };
    }
    const granted = await grantReward({
        userId,
        eventType: COMMUNITY_REWARD_EVENT_TYPES.REPLY_REWARDED,
        referenceId: replyId,
        xpDelta: cfg.reply.xp,
        coinsDelta: cfg.reply.coins,
        metadata: { source: 'community_reply_created', topicId: Number(topicId) },
        caps: cfg.reply
    });
    if (granted.awarded) {
        await maybeGrantCommunityCollectibles({ userId });
    }
    return granted;
}

export async function awardForReplyUpvoted({ userId, replyId, topicId, voterUserId }) {
    const cfg = getConfig();
    if (Number(userId) === Number(voterUserId)) {
        return { awarded: false, reason: 'self_vote_ignored' };
    }
    return grantReward({
        userId,
        eventType: COMMUNITY_REWARD_EVENT_TYPES.REPLY_UPVOTED_REWARDED,
        referenceId: replyId,
        xpDelta: cfg.upvote.xp,
        coinsDelta: cfg.upvote.coins,
        metadata: {
            source: 'community_reply_upvoted',
            topicId: Number(topicId),
            voterUserId: Number(voterUserId)
        },
        caps: cfg.upvote
    });
}

export async function awardForBestReply({ userId, replyId, topicId, selectedByUserId }) {
    const cfg = getConfig();
    return grantReward({
        userId,
        eventType: COMMUNITY_REWARD_EVENT_TYPES.BEST_REPLY_REWARDED,
        referenceId: replyId,
        xpDelta: cfg.bestReply.xp,
        coinsDelta: cfg.bestReply.coins,
        metadata: {
            source: 'community_best_reply_selected',
            topicId: Number(topicId),
            selectedByUserId: Number(selectedByUserId)
        },
        caps: cfg.bestReply
    });
}

export async function reverseRewardsForModeratedContent({ targetType, targetId, moderatorUserId, reason = null }) {
    const targetTypeSafe = String(targetType || '').trim().toLowerCase();
    const targetIdSafe = Number(targetId);
    if (!['topic', 'reply'].includes(targetTypeSafe) || !Number.isInteger(targetIdSafe) || targetIdSafe <= 0) {
        return { reversedEvents: 0, reversedXp: 0, reversedCoins: 0 };
    }

    if (
        !GamificationEvent
        || typeof GamificationEvent.findAll !== 'function'
        || typeof GamificationEvent.findOne !== 'function'
        || typeof GamificationEvent.create !== 'function'
    ) {
        return { reversedEvents: 0, reversedXp: 0, reversedCoins: 0 };
    }

    let candidateEvents = [];
    if (targetTypeSafe === 'topic') {
        candidateEvents = await GamificationEvent.findAll({
            where: {
                event_type: COMMUNITY_REWARD_EVENT_TYPES.TOPIC_REWARDED,
                reference_id: String(targetIdSafe)
            }
        });
    } else {
        candidateEvents = await GamificationEvent.findAll({
            where: {
                event_type: {
                    [Op.in]: [
                        COMMUNITY_REWARD_EVENT_TYPES.REPLY_REWARDED,
                        COMMUNITY_REWARD_EVENT_TYPES.REPLY_UPVOTED_REWARDED,
                        COMMUNITY_REWARD_EVENT_TYPES.BEST_REPLY_REWARDED
                    ]
                },
                reference_id: String(targetIdSafe)
            }
        });
    }

    let reversedEvents = 0;
    let reversedXp = 0;
    let reversedCoins = 0;

    for (const evt of candidateEvents) {
        if (!evt || (Number(evt.xp_delta || 0) === 0 && Number(evt.coins_delta || 0) === 0)) continue;
        const alreadyReversed = await GamificationEvent.findOne({
            where: {
                event_type: COMMUNITY_REVERSAL_EVENT_TYPE,
                reference_id: String(evt.id)
            },
            attributes: ['id']
        });
        if (alreadyReversed) continue;

        const profile = await ensureProfile(evt.user_id);
        const nextXp = Math.max(0, Number(profile.xp_total || 0) - Number(evt.xp_delta || 0));
        const nextCoins = Math.max(0, Number(profile.coins || 0) - Number(evt.coins_delta || 0));
        const levelState = buildLevelState(nextXp);
        await profile.update({
            xp_total: nextXp,
            coins: nextCoins,
            level: levelState.level
        });

        await GamificationEvent.create({
            user_id: Number(evt.user_id),
            event_type: COMMUNITY_REVERSAL_EVENT_TYPE,
            reference_id: String(evt.id),
            xp_delta: -Number(evt.xp_delta || 0),
            coins_delta: -Number(evt.coins_delta || 0),
            metadata: {
                targetType: targetTypeSafe,
                targetId: targetIdSafe,
                moderatedByUserId: Number(moderatorUserId || 0) || null,
                reason: reason || null
            }
        });

        reversedEvents += 1;
        reversedXp += Number(evt.xp_delta || 0);
        reversedCoins += Number(evt.coins_delta || 0);
    }

    return { reversedEvents, reversedXp, reversedCoins };
}
