import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { z } from 'zod';
import { Episode, EpisodeAttempt, UserGamification } from '../models/index.js';

const episodeSchema = z.object({
    ordering: z.coerce.number().int().min(0).optional().default(0),
    title: z.string().min(3),
    summary: z.string().min(10),
    year_target: z.coerce.number().int().min(1).max(3),
    category: z.string().min(2),
    episode_type: z.enum(['study', 'assessment']).optional().default('study'),
    assessment_mode: z.enum(['quiz', 'open_text', 'mini_game']).optional().nullable(),
    assessment_config: z.union([z.string(), z.record(z.any()), z.array(z.any())]).optional().nullable(),
    max_attempts: z.coerce.number().int().min(1).max(10).optional().default(1),
    passing_score: z.coerce.number().int().min(0).max(100).optional().default(60),
    time_limit_sec: z.coerce.number().int().min(30).max(7200).optional().nullable(),
    xp_reward: z.coerce.number().int().min(0).max(1000).optional().default(40),
    is_published: z.coerce.boolean().optional().default(false),
    early_access_only: z.coerce.boolean().optional().default(false),
    duration_label: z.string().max(40).optional().or(z.literal('')),
    tags: z.string().optional().default('')
});

function parseAssessmentConfig(input) {
    if (input === null || input === undefined || input === '') return null;
    if (typeof input === 'string') {
        try {
            return JSON.parse(input);
        } catch {
            return null;
        }
    }
    return input;
}

function sanitizeAssessmentConfig(config, includeAnswerKey = false) {
    if (!config || typeof config !== 'object') return null;
    if (includeAnswerKey) return config;
    if (!Array.isArray(config.questions)) return config;
    return {
        ...config,
        questions: config.questions.map((question) => {
            const { correctOptionIndex, ...rest } = question || {};
            return rest;
        })
    };
}

function toEpisodeResponse(episode, { includeAnswerKey = false } = {}) {
    const json = episode.toJSON();

    return {
        ...json,
        assessment_config: sanitizeAssessmentConfig(json.assessment_config, includeAnswerKey),
        cover_url: json.cover_path ? `/${json.cover_path.replace(/^\/+/, '')}` : null,
        audio_url: json.audio_path ? `/${json.audio_path.replace(/^\/+/, '')}` : null,
        pdf_url: json.pdf_path ? `/${json.pdf_path.replace(/^\/+/, '')}` : null
    };
}

function buildWrongAnswersReview(episode, attempt) {
    if (!attempt || episode.episode_type !== 'assessment') return [];
    const config = episode.assessment_config || {};
    if (episode.assessment_mode === 'open_text') {
        const text = String(attempt?.answers?.text || '').trim();
        const minLength = Number(config?.minLength) > 0 ? Number(config.minLength) : 15;
        const minWords = Number(config?.minWords) > 0 ? Number(config.minWords) : 0;
        const wordsCount = text.split(/\s+/).filter(Boolean).length;
        const requiredKeywords = Array.isArray(config?.requiredKeywords) ? config.requiredKeywords : [];
        const normalizedText = text.toLowerCase();
        const matchedKeywords = requiredKeywords.filter((keyword) => normalizedText.includes(String(keyword).toLowerCase()));

        const review = [
            {
                questionId: 'open_text_min_length',
                prompt: 'Critério: tamanho mínimo da resposta',
                submittedLabel: `${text.length} caracteres`,
                expectedLabel: `Mínimo ${minLength} caracteres`,
                status: text.length >= minLength ? 'ok' : 'needs_attention'
            }
        ];
        if (minWords > 0) {
            review.push({
                questionId: 'open_text_min_words',
                prompt: 'Critério: quantidade mínima de palavras',
                submittedLabel: `${wordsCount} palavras`,
                expectedLabel: `Mínimo ${minWords} palavras`,
                status: wordsCount >= minWords ? 'ok' : 'needs_attention'
            });
        }
        if (requiredKeywords.length) {
            review.push({
                questionId: 'open_text_keywords',
                prompt: 'Critério: palavras-chave esperadas',
                submittedLabel: matchedKeywords.length
                    ? matchedKeywords.join(', ')
                    : 'Nenhuma palavra-chave identificada',
                expectedLabel: requiredKeywords.join(', '),
                status: matchedKeywords.length === requiredKeywords.length ? 'ok' : 'needs_attention'
            });
        }
        return review;
    }

    if (episode.assessment_mode === 'mini_game') {
        const items = Array.isArray(config.items) ? config.items : [];
        const orderedItemIds = Array.isArray(attempt.answers?.orderedItemIds) ? attempt.answers.orderedItemIds : [];
        return items.map((item, index) => {
            const expectedPosition = index + 1;
            const submittedPosition = orderedItemIds.findIndex((id) => String(id) === String(item.id)) + 1;
            return {
                questionId: String(item.id || `item_${expectedPosition}`),
                prompt: `Item: ${String(item.label || `Item ${expectedPosition}`)}`,
                submittedLabel: submittedPosition > 0 ? `${submittedPosition}ª posição` : 'Não ordenado',
                expectedLabel: `${expectedPosition}ª posição`,
                status: submittedPosition === expectedPosition ? 'ok' : 'needs_attention'
            };
        });
    }

    const questions = Array.isArray(config.questions) ? config.questions : [];
    const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
    const answerMap = new Map(answers.map((item) => [String(item.questionId), Number(item.value)]));
    return questions
        .map((question, index) => {
            const questionId = String(question.id || `q_${index}`);
            const expected = Number(question.correctOptionIndex);
            const submitted = answerMap.has(questionId) ? Number(answerMap.get(questionId)) : null;
            if (!Number.isInteger(expected)) return null;
            const options = Array.isArray(question.options) ? question.options : [];
            return {
                questionId,
                prompt: String(question.prompt || 'Pergunta'),
                submittedLabel: Number.isInteger(submitted) && options[submitted] !== undefined
                    ? String(options[submitted])
                    : 'Não respondida',
                expectedLabel: options[expected] !== undefined
                    ? String(options[expected])
                    : 'Sem gabarito disponível',
                status: submitted === expected ? 'ok' : 'needs_attention'
            };
        })
        .filter(Boolean);
}

async function enrichAssessmentProgressForUser(episodes, userId) {
    const assessmentIds = episodes
        .filter((episode) => episode.episode_type === 'assessment')
        .map((episode) => episode.id);
    if (!assessmentIds.length) return episodes.map((episode) => toEpisodeResponse(episode));

    const attempts = await EpisodeAttempt.findAll({
        where: { user_id: userId, episode_id: assessmentIds },
        attributes: ['episode_id', 'score', 'passed']
    });

    const grouped = new Map();
    for (const attempt of attempts) {
        const episodeId = Number(attempt.episode_id);
        const list = grouped.get(episodeId) || [];
        list.push({
            score: Number(attempt.score),
            passed: Boolean(attempt.passed)
        });
        grouped.set(episodeId, list);
    }

    return episodes.map((episode) => {
        const payload = toEpisodeResponse(episode);
        if (episode.episode_type !== 'assessment') return payload;
        const episodeAttempts = grouped.get(episode.id) || [];
        const bestScore = episodeAttempts.reduce((best, item) => (
            Number.isFinite(item.score) ? Math.max(best, item.score) : best
        ), 0);
        const passed = episodeAttempts.some((item) => item.passed);
        const attemptsUsed = episodeAttempts.length;
        return {
            ...payload,
            assessment_attempts_used: attemptsUsed,
            assessment_best_score: attemptsUsed ? bestScore : null,
            assessment_passed: passed,
            assessment_locked: !passed && attemptsUsed >= Number(episode.max_attempts || 1)
        };
    });
}

export async function listPublic(req, res) {
    const where = { is_published: true };
    let hasEarlyAccess = false;

    if (req.user?.id) {
        const profile = await UserGamification.findOne({ where: { user_id: req.user.id } });
        hasEarlyAccess = Boolean(profile?.early_access_enabled);
    }

    if (!hasEarlyAccess) {
        where.early_access_only = false;
    }

    if (req.query.year) where.year_target = Number(req.query.year);
    if (req.query.type) where.episode_type = String(req.query.type);
    if (req.query.category) where.category = req.query.category;
    const episodes = await Episode.findAll({
        where,
        order: [
            ['ordering', 'ASC'],
            ['created_at', 'DESC'],
        ],
    });
    if (req.user?.id) {
        return res.json(await enrichAssessmentProgressForUser(episodes, req.user.id));
    }
    return res.json(episodes.map((ep) => toEpisodeResponse(ep)));
}

export async function listAdmin(req, res) {
    const episodes = await Episode.findAll({
        order: [
            ['ordering', 'ASC'],
            ['created_at', 'DESC'],
        ],
    });
    return res.json(episodes.map((ep) => toEpisodeResponse(ep, { includeAnswerKey: true })));
}

export async function getPublicBySlug(req, res) {
    const where = { slug: req.params.slug, is_published: true };
    if (req.user?.id) {
        const profile = await UserGamification.findOne({ where: { user_id: req.user.id } });
        if (!profile?.early_access_enabled) where.early_access_only = false;
    } else {
        where.early_access_only = false;
    }
    const episode = await Episode.findOne({ where });
    if (!episode) return res.status(404).json({ message: 'Episódio não encontrado.' });
    if (!req.user?.id || episode.episode_type !== 'assessment') {
        return res.json(toEpisodeResponse(episode));
    }
    const attempts = await EpisodeAttempt.findAll({
        where: { user_id: req.user.id, episode_id: episode.id },
        attributes: ['id', 'attempt_number', 'score', 'passed', 'answers', 'submitted_at']
    });
    const bestScore = attempts.reduce((best, item) => {
        const score = Number(item.score);
        return Number.isFinite(score) ? Math.max(best, score) : best;
    }, 0);
    const passed = attempts.some((item) => Boolean(item.passed));
    const attemptsUsed = attempts.length;
    const latestAttempt = [...attempts]
        .sort((a, b) => {
            const left = new Date(a.submitted_at || 0).getTime();
            const right = new Date(b.submitted_at || 0).getTime();
            if (right !== left) return right - left;
            return Number(b.id) - Number(a.id);
        })[0] || null;
    const wrongAnswersReview = buildWrongAnswersReview(episode, latestAttempt);
    const attemptHistory = [...attempts]
        .sort((a, b) => Number(b.attempt_number) - Number(a.attempt_number))
        .slice(0, 5)
        .map((item) => ({
            attemptNumber: Number(item.attempt_number),
            score: Number.isFinite(Number(item.score)) ? Number(item.score) : null,
            passed: Boolean(item.passed),
            submittedAt: item.submitted_at || null
        }));
    const locked = !passed && attemptsUsed >= Number(episode.max_attempts || 1);
    return res.json({
        ...toEpisodeResponse(episode),
        assessment_attempts_used: attemptsUsed,
        assessment_best_score: attemptsUsed ? bestScore : null,
        assessment_passed: passed,
        assessment_locked: locked,
        assessment_wrong_answers: locked ? [] : wrongAnswersReview,
        assessment_attempt_history: attemptHistory
    });
}

function removeFileIfExists(relativePath) {
    if (!relativePath) return;
    const absolute = path.resolve(relativePath);
    if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

export async function createEpisode(req, res) {
    const data = episodeSchema.parse(req.body);
    const parsedAssessmentConfig = parseAssessmentConfig(data.assessment_config);
    if (data.episode_type === 'assessment' && !data.assessment_mode) {
        return res.status(400).json({ message: 'Defina o modo do episódio avaliativo.' });
    }
    const slug = slugify(data.title, { lower: true, strict: true, locale: 'pt' });
    const existing = await Episode.findOne({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const episode = await Episode.create({
        ...data,
        assessment_config: parsedAssessmentConfig,
        slug: finalSlug,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        cover_path: req.files?.cover?.[0] ? path.posix.join('uploads/images', req.files.cover[0].filename) : null,
        audio_path: req.files?.audio?.[0] ? path.posix.join('uploads/audio', req.files.audio[0].filename) : null,
        pdf_path: req.files?.pdf?.[0] ? path.posix.join('uploads/pdf', req.files.pdf[0].filename) : null,
    });

    return res.status(201).json(toEpisodeResponse(episode, { includeAnswerKey: true }));
}

export async function updateEpisode(req, res) {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) return res.status(404).json({ message: 'Episódio não encontrado.' });

    const data = episodeSchema.partial().parse(req.body);
    const parsedAssessmentConfig = data.assessment_config === undefined
        ? undefined
        : parseAssessmentConfig(data.assessment_config);
    const updatePayload = {
        ...data,
        assessment_config: parsedAssessmentConfig
    };
    const finalEpisodeType = updatePayload.episode_type || episode.episode_type;
    const finalAssessmentMode = updatePayload.assessment_mode === undefined
        ? episode.assessment_mode
        : updatePayload.assessment_mode;
    if (finalEpisodeType === 'assessment' && !finalAssessmentMode) {
        return res.status(400).json({ message: 'Defina o modo do episódio avaliativo.' });
    }
    if (finalEpisodeType === 'study') {
        updatePayload.assessment_mode = null;
        updatePayload.assessment_config = null;
    }


    if (data.title && data.title !== episode.title) {
        updatePayload.slug = slugify(data.title, { lower: true, strict: true, locale: 'pt' });
    }
    
    if (data.tags !== undefined) {
        updatePayload.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    if (req.files?.cover?.[0]) {
        removeFileIfExists(episode.cover_path);
        updatePayload.cover_path = path.posix.join('uploads/images', req.files.cover[0].filename);
    }

    if (req.files?.audio?.[0]) {
        removeFileIfExists(episode.audio_path);
        updatePayload.audio_path = path.posix.join('uploads/audio', req.files.audio[0].filename);
    }

    if (req.files?.pdf?.[0]) {
        removeFileIfExists(episode.pdf_path);
        updatePayload.pdf_path = path.posix.join('uploads/pdf', req.files.pdf[0].filename);
    }

    await episode.update(updatePayload);
    return res.json(toEpisodeResponse(episode, { includeAnswerKey: true }));
}

export async function deleteEpisode(req, res) {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) return res.status(404).json({ message: 'Episódio não encontrado.' });

    removeFileIfExists(episode.cover_path);
    removeFileIfExists(episode.audio_path);
    removeFileIfExists(episode.pdf_path);
    await episode.destroy();
    return res.json({ message: 'Episódio removido com sucesso.' });
}
