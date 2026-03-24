import { Op } from 'sequelize';
import {
    Episode,
    EpisodeAttempt,
    GamificationEvent,
    User,
    UserEpisodeProgress,
    UserGamification,
    UserMissionClaim,
    UserRewardRedemption
} from '../models/index.js';

const XP_PER_EPISODE = 40;
const COINS_PER_EPISODE = 12;
const DAILY_LOGIN_XP = 10;
const DAILY_LOGIN_COINS = 5;
const REWARDS = [
    { key: 'theme_neon', title: 'Tema Neon', costCoins: 120, category: 'visual' },
    { key: 'profile_pro', title: 'Selo Perfil Pro', costCoins: 220, category: 'visual' },
    { key: 'streak_shield', title: 'Proteção de streak', costCoins: 250, category: 'benefit' },
    { key: 'early_access', title: 'Acesso antecipado', costCoins: 500, category: 'content' }
];

function formatDateOnly(date) {
    return date.toISOString().slice(0, 10);
}

function getYesterdayDateOnly() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return formatDateOnly(d);
}

function getStartOfWeek(date) {
    const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = startOfToday.getDay();
    const offset = day === 0 ? 6 : day - 1;
    startOfToday.setDate(startOfToday.getDate() - offset);
    return startOfToday;
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

    return {
        level,
        xpCurrentLevel: remaining,
        xpNextLevel: needed
    };
}

async function ensureProfile(userId) {
    const [profile] = await UserGamification.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId }
    });
    return profile;
}

async function getProgressCounters(userId) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [completedEpisodes, todayCompleted, weekCompleted, monthCompleted] = await Promise.all([
        UserEpisodeProgress.count({ where: { user_id: userId } }),
        UserEpisodeProgress.count({
            where: {
                user_id: userId,
                completed_at: { [Op.gte]: startOfToday }
            }
        }),
        UserEpisodeProgress.count({
            where: {
                user_id: userId,
                completed_at: { [Op.gte]: startOfWeek }
            }
        }),
        UserEpisodeProgress.count({
            where: {
                user_id: userId,
                completed_at: { [Op.gte]: startOfMonth }
            }
        })
    ]);

    return { completedEpisodes, todayCompleted, weekCompleted, monthCompleted };
}

function buildMissions(counters, claimState, now = new Date()) {
    const today = formatDateOnly(now);
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return [
        {
            key: 'daily_one_episode',
            title: 'Assistir 1 episódio hoje',
            progress: Math.min(counters.todayCompleted, 1),
            target: 1,
            rewardXp: 80,
            rewardCoins: 15,
            status: counters.todayCompleted >= 1 ? 'completed' : 'in_progress',
            periodKey: today,
            claimed: claimState.has(`daily_one_episode:${today}`)
        },
        {
            key: 'monthly_two_episodes',
            title: 'Concluir 2 episódios no mês',
            progress: Math.min(counters.monthCompleted, 2),
            target: 2,
            rewardXp: 250,
            rewardCoins: 40,
            status: counters.monthCompleted >= 2 ? 'completed' : 'in_progress',
            periodKey: monthKey,
            claimed: claimState.has(`monthly_two_episodes:${monthKey}`)
        },
        {
            key: 'collector_five_episodes',
            title: 'Concluir 5 episódios no total',
            progress: Math.min(counters.completedEpisodes, 5),
            target: 5,
            rewardXp: 180,
            rewardCoins: 30,
            status: counters.completedEpisodes >= 5 ? 'completed' : 'in_progress',
            periodKey: 'lifetime',
            claimed: claimState.has('collector_five_episodes:lifetime')
        }
    ];
}

function buildBadges(counters, streakDays) {
    return [
        {
            key: 'first_episode',
            title: 'Primeiro Episodio',
            unlocked: counters.completedEpisodes >= 1
        },
        {
            key: 'constancy',
            title: 'Constancia',
            unlocked: streakDays >= 7,
            progress: Math.min(streakDays, 7),
            target: 7
        },
        {
            key: 'marathon',
            title: 'Maratonista',
            unlocked: counters.weekCompleted >= 5,
            progress: Math.min(counters.weekCompleted, 5),
            target: 5
        }
    ];
}

async function buildGamificationSnapshot(userId) {
    const profile = await ensureProfile(userId);
    const counters = await getProgressCounters(userId);
    const claims = await UserMissionClaim.findAll({
        where: { user_id: userId },
        attributes: ['mission_key', 'period_key']
    });
    const claimState = new Set(claims.map((c) => `${c.mission_key}:${c.period_key}`));
    const redemptions = await UserRewardRedemption.findAll({
        where: { user_id: userId },
        attributes: ['reward_key']
    });
    const ownedRewardKeys = new Set(redemptions.map((item) => item.reward_key));
    const levelState = buildLevelState(profile.xp_total);

    if (profile.level !== levelState.level) {
        await profile.update({ level: levelState.level });
    }

    return {
        profile: {
            level: levelState.level,
            xpTotal: profile.xp_total,
            xpCurrentLevel: levelState.xpCurrentLevel,
            xpNextLevel: levelState.xpNextLevel,
            coins: profile.coins,
            streakDays: profile.streak_days,
            activeTheme: profile.active_theme,
            profileProEnabled: profile.profile_pro_enabled,
            streakShieldCount: profile.streak_shield_count,
            earlyAccessEnabled: profile.early_access_enabled
        },
        counters,
        missions: buildMissions(counters, claimState),
        badges: buildBadges(counters, profile.streak_days),
        rewards: REWARDS.map((reward) => ({
            ...reward,
            affordable: profile.coins >= reward.costCoins,
            owned: ownedRewardKeys.has(reward.key),
            active: reward.key === 'theme_neon' ? profile.active_theme === 'neon' : false
        }))
    };
}

async function registerEvent({
    userId,
    eventType,
    missionKey = null,
    rewardKey = null,
    referenceId = null,
    xpDelta = 0,
    coinsDelta = 0,
    metadata = null
}) {
    await GamificationEvent.create({
        user_id: userId,
        event_type: eventType,
        mission_key: missionKey,
        reward_key: rewardKey,
        reference_id: referenceId,
        xp_delta: xpDelta,
        coins_delta: coinsDelta,
        metadata
    });
}

function buildQuestionLookup(questions = []) {
    return new Map(questions.map((q, idx) => [String(q.id || `q_${idx}`), q]));
}

function evaluateQuiz(config = {}, rawAnswers = []) {
    const questions = Array.isArray(config.questions) ? config.questions : [];
    const answers = Array.isArray(rawAnswers) ? rawAnswers : [];
    const answerMap = new Map(answers.map((item) => [String(item.questionId), item.value]));
    const questionLookup = buildQuestionLookup(questions);
    let totalWeight = 0;
    let earnedWeight = 0;
    const feedback = [];

    for (const [questionId, question] of questionLookup.entries()) {
        const weight = Number(question.weight) > 0 ? Number(question.weight) : 1;
        totalWeight += weight;
        const expected = Number(question.correctOptionIndex);
        const submitted = Number(answerMap.get(questionId));
        const correct = Number.isInteger(expected) && submitted === expected;
        if (correct) earnedWeight += weight;
        feedback.push({
            questionId,
            correct,
            expected,
            submitted
        });
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    return { score, feedback };
}

function evaluateOrdering(config = {}, rawAnswers = {}) {
    const items = Array.isArray(config.items) ? config.items : [];
    const orderedItemIds = Array.isArray(rawAnswers?.orderedItemIds) ? rawAnswers.orderedItemIds : [];
    let correct = 0;
    const details = [];

    items.forEach((item, index) => {
        const expectedId = String(item.id);
        const submittedId = String(orderedItemIds[index] || '');
        if (submittedId === expectedId) correct += 1;
        details.push({
            itemId: expectedId,
            label: String(item.label || `Item ${index + 1}`),
            expectedPosition: index + 1,
            submittedPosition: submittedId
                ? orderedItemIds.findIndex((id) => String(id) === expectedId) + 1
                : null,
            correct: submittedId === expectedId
        });
    });

    const score = items.length ? Math.round((correct / items.length) * 100) : 0;
    return {
        score,
        feedback: [{ correctItems: correct, totalItems: items.length, details }]
    };
}

function normalizeText(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function evaluateOpenText(config = {}, rawAnswers = {}) {
    const text = String(rawAnswers?.text || '').trim();
    const normalizedText = normalizeText(text);
    const minLength = Number(config?.minLength) > 0 ? Number(config.minLength) : 15;
    const minWords = Number(config?.minWords) > 0 ? Number(config.minWords) : 0;
    const requiredKeywords = Array.isArray(config?.requiredKeywords)
        ? config.requiredKeywords
            .map((item) => String(item || '').trim())
            .filter(Boolean)
        : [];

    const words = text.split(/\s+/).filter(Boolean);
    const lengthAccepted = text.length >= minLength;
    const wordsAccepted = minWords === 0 || words.length >= minWords;
    const matchedKeywords = requiredKeywords.filter((keyword) => normalizedText.includes(normalizeText(keyword)));
    const keywordCoverage = requiredKeywords.length === 0 ? 1 : matchedKeywords.length / requiredKeywords.length;
    const keywordsAccepted = requiredKeywords.length === 0 || matchedKeywords.length === requiredKeywords.length;

    const weightedScore = (
        (lengthAccepted ? 1 : Math.min(text.length / minLength, 1)) * 0.4
        + (minWords === 0 ? 1 : Math.min(words.length / minWords, 1)) * 0.3
        + keywordCoverage * 0.3
    ) * 100;
    const score = Math.round(weightedScore);

    return {
        score,
        feedback: [{
            minLength,
            currentLength: text.length,
            minWords,
            currentWords: words.length,
            requiredKeywords,
            matchedKeywords,
            accepted: lengthAccepted && wordsAccepted && keywordsAccepted
        }]
    };
}

function evaluateAssessment(episode, answers) {
    if (episode.assessment_mode === 'quiz') return evaluateQuiz(episode.assessment_config || {}, answers);
    if (episode.assessment_mode === 'mini_game') return evaluateOrdering(episode.assessment_config || {}, answers);
    return evaluateOpenText(episode.assessment_config || {}, answers);
}

async function applyDailyLoginBonus(profile) {
    const today = formatDateOnly(new Date());
    const yesterday = getYesterdayDateOnly();
    const last = profile.last_activity_date;

    let streakDays = profile.streak_days;
    let bonusXp = 0;
    let bonusCoins = 0;

    if (last !== today) {
        if (last === yesterday) {
            streakDays = profile.streak_days + 1;
        } else if (profile.streak_shield_count > 0 && profile.streak_days > 0) {
            // Consome um escudo para preservar a sequência após ausência.
            streakDays = profile.streak_days + 1;
            await profile.update({ streak_shield_count: profile.streak_shield_count - 1 });
            await registerEvent({
                userId: profile.user_id,
                eventType: 'streak_shield_used',
                coinsDelta: 0
            });
            profile.streak_shield_count -= 1;
        } else {
            streakDays = 1;
        }
        bonusXp = DAILY_LOGIN_XP;
        bonusCoins = DAILY_LOGIN_COINS;
    }

    await profile.update({
        streak_days: streakDays,
        last_activity_date: today,
        xp_total: profile.xp_total + bonusXp,
        coins: profile.coins + bonusCoins
    });

    if (bonusXp || bonusCoins) {
        await registerEvent({
            userId: profile.user_id,
            eventType: 'daily_login',
            xpDelta: bonusXp,
            coinsDelta: bonusCoins,
            referenceId: today
        });
    }

    return { bonusXp, bonusCoins, streakDays };
}

export async function getMyGamification(req, res) {
    const profile = await ensureProfile(req.user.id);
    const daily = await applyDailyLoginBonus(profile);
    const snapshot = await buildGamificationSnapshot(req.user.id);
    return res.json({ ...snapshot, dailyBonus: daily });
}

export async function getPreviewGamification(req, res) {
    const publishedEpisodes = await Episode.count({ where: { is_published: true } });
    return res.json({
        profile: {
            level: 4,
            xpTotal: 1240,
            xpCurrentLevel: 180,
            xpNextLevel: 280,
            coins: 320,
            streakDays: 7,
            activeTheme: 'default',
            profileProEnabled: false,
            streakShieldCount: 0,
            earlyAccessEnabled: false
        },
        counters: {
            completedEpisodes: 5,
            todayCompleted: 1,
            weekCompleted: 3,
            monthCompleted: 2
        },
        missions: [
            { key: 'daily_one_episode', title: 'Assistir 1 episódio hoje', progress: 1, target: 1, rewardXp: 80, rewardCoins: 15, status: 'completed', periodKey: formatDateOnly(new Date()), claimed: false },
            { key: 'monthly_two_episodes', title: 'Concluir 2 episódios no mês', progress: 2, target: 2, rewardXp: 250, rewardCoins: 40, status: 'completed', periodKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, claimed: false },
            { key: 'collector_five_episodes', title: `Concluir ${Math.min(5, publishedEpisodes)} episódios`, progress: Math.min(5, publishedEpisodes), target: 5, rewardXp: 180, rewardCoins: 30, status: publishedEpisodes >= 5 ? 'completed' : 'in_progress', periodKey: 'lifetime', claimed: false }
        ],
        badges: [
            { key: 'first_episode', title: 'Primeiro Episodio', unlocked: true },
            { key: 'constancy', title: 'Constancia', unlocked: true, progress: 7, target: 7 },
            { key: 'marathon', title: 'Maratonista', unlocked: false, progress: 3, target: 5 }
        ],
        leaderboard: [
            { username: 'ana.silva', level: 8, xpTotal: 3420 },
            { username: 'lucas.rocha', level: 7, xpTotal: 3110 },
            { username: 'carla.mendes', level: 7, xpTotal: 2980 }
        ],
        rewards: REWARDS.map((reward) => ({ ...reward, affordable: true, owned: false, active: false }))
    });
}

export async function completeEpisode(req, res) {
    const episodeId = Number(req.params.episodeId);
    if (!Number.isInteger(episodeId) || episodeId <= 0) {
        return res.status(400).json({ message: 'ID de episódio inválido.' });
    }

    const episode = await Episode.findByPk(episodeId);
    if (!episode || !episode.is_published) {
        return res.status(404).json({ message: 'Episódio não encontrado.' });
    }

    const existing = await UserEpisodeProgress.findOne({
        where: { user_id: req.user.id, episode_id: episodeId }
    });

    if (existing) {
        const snapshot = await buildGamificationSnapshot(req.user.id);
        return res.json({
            alreadyCompleted: true,
            awarded: { xp: 0, coins: 0 },
            snapshot
        });
    }

    await UserEpisodeProgress.create({
        user_id: req.user.id,
        episode_id: episodeId
    });

    const profile = await ensureProfile(req.user.id);
    const today = formatDateOnly(new Date());
    const yesterday = getYesterdayDateOnly();
    const last = profile.last_activity_date;
    const streakDays = last === today ? profile.streak_days : (last === yesterday ? profile.streak_days + 1 : 1);

    const xpReward = Number(episode.xp_reward) || XP_PER_EPISODE;
    await profile.update({
        xp_total: profile.xp_total + xpReward,
        coins: profile.coins + COINS_PER_EPISODE,
        streak_days: streakDays,
        last_activity_date: today
    });
    await registerEvent({
        userId: req.user.id,
        eventType: 'episode_completed',
        referenceId: String(episodeId),
        xpDelta: xpReward,
        coinsDelta: COINS_PER_EPISODE
    });

    const snapshot = await buildGamificationSnapshot(req.user.id);
    return res.status(201).json({
        alreadyCompleted: false,
        awarded: { xp: xpReward, coins: COINS_PER_EPISODE },
        snapshot
    });
}

export async function startAssessmentAttempt(req, res) {
    const episodeId = Number(req.params.episodeId);
    if (!Number.isInteger(episodeId) || episodeId <= 0) {
        return res.status(400).json({ message: 'ID de episódio inválido.' });
    }

    const episode = await Episode.findByPk(episodeId);
    if (!episode || !episode.is_published || episode.episode_type !== 'assessment') {
        return res.status(404).json({ message: 'Episódio avaliativo não encontrado.' });
    }

    const existingProgress = await UserEpisodeProgress.findOne({
        where: { user_id: req.user.id, episode_id: episodeId }
    });
    if (existingProgress) {
        return res.status(409).json({ message: 'Esse episódio avaliativo já foi concluído.' });
    }

    const attemptsCount = await EpisodeAttempt.count({
        where: { user_id: req.user.id, episode_id: episodeId }
    });
    if (attemptsCount >= episode.max_attempts) {
        return res.status(409).json({ message: 'Você atingiu o limite de tentativas desse episódio.' });
    }

    const attempt = await EpisodeAttempt.create({
        user_id: req.user.id,
        episode_id: episodeId,
        attempt_number: attemptsCount + 1
    });
    return res.status(201).json({
        attemptId: attempt.id,
        attemptNumber: attempt.attempt_number,
        maxAttempts: episode.max_attempts
    });
}

export async function submitAssessmentAttempt(req, res) {
    const episodeId = Number(req.params.episodeId);
    if (!Number.isInteger(episodeId) || episodeId <= 0) {
        return res.status(400).json({ message: 'ID de episódio inválido.' });
    }

    const episode = await Episode.findByPk(episodeId);
    if (!episode || !episode.is_published || episode.episode_type !== 'assessment') {
        return res.status(404).json({ message: 'Episódio avaliativo não encontrado.' });
    }

    const attempt = await EpisodeAttempt.findOne({
        where: {
            id: Number(req.body.attemptId),
            user_id: req.user.id,
            episode_id: episodeId,
            status: 'in_progress'
        }
    });

    if (!attempt) {
        return res.status(404).json({ message: 'Tentativa ativa não encontrada.' });
    }

    const answers = req.body.answers ?? {};
    const { score, feedback } = evaluateAssessment(episode, answers);
    const passed = score >= episode.passing_score;

    await attempt.update({
        answers,
        score,
        passed,
        status: 'graded',
        submitted_at: new Date()
    });

    if (!passed) {
        const attemptsCount = await EpisodeAttempt.count({
            where: { user_id: req.user.id, episode_id: episodeId }
        });
        return res.json({
            score,
            passed,
            xpEarned: 0,
            attemptsUsed: attemptsCount,
            maxAttempts: episode.max_attempts,
            locked: attemptsCount >= episode.max_attempts,
            feedback
        });
    }

    const existingProgress = await UserEpisodeProgress.findOne({
        where: { user_id: req.user.id, episode_id: episodeId }
    });
    if (!existingProgress) {
        await UserEpisodeProgress.create({
            user_id: req.user.id,
            episode_id: episodeId
        });

        const profile = await ensureProfile(req.user.id);
        const xpReward = Number(episode.xp_reward) || XP_PER_EPISODE;
        await profile.update({
            xp_total: profile.xp_total + xpReward,
            coins: profile.coins + COINS_PER_EPISODE
        });
        await registerEvent({
            userId: req.user.id,
            eventType: 'episode_assessment_passed',
            referenceId: String(episodeId),
            xpDelta: xpReward,
            coinsDelta: COINS_PER_EPISODE
        });
        const snapshot = await buildGamificationSnapshot(req.user.id);
        const attemptsCount = await EpisodeAttempt.count({
            where: { user_id: req.user.id, episode_id: episodeId }
        });
        return res.json({
            score,
            passed,
            xpEarned: xpReward,
            attemptsUsed: attemptsCount,
            maxAttempts: episode.max_attempts,
            locked: false,
            feedback,
            snapshot
        });
    }

    const attemptsCount = await EpisodeAttempt.count({
        where: { user_id: req.user.id, episode_id: episodeId }
    });
    return res.json({
        score,
        passed,
        xpEarned: 0,
        attemptsUsed: attemptsCount,
        maxAttempts: episode.max_attempts,
        locked: false,
        feedback
    });
}

export async function getLeaderboard(req, res) {
    const rows = await UserGamification.findAll({
        include: [{ model: User, attributes: ['username'] }],
        order: [['xp_total', 'DESC']],
        limit: 20
    });

    return res.json(rows.map((row) => ({
        username: row.user?.username || 'usuário',
        level: row.level,
        xpTotal: row.xp_total,
        coins: row.coins,
        profileProEnabled: Boolean(row.profile_pro_enabled)
    })));
}

export async function claimMission(req, res) {
    const missionKey = String(req.params.missionKey || '');
    const snapshot = await buildGamificationSnapshot(req.user.id);
    const mission = snapshot.missions.find((item) => item.key === missionKey);
    if (!mission) {
        return res.status(404).json({ message: 'Missão não encontrada.' });
    }
    if (mission.status !== 'completed') {
        return res.status(400).json({ message: 'Missão ainda não foi concluída.' });
    }
    if (mission.claimed) {
        return res.status(409).json({ message: 'Missão já resgatada neste período.' });
    }

    await UserMissionClaim.create({
        user_id: req.user.id,
        mission_key: mission.key,
        period_key: mission.periodKey
    });

    const profile = await ensureProfile(req.user.id);
    await profile.update({
        xp_total: profile.xp_total + mission.rewardXp,
        coins: profile.coins + mission.rewardCoins
    });
    await registerEvent({
        userId: req.user.id,
        eventType: 'mission_claimed',
        missionKey: mission.key,
        referenceId: mission.periodKey,
        xpDelta: mission.rewardXp,
        coinsDelta: mission.rewardCoins
    });

    const updated = await buildGamificationSnapshot(req.user.id);
    return res.json({
        awarded: { xp: mission.rewardXp, coins: mission.rewardCoins },
        snapshot: updated
    });
}

export async function redeemReward(req, res) {
    const rewardKey = String(req.params.rewardKey || '');
    const reward = REWARDS.find((item) => item.key === rewardKey);
    if (!reward) {
        return res.status(404).json({ message: 'Recompensa não encontrada.' });
    }

    const profile = await ensureProfile(req.user.id);
    if (profile.coins < reward.costCoins) {
        return res.status(400).json({ message: 'Moedas insuficientes para resgate.' });
    }

    if (reward.key === 'theme_neon' && profile.active_theme === 'neon') {
        return res.status(409).json({ message: 'Tema Neon já está ativo para este aluno.' });
    }
    if (reward.key === 'profile_pro' && profile.profile_pro_enabled) {
        return res.status(409).json({ message: 'Selo Perfil Pro já foi habilitado.' });
    }
    if (reward.key === 'early_access' && profile.early_access_enabled) {
        return res.status(409).json({ message: 'Acesso antecipado já está habilitado.' });
    }

    await profile.update({ coins: profile.coins - reward.costCoins });
    await UserRewardRedemption.create({
        user_id: req.user.id,
        reward_key: reward.key,
        cost_coins: reward.costCoins
    });
    await registerEvent({
        userId: req.user.id,
        eventType: 'reward_redeemed',
        rewardKey: reward.key,
        coinsDelta: -reward.costCoins
    });

    if (reward.key === 'theme_neon') {
        await profile.update({ active_theme: 'neon' });
    }
    if (reward.key === 'profile_pro') {
        await profile.update({ profile_pro_enabled: true });
    }
    if (reward.key === 'streak_shield') {
        await profile.update({ streak_shield_count: profile.streak_shield_count + 1 });
    }
    if (reward.key === 'early_access') {
        await profile.update({ early_access_enabled: true });
    }

    const snapshot = await buildGamificationSnapshot(req.user.id);
    return res.json({
        redeemed: reward,
        snapshot
    });
}

export async function activateReward(req, res) {
    const rewardKey = String(req.params.rewardKey || '');
    if (rewardKey !== 'theme_neon') {
        return res.status(400).json({ message: 'Apenas tema visual possui ativação manual no momento.' });
    }

    const profile = await ensureProfile(req.user.id);
    const redeemed = await UserRewardRedemption.findOne({
        where: { user_id: req.user.id, reward_key: rewardKey }
    });
    if (!redeemed) {
        return res.status(403).json({ message: 'Recompensa não resgatada para este aluno.' });
    }

    await profile.update({ active_theme: 'neon' });
    const snapshot = await buildGamificationSnapshot(req.user.id);
    return res.json({ snapshot });
}

export async function getAdminMetrics(req, res) {
    const [usersWithProfile, completedEpisodes, missionClaims, rewardsRedeemed, events, assessmentEpisodes, assessmentAttempts] = await Promise.all([
        UserGamification.count(),
        UserEpisodeProgress.count(),
        UserMissionClaim.count(),
        UserRewardRedemption.count(),
        GamificationEvent.findAll({
            order: [['created_at', 'DESC']],
            limit: 10,
            include: [{ model: User, attributes: ['username'] }]
        }),
        Episode.findAll({
            where: { episode_type: 'assessment' },
            attributes: ['id', 'title', 'assessment_mode', 'passing_score', 'max_attempts']
        }),
        EpisodeAttempt.findAll({
            where: { status: 'graded' },
            attributes: ['episode_id', 'user_id', 'attempt_number', 'score', 'passed', 'submitted_at']
        })
    ]);

    const assessmentByEpisode = new Map();
    for (const episode of assessmentEpisodes) {
        assessmentByEpisode.set(Number(episode.id), {
            episodeId: Number(episode.id),
            title: episode.title,
            mode: episode.assessment_mode,
            passingScore: Number(episode.passing_score || 0),
            maxAttempts: Number(episode.max_attempts || 1),
            attempts: []
        });
    }
    for (const attempt of assessmentAttempts) {
        const key = Number(attempt.episode_id);
        const item = assessmentByEpisode.get(key);
        if (!item) continue;
        item.attempts.push({
            userId: Number(attempt.user_id),
            attemptNumber: Number(attempt.attempt_number),
            score: Number(attempt.score || 0),
            passed: Boolean(attempt.passed),
            submittedAt: attempt.submitted_at
        });
    }

    const allUserIds = new Set();
    for (const row of assessmentByEpisode.values()) {
        for (const attempt of row.attempts) {
            allUserIds.add(attempt.userId);
        }
    }
    const users = allUserIds.size
        ? await User.findAll({
            where: { id: Array.from(allUserIds) },
            attributes: ['id', 'username']
        })
        : [];
    const usernameById = new Map(users.map((user) => [Number(user.id), user.username]));

    const episodesMetrics = [];
    for (const row of assessmentByEpisode.values()) {
        const byUser = new Map();
        for (const attempt of row.attempts) {
            const list = byUser.get(attempt.userId) || [];
            list.push(attempt);
            byUser.set(attempt.userId, list);
        }
        const studentsTried = byUser.size;
        const bestPerUser = Array.from(byUser.values()).map((attempts) => attempts.reduce((best, cur) => (
            cur.score > best.score ? cur : best
        )));
        const approvedStudents = bestPerUser.filter((item) => item.passed || item.score >= row.passingScore).length;
        const passRate = studentsTried ? Math.round((approvedStudents / studentsTried) * 100) : 0;
        const averageScore = bestPerUser.length
            ? Math.round(bestPerUser.reduce((sum, item) => sum + item.score, 0) / bestPerUser.length)
            : 0;
        const attemptsPerStudent = studentsTried ? Number((row.attempts.length / studentsTried).toFixed(2)) : 0;
        const lastAttemptAt = row.attempts.length
            ? row.attempts.reduce((latest, item) => {
                const current = new Date(item.submittedAt || 0).getTime();
                return current > latest ? current : latest;
            }, 0)
            : 0;
        const students = Array.from(byUser.entries()).map(([userId, attempts]) => {
            const sorted = [...attempts].sort((a, b) => b.attemptNumber - a.attemptNumber);
            const bestAttempt = sorted.reduce((best, current) => (
                current.score > best.score ? current : best
            ), sorted[0]);
            return {
                userId,
                username: usernameById.get(userId) || `usuario-${userId}`,
                attemptsUsed: attempts.length,
                bestScore: bestAttempt.score,
                passed: bestAttempt.passed || bestAttempt.score >= row.passingScore,
                lastAttemptAt: sorted[0]?.submittedAt || null
            };
        }).sort((a, b) => a.username.localeCompare(b.username));

        episodesMetrics.push({
            episodeId: row.episodeId,
            title: row.title,
            mode: row.mode,
            studentsTried,
            approvedStudents,
            passRate,
            averageScore,
            attemptsPerStudent,
            lastAttemptAt: lastAttemptAt ? new Date(lastAttemptAt).toISOString() : null,
            students
        });
    }

    const summary = {
        totalAssessmentEpisodes: episodesMetrics.length,
        totalAssessmentAttempts: assessmentAttempts.length,
        averagePassRate: episodesMetrics.length
            ? Math.round(episodesMetrics.reduce((sum, item) => sum + item.passRate, 0) / episodesMetrics.length)
            : 0,
        averageScore: episodesMetrics.length
            ? Math.round(episodesMetrics.reduce((sum, item) => sum + item.averageScore, 0) / episodesMetrics.length)
            : 0,
        averageAttemptsPerStudent: episodesMetrics.length
            ? Number((episodesMetrics.reduce((sum, item) => sum + item.attemptsPerStudent, 0) / episodesMetrics.length).toFixed(2))
            : 0
    };

    return res.json({
        totals: {
            usersWithProfile,
            completedEpisodes,
            missionClaims,
            rewardsRedeemed
        },
        assessmentSummary: summary,
        assessmentEpisodes: episodesMetrics.sort((a, b) => a.passRate - b.passRate),
        recentEvents: events.map((event) => ({
            id: event.id,
            username: event.user?.username || 'usuário',
            type: event.event_type,
            xpDelta: event.xp_delta,
            coinsDelta: event.coins_delta,
            missionKey: event.mission_key,
            rewardKey: event.reward_key,
            createdAt: event.created_at
        }))
    });
}

export async function getMyHistory(req, res) {
    const [events, completedEpisodes, assessmentAttempts] = await Promise.all([
        GamificationEvent.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
            limit: 25
        }),
        UserEpisodeProgress.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Episode, attributes: ['id', 'title', 'slug'] }],
            order: [['completed_at', 'DESC']],
            limit: 25
        }),
        EpisodeAttempt.findAll({
            where: {
                user_id: req.user.id,
                status: 'graded'
            },
            include: [{
                model: Episode,
                attributes: ['id', 'title', 'slug', 'assessment_mode', 'passing_score']
            }],
            order: [['submitted_at', 'DESC'], ['id', 'DESC']],
            limit: 50
        })
    ]);

    return res.json({
        events: events.map((event) => ({
            id: event.id,
            type: event.event_type,
            xpDelta: event.xp_delta,
            coinsDelta: event.coins_delta,
            missionKey: event.mission_key,
            rewardKey: event.reward_key,
            createdAt: event.created_at
        })),
        completedEpisodes: completedEpisodes.map((entry) => ({
            episodeId: entry.episode_id,
            title: entry.episode?.title || 'Episodio',
            slug: entry.episode?.slug || '',
            completedAt: entry.completed_at
        })),
        assessmentAttempts: assessmentAttempts.map((attempt) => ({
            attemptId: attempt.id,
            attemptNumber: attempt.attempt_number,
            episodeId: attempt.episode_id,
            title: attempt.episode?.title || 'Atividade',
            slug: attempt.episode?.slug || '',
            assessmentMode: attempt.episode?.assessment_mode || null,
            score: Number.isFinite(Number(attempt.score)) ? Number(attempt.score) : null,
            passed: Boolean(attempt.passed),
            passingScore: Number(attempt.episode?.passing_score || 0),
            submittedAt: attempt.submitted_at || attempt.updated_at || attempt.created_at
        }))
    });
}
