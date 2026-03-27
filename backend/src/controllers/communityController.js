import { Op } from 'sequelize';
import { z } from 'zod';
import { sequelize } from '../config/database.js';
import {
    CommunityModerationLog,
    CommunityReply,
    CommunityReport,
    CommunityTopic,
    CommunityVote,
    User
} from '../models/index.js';
import { evaluateCommunityText } from '../services/contentModerationService.js';

function moderationBlockMessage(severity) {
    if (severity === 'high') {
        return 'Seu texto viola nossas diretrizes de segurança e respeito. Revise e tente novamente.';
    }
    return 'Seu texto contém linguagem potencialmente ofensiva. Ajuste a mensagem e tente novamente.';
}

const createTopicSchema = z.object({
    phase: z.coerce.number().int().min(1).max(3).optional().nullable(),
    classGroup: z.string().trim().max(20).optional().nullable(),
    isAnonymous: z.coerce.boolean().optional().default(false),
    category: z.enum(['duvida', 'solucao', 'discussao', 'showcase']).optional().default('duvida'),
    title: z.string().trim().min(5).max(180),
    content: z.string().trim().min(15).max(5000)
});
const updateTopicSchema = createTopicSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Informe ao menos um campo para atualização.' }
);

const createReplySchema = z.object({
    content: z.string().trim().min(5).max(5000)
});

const topicStatusSchema = z.object({
    status: z.enum(['open', 'resolved', 'archived', 'hidden'])
});

const reportSchema = z.object({
    targetType: z.enum(['topic', 'reply']),
    targetId: z.coerce.number().int().positive(),
    reason: z.string().trim().min(5).max(255)
});

const moderationSchema = z.object({
    action: z.enum(['hide', 'unhide']),
    reason: z.string().trim().max(255).optional().nullable()
});

const reviewReportSchema = z.object({
    status: z.enum(['actioned', 'dismissed']),
    reason: z.string().trim().max(255).optional().nullable()
});

function validationErrorResponse(res, parsed) {
    return res.status(400).json({
        message: 'Dados inválidos enviados para a API.',
        errors: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
        }))
    });
}

const COMMUNITY_AUTHOR_ATTRIBUTES = ['id', 'username', 'role', 'deleted_at'];
const REMOVED_COMMUNITY_USER_LABEL = 'Usuário removido';

function toTopicSummary(topic, { viewerRole = '', viewerId = 0 } = {}) {
    const isAnonymous = Boolean(topic.is_anonymous);
    const isProfessorViewer = viewerRole === 'professor';
    const isMine = Number(topic.author_user_id) === Number(viewerId);
    const shouldMaskAnonymous = isAnonymous && !isProfessorViewer;

    let author = null;
    if (topic.author) {
        if (topic.author.deleted_at) {
            author = {
                id: isProfessorViewer ? topic.author.id : null,
                username: REMOVED_COMMUNITY_USER_LABEL,
                role: topic.author.role
            };
        } else if (shouldMaskAnonymous) {
            author = { id: null, username: 'Aluno anônimo', role: 'student' };
        } else {
            author = {
                id: topic.author.id,
                username: topic.author.username,
                role: topic.author.role
            };
        }
    } else if (shouldMaskAnonymous) {
        author = { id: null, username: 'Aluno anônimo', role: 'student' };
    }

    const authorAccountRemoved = Boolean(topic.author?.deleted_at);
    const repliesOpen = !authorAccountRemoved && !['archived', 'hidden'].includes(String(topic.status || ''));

    return {
        id: topic.id,
        phase: topic.phase,
        classGroup: topic.class_group,
        isAnonymous,
        isMine,
        category: topic.category,
        title: topic.title,
        content: topic.content,
        status: topic.status,
        bestReplyId: topic.best_reply_id,
        createdAt: topic.created_at,
        updatedAt: topic.updated_at,
        author,
        authorAccountRemoved,
        repliesOpen,
        repliesCount: Number(topic.replies_count || 0)
    };
}

function toReplyPayload(reply, { viewerRole = '' } = {}) {
    const isProfessorViewer = viewerRole === 'professor';
    let author = null;
    if (reply.author) {
        if (reply.author.deleted_at) {
            author = {
                id: isProfessorViewer ? reply.author.id : null,
                username: REMOVED_COMMUNITY_USER_LABEL,
                role: reply.author.role
            };
        } else {
            author = {
                id: reply.author.id,
                username: reply.author.username,
                role: reply.author.role
            };
        }
    }
    return {
        id: reply.id,
        topicId: reply.topic_id,
        content: reply.content,
        isOfficial: Boolean(reply.is_official),
        isHidden: Boolean(reply.is_hidden),
        votesCount: Number(reply.votes_count || 0),
        viewerVoted: Boolean(reply.viewer_voted || false),
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
        author
    };
}

export async function listTopics(req, res) {
    const where = {};

    const phase = Number(req.query.phase);
    if (Number.isInteger(phase) && phase >= 1 && phase <= 3) {
        where.phase = phase;
    }

    if (req.query.category) {
        where.category = String(req.query.category);
    }

    if (req.query.status && req.user?.role === 'professor') {
        where.status = String(req.query.status);
    } else if (req.user?.role !== 'professor') {
        where.status = { [Op.not]: 'hidden' };
    }

    if (req.query.classGroup) {
        where.class_group = String(req.query.classGroup).trim();
    }

    const search = String(req.query.search || '').trim();
    if (search) {
        where[Op.or] = [
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
        ];
    }

    const removedAuthorsOnly = ['1', 'true', 'yes', 'on'].includes(
        String(req.query.removedAuthorsOnly || '').trim().toLowerCase()
    );
    if (removedAuthorsOnly && req.user?.role !== 'professor') {
        return res.status(403).json({ message: 'Acesso restrito para professor.' });
    }

    const authorInclude = {
        model: User,
        as: 'author',
        attributes: COMMUNITY_AUTHOR_ATTRIBUTES
    };
    if (removedAuthorsOnly) {
        authorInclude.where = { deleted_at: { [Op.ne]: null } };
        authorInclude.required = true;
    }

    const rows = await CommunityTopic.findAll({
        where,
        include: [authorInclude],
        order: [['created_at', 'DESC']],
        limit: 50,
        subQuery: false
    });

    const topicIds = rows.map((row) => Number(row.id)).filter((id) => Number.isInteger(id) && id > 0);
    const replyWhere = {
        topic_id: topicIds
    };
    if (req.user?.role !== 'professor') {
        replyWhere.is_hidden = false;
    }

    const replyCounts = topicIds.length
        ? await CommunityReply.findAll({
            where: replyWhere,
            attributes: ['topic_id', [CommunityReply.sequelize.fn('COUNT', CommunityReply.sequelize.col('id')), 'count']],
            group: ['topic_id'],
            raw: true
        })
        : [];
    const countByTopicId = new Map(replyCounts.map((row) => [Number(row.topic_id), Number(row.count || 0)]));

    return res.json(rows.map((row) => toTopicSummary(
        { ...row.toJSON(), replies_count: countByTopicId.get(Number(row.id)) || 0 },
        { viewerRole: req.user?.role, viewerId: req.user?.id }
    )));
}

export async function createTopic(req, res) {
    const parsed = createTopicSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;
    const moderation = evaluateCommunityText({ title: data.title, content: data.content });
    if (moderation.blocked) {
        return res.status(422).json({
            message: moderationBlockMessage(moderation.severity),
            severity: moderation.severity
        });
    }

    const topic = await CommunityTopic.create({
        author_user_id: req.user.id,
        phase: data.phase ?? null,
        class_group: data.classGroup || null,
        category: data.category,
        title: data.title,
        content: data.content,
        is_anonymous: Boolean(data.isAnonymous),
        status: 'open'
    });

    const full = await CommunityTopic.findByPk(topic.id, {
        include: [{ model: User, as: 'author', attributes: COMMUNITY_AUTHOR_ATTRIBUTES }]
    });

    return res.status(201).json(toTopicSummary(
        { ...full.toJSON(), replies_count: 0 },
        { viewerRole: req.user?.role, viewerId: req.user?.id }
    ));
}

export async function updateTopic(req, res) {
    const topicId = Number(req.params.id);
    if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({ message: 'ID de tópico inválido.' });
    }
    const parsed = updateTopicSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;
    const moderation = evaluateCommunityText({ title: data.title, content: data.content });
    if (moderation.blocked) {
        return res.status(422).json({
            message: moderationBlockMessage(moderation.severity),
            severity: moderation.severity
        });
    }

    const topic = await CommunityTopic.findByPk(topicId, {
        include: [{ model: User, as: 'author', attributes: COMMUNITY_AUTHOR_ATTRIBUTES }]
    });
    if (!topic) {
        return res.status(404).json({ message: 'Tópico não encontrado.' });
    }

    const canEdit = req.user.role === 'professor' || Number(topic.author_user_id) === Number(req.user.id);
    if (!canEdit) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este tópico.' });
    }

    const payload = {};
    if (data.phase !== undefined) payload.phase = data.phase ?? null;
    if (data.classGroup !== undefined) payload.class_group = data.classGroup || null;
    if (data.category !== undefined) payload.category = data.category;
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.isAnonymous !== undefined) payload.is_anonymous = Boolean(data.isAnonymous);
    await topic.update(payload);

    return res.json(
        toTopicSummary(
            { ...topic.toJSON(), replies_count: 0 },
            { viewerRole: req.user?.role, viewerId: req.user?.id }
        )
    );
}

export async function getTopicById(req, res) {
    const topicId = Number(req.params.id);
    if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({ message: 'ID de tópico inválido.' });
    }

    const topic = await CommunityTopic.findByPk(topicId, {
        include: [{ model: User, as: 'author', attributes: COMMUNITY_AUTHOR_ATTRIBUTES }]
    });

    if (!topic || (topic.status === 'hidden' && req.user?.role !== 'professor')) {
        return res.status(404).json({ message: 'Tópico não encontrado.' });
    }

    const replies = await CommunityReply.findAll({
        where: {
            topic_id: topicId,
            ...(req.user?.role === 'professor' ? {} : { is_hidden: false })
        },
        include: [{ model: User, as: 'author', attributes: COMMUNITY_AUTHOR_ATTRIBUTES }],
        order: [['created_at', 'ASC']]
    });
    const replyIds = replies.map((reply) => Number(reply.id)).filter((id) => Number.isInteger(id) && id > 0);
    const votesByReplyId = new Map();
    const viewerVotes = new Set();
    if (replyIds.length) {
        const voteRows = await CommunityVote.findAll({
            where: { reply_id: replyIds },
            attributes: ['reply_id', 'user_id'],
            raw: true
        });
        for (const row of voteRows) {
            const replyId = Number(row.reply_id);
            votesByReplyId.set(replyId, (votesByReplyId.get(replyId) || 0) + 1);
            if (Number(row.user_id) === Number(req.user?.id || 0)) {
                viewerVotes.add(replyId);
            }
        }
    }

    return res.json({
        topic: toTopicSummary(
            { ...topic.toJSON(), replies_count: replies.length },
            { viewerRole: req.user?.role, viewerId: req.user?.id }
        ),
        replies: replies.map((reply) => toReplyPayload({
            ...reply.toJSON(),
            votes_count: votesByReplyId.get(Number(reply.id)) || 0,
            viewer_voted: viewerVotes.has(Number(reply.id))
        }, { viewerRole: req.user?.role }))
    });
}

export async function createReply(req, res) {
    const topicId = Number(req.params.id);
    if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({ message: 'ID de tópico inválido.' });
    }

    const parsed = createReplySchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;
    const moderation = evaluateCommunityText({ content: data.content });
    if (moderation.blocked) {
        return res.status(422).json({
            message: moderationBlockMessage(moderation.severity),
            severity: moderation.severity
        });
    }
    const topic = await CommunityTopic.findByPk(topicId, {
        include: [{ model: User, as: 'author', attributes: ['id', 'deleted_at'] }]
    });
    if (!topic) {
        return res.status(404).json({ message: 'Tópico não encontrado.' });
    }
    if (topic.status === 'archived' || topic.status === 'hidden') {
        return res.status(409).json({ message: 'Este tópico está fechado para novas respostas.' });
    }
    if (topic.author?.deleted_at) {
        return res.status(409).json({
            message: 'Não é possível responder: o autor deste tópico removeu a conta.'
        });
    }

    const reply = await CommunityReply.create({
        topic_id: topicId,
        author_user_id: req.user.id,
        content: data.content,
        is_official: req.user.role === 'professor'
    });

    const full = await CommunityReply.findByPk(reply.id, {
        include: [{ model: User, as: 'author', attributes: COMMUNITY_AUTHOR_ATTRIBUTES }]
    });

    return res.status(201).json(toReplyPayload(full, { viewerRole: req.user?.role }));
}

export async function updateTopicStatus(req, res) {
    const topicId = Number(req.params.id);
    if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({ message: 'ID de tópico inválido.' });
    }
    const parsed = topicStatusSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;

    const topic = await CommunityTopic.findByPk(topicId);
    if (!topic) {
        return res.status(404).json({ message: 'Tópico não encontrado.' });
    }
    await topic.update({ status: data.status });
    return res.json({ message: 'Status atualizado com sucesso.' });
}

export async function deleteTopic(req, res) {
    const topicId = Number(req.params.id);
    if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({ message: 'ID de tópico inválido.' });
    }

    const topic = await CommunityTopic.findByPk(topicId, {
        include: [{ model: User, as: 'author', attributes: COMMUNITY_AUTHOR_ATTRIBUTES }]
    });
    if (!topic) {
        return res.status(404).json({ message: 'Tópico não encontrado.' });
    }
    if (!topic.author?.deleted_at) {
        return res.status(403).json({
            message: 'Somente tópicos cujo autor removeu a conta podem ser excluídos por esta ação.'
        });
    }

    const replyRows = await CommunityReply.findAll({
        where: { topic_id: topicId },
        attributes: ['id'],
        raw: true
    });
    const replyIds = replyRows.map((r) => Number(r.id)).filter((id) => Number.isInteger(id) && id > 0);

    const transaction = await sequelize.transaction();
    try {
        await CommunityReport.destroy({
            where: {
                [Op.or]: [
                    { target_type: 'topic', target_id: topicId },
                    ...(replyIds.length ? [{ target_type: 'reply', target_id: { [Op.in]: replyIds } }] : [])
                ]
            },
            transaction
        });
        if (replyIds.length) {
            await CommunityVote.destroy({ where: { reply_id: replyIds }, transaction });
        }
        await CommunityReply.destroy({ where: { topic_id: topicId }, transaction });
        await topic.destroy({ transaction });
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }

    return res.json({ message: 'Tópico excluído com sucesso.' });
}

export async function voteReply(req, res) {
    const replyId = Number(req.params.id);
    if (!Number.isInteger(replyId) || replyId <= 0) {
        return res.status(400).json({ message: 'ID de resposta inválido.' });
    }

    const reply = await CommunityReply.findByPk(replyId);
    if (!reply || reply.is_hidden) {
        return res.status(404).json({ message: 'Resposta não encontrada.' });
    }

    const existing = await CommunityVote.findOne({
        where: { user_id: req.user.id, reply_id: replyId }
    });

    if (existing) {
        await existing.destroy();
        return res.json({ voted: false });
    }

    await CommunityVote.create({
        user_id: req.user.id,
        reply_id: replyId,
        vote_type: 'up'
    });
    return res.status(201).json({ voted: true });
}

export async function setBestReply(req, res) {
    const topicId = Number(req.params.id);
    const replyId = Number(req.body.replyId);
    if (!Number.isInteger(topicId) || topicId <= 0 || !Number.isInteger(replyId) || replyId <= 0) {
        return res.status(400).json({ message: 'Dados inválidos para definir melhor resposta.' });
    }

    const topic = await CommunityTopic.findByPk(topicId);
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado.' });

    const canSet = req.user.role === 'professor' || Number(topic.author_user_id) === Number(req.user.id);
    if (!canSet) {
        return res.status(403).json({ message: 'Você não pode definir a melhor resposta deste tópico.' });
    }

    const reply = await CommunityReply.findOne({
        where: { id: replyId, topic_id: topicId, is_hidden: false }
    });
    if (!reply) return res.status(404).json({ message: 'Resposta não encontrada neste tópico.' });

    await topic.update({ best_reply_id: replyId, status: 'resolved' });
    return res.json({ message: 'Melhor resposta definida com sucesso.' });
}

export async function createReport(req, res) {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;

    if (data.targetType === 'topic') {
        const topic = await CommunityTopic.findByPk(data.targetId);
        if (!topic) return res.status(404).json({ message: 'Tópico não encontrado.' });
    } else {
        const reply = await CommunityReply.findByPk(data.targetId);
        if (!reply) return res.status(404).json({ message: 'Resposta não encontrada.' });
    }

    await CommunityReport.create({
        reporter_user_id: req.user.id,
        target_type: data.targetType,
        target_id: data.targetId,
        reason: data.reason,
        status: 'pending'
    });

    return res.status(201).json({ message: 'Denúncia registrada. Obrigado por ajudar na moderação.' });
}

function toReportPayload(report) {
    return {
        id: report.id,
        targetType: report.target_type,
        targetId: report.target_id,
        reason: report.reason,
        status: report.status,
        createdAt: report.created_at,
        reporter: report.reporter
            ? {
                id: report.reporter.id,
                username: report.reporter.username,
                role: report.reporter.role
            }
            : null,
        target: report.target || null
    };
}

export async function listReports(req, res) {
    const status = String(req.query.status || 'pending');
    const where = {};
    if (['pending', 'reviewed', 'actioned', 'dismissed'].includes(status)) {
        where.status = status;
    }

    const reports = await CommunityReport.findAll({
        where,
        include: [{ model: User, as: 'reporter', attributes: ['id', 'username', 'role'] }],
        order: [['created_at', 'DESC']],
        limit: 100
    });
    const topicIds = [];
    const replyIds = [];
    for (const report of reports) {
        if (report.target_type === 'topic') topicIds.push(Number(report.target_id));
        if (report.target_type === 'reply') replyIds.push(Number(report.target_id));
    }

    const [topics, replies] = await Promise.all([
        topicIds.length
            ? CommunityTopic.findAll({
                where: { id: topicIds },
                attributes: ['id', 'title']
            })
            : [],
        replyIds.length
            ? CommunityReply.findAll({
                where: { id: replyIds },
                attributes: ['id', 'topic_id', 'content']
            })
            : []
    ]);

    const topicById = new Map(topics.map((topic) => [Number(topic.id), topic]));
    const replyById = new Map(replies.map((reply) => [Number(reply.id), reply]));
    const replyTopicIds = replies.map((reply) => Number(reply.topic_id)).filter((id) => Number.isInteger(id) && id > 0);
    const missingTopicIds = replyTopicIds.filter((id) => !topicById.has(id));
    if (missingTopicIds.length) {
        const moreTopics = await CommunityTopic.findAll({
            where: { id: missingTopicIds },
            attributes: ['id', 'title']
        });
        for (const topic of moreTopics) {
            topicById.set(Number(topic.id), topic);
        }
    }

    return res.json(reports.map((report) => {
        const json = report.toJSON();
        if (report.target_type === 'topic') {
            const topic = topicById.get(Number(report.target_id));
            json.target = topic
                ? { type: 'topic', title: topic.title, topicId: Number(topic.id) }
                : { type: 'topic', title: 'Tópico removido', topicId: Number(report.target_id) };
        } else {
            const reply = replyById.get(Number(report.target_id));
            const topic = reply ? topicById.get(Number(reply.topic_id)) : null;
            json.target = {
                type: 'reply',
                title: topic?.title || 'Tópico indisponível',
                topicId: topic ? Number(topic.id) : null,
                replyPreview: reply?.content ? String(reply.content).slice(0, 120) : ''
            };
        }
        return toReportPayload(json);
    }));
}

export async function reviewReport(req, res) {
    const reportId = Number(req.params.id);
    if (!Number.isInteger(reportId) || reportId <= 0) {
        return res.status(400).json({ message: 'ID de denúncia inválido.' });
    }
    const parsed = reviewReportSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;

    const report = await CommunityReport.findByPk(reportId);
    if (!report) {
        return res.status(404).json({ message: 'Denúncia não encontrada.' });
    }

    if (data.status === 'actioned') {
        if (report.target_type === 'topic') {
            const topic = await CommunityTopic.findByPk(report.target_id);
            if (topic) {
                await topic.update({ status: 'hidden' });
            }
        } else {
            const reply = await CommunityReply.findByPk(report.target_id);
            if (reply) {
                await reply.update({ is_hidden: true });
            }
        }

        await CommunityModerationLog.create({
            moderator_user_id: req.user.id,
            target_type: report.target_type,
            target_id: report.target_id,
            action: 'hide',
            reason: data.reason || report.reason || null
        });
    }

    await report.update({ status: data.status });
    return res.json({
        message: data.status === 'actioned'
            ? 'Denúncia aprovada e conteúdo moderado.'
            : 'Denúncia descartada.',
        report: {
            id: report.id,
            status: report.status
        }
    });
}

export async function moderateContent(req, res) {
    const targetType = String(req.params.targetType || '');
    const targetId = Number(req.params.targetId);
    if (!['topic', 'reply'].includes(targetType) || !Number.isInteger(targetId) || targetId <= 0) {
        return res.status(400).json({ message: 'Alvo de moderação inválido.' });
    }
    const parsed = moderationSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed);
    const data = parsed.data;

    if (targetType === 'topic') {
        const topic = await CommunityTopic.findByPk(targetId);
        if (!topic) return res.status(404).json({ message: 'Tópico não encontrado.' });
        await topic.update({ status: data.action === 'hide' ? 'hidden' : 'open' });
    } else {
        const reply = await CommunityReply.findByPk(targetId);
        if (!reply) return res.status(404).json({ message: 'Resposta não encontrada.' });
        await reply.update({ is_hidden: data.action === 'hide' });
    }

    await CommunityModerationLog.create({
        moderator_user_id: req.user.id,
        target_type: targetType,
        target_id: targetId,
        action: data.action,
        reason: data.reason || null
    });

    return res.json({ message: 'Moderação aplicada com sucesso.' });
}
