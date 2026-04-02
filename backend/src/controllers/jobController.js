import { Op } from 'sequelize';
import { z } from 'zod';
import { ExternalJobPosting } from '../models/index.js';
import { sequelize } from '../config/database.js';

/** Somente vagas cuja data de publicação está dentro desta janela aparecem no Radar. */
const PUBLIC_JOB_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function minPublishedAtForPublicList() {
    return new Date(Date.now() - PUBLIC_JOB_MAX_AGE_MS);
}

const listQuerySchema = z.object({
    q: z.string().trim().max(120).optional(),
    seniority: z.enum(['intern', 'junior', 'mid', 'senior']).optional(),
    workModel: z.enum(['remote', 'hybrid', 'onsite']).optional(),
    region: z.enum(['brazil', 'abroad']).optional(),
    stack: z.string().trim().max(40).optional(),
    target: z.string().trim().max(40).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(5).optional().default(5),
    sort: z.enum(['recent', 'relevance']).optional().default('recent')
});

function formatSalaryLabel(row) {
    const raw = row?.raw_payload || {};
    const salaryText = String(raw.salary || raw.salary_range || '').trim();
    if (salaryText) return salaryText;

    const min = Number(raw.salary_min ?? raw.salaryMin ?? raw.min_salary ?? raw.minSalary);
    const max = Number(raw.salary_max ?? raw.salaryMax ?? raw.max_salary ?? raw.maxSalary);
    const currency = String(raw.salary_currency || raw.currency || '').trim().toUpperCase();

    if (Number.isFinite(min) && Number.isFinite(max)) {
        return `${currency ? `${currency} ` : ''}${min.toLocaleString('pt-BR')} - ${max.toLocaleString('pt-BR')}`;
    }
    if (Number.isFinite(min)) return `${currency ? `${currency} ` : ''}a partir de ${min.toLocaleString('pt-BR')}`;
    if (Number.isFinite(max)) return `${currency ? `${currency} ` : ''}até ${max.toLocaleString('pt-BR')}`;
    return null;
}

function normalizeToken(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function resolveApplyHost(url) {
    try {
        const host = new URL(String(url || '')).hostname || '';
        return host.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function buildDedupKey(row) {
    const title = normalizeToken(row?.title);
    const company = normalizeToken(row?.company_name);
    const host = resolveApplyHost(row?.apply_url);
    return `${title}|${company}|${host}`;
}

function dedupeRows(rows) {
    const map = new Map();
    for (const row of rows) {
        const key = buildDedupKey(row);
        if (!key || key === '||') {
            map.set(`fallback:${row.id}`, row);
            continue;
        }
        const existing = map.get(key);
        if (!existing) {
            map.set(key, row);
            continue;
        }
        const currentDate = new Date(row.published_at || row.updated_at || 0).getTime();
        const existingDate = new Date(existing.published_at || existing.updated_at || 0).getTime();
        if (currentDate > existingDate) {
            map.set(key, row);
        }
    }
    return Array.from(map.values());
}

function toListItemPayload(row) {
    const raw = row?.raw_payload || {};
    const regionTag = raw.region_tag || 'unknown';
    return {
        id: row.id,
        title: row.title,
        companyName: row.company_name,
        location: row.location,
        workModel: row.work_model,
        seniority: row.seniority,
        stacks: Array.isArray(row.stacks) ? row.stacks : [],
        targetAudience: Array.isArray(row.target_audience) ? row.target_audience : [],
        applyUrl: row.apply_url,
        salaryLabel: formatSalaryLabel(row),
        source: row.source,
        publishedAt: row.published_at,
        regionTag
    };
}

export async function listPublicJobs(req, res) {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Filtros inválidos.' });
    }
    const { q, seniority, workModel, region, stack, target, page, pageSize, sort } = parsed.data;
    const where = {
        is_active: true,
        published_at: { [Op.gte]: minPublishedAtForPublicList() },
        [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }]
    };
    const andFilters = [];

    if (seniority) where.seniority = seniority;
    if (workModel) where.work_model = workModel;
    if (stack) {
        andFilters.push(
            sequelize.where(
                sequelize.fn('JSON_SEARCH', sequelize.col('stacks'), 'one', String(stack).toLowerCase()),
                { [Op.ne]: null }
            )
        );
    }
    if (target) {
        andFilters.push(
            sequelize.where(
                sequelize.fn('JSON_SEARCH', sequelize.col('target_audience'), 'one', String(target).toLowerCase()),
                { [Op.ne]: null }
            )
        );
    }
    if (q) {
        andFilters.push(
            {
                [Op.or]: [
                    { title: { [Op.like]: `%${q}%` } },
                    { company_name: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } }
                ]
            }
        );
    }
    const regionTagExpr = sequelize.literal("JSON_UNQUOTE(JSON_EXTRACT(raw_payload, '$.region_tag'))");
    const brazilRegex = '(^|[^a-z])(brazil|brasil|br)([^a-z]|$)';
    if (region === 'brazil') {
        andFilters.push({
            [Op.or]: [
                sequelize.where(regionTagExpr, 'brazil'),
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.fn('COALESCE', sequelize.col('location'), '')),
                    { [Op.regexp]: brazilRegex }
                )
            ]
        });
    }
    if (region === 'abroad') {
        andFilters.push({
            [Op.or]: [
                sequelize.where(regionTagExpr, 'abroad'),
                sequelize.where(regionTagExpr, 'mixed'),
                {
                    [Op.and]: [
                        { location: { [Op.ne]: null } },
                        sequelize.where(
                            sequelize.fn('LOWER', sequelize.fn('COALESCE', sequelize.col('location'), '')),
                            { [Op.notRegexp]: brazilRegex }
                        )
                    ]
                }
            ]
        });
    }
    if (andFilters.length > 0) {
        where[Op.and] = andFilters;
    }

    const order = sort === 'recent'
        ? [['published_at', 'DESC'], ['updated_at', 'DESC']]
        : [['published_at', 'DESC'], ['updated_at', 'DESC']];

    const offset = (page - 1) * pageSize;
    const rows = await ExternalJobPosting.findAll({
        where,
        order
    });
    const dedupedRows = dedupeRows(rows);
    const pagedRows = dedupedRows.slice(offset, offset + pageSize);
    const total = dedupedRows.length;

    return res.json({
        items: pagedRows.map(toListItemPayload),
        pagination: {
            page,
            pageSize,
            total,
            hasNext: offset + pagedRows.length < total
        }
    });
}

export async function getPublicJobById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID de vaga inválido.' });
    }

    const row = await ExternalJobPosting.findOne({
        where: {
            id,
            is_active: true,
            published_at: { [Op.gte]: minPublishedAtForPublicList() },
            [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }]
        }
    });
    if (!row) {
        return res.status(404).json({ message: 'Vaga não encontrada.' });
    }

    const raw = row?.raw_payload || {};
    const regionTag = raw.region_tag || 'unknown';

    return res.json({
        id: row.id,
        title: row.title,
        companyName: row.company_name,
        location: row.location,
        workModel: row.work_model,
        seniority: row.seniority,
        contractType: row.contract_type,
        stacks: Array.isArray(row.stacks) ? row.stacks : [],
        targetAudience: Array.isArray(row.target_audience) ? row.target_audience : [],
        description: row.description,
        applyUrl: row.apply_url,
        salaryLabel: formatSalaryLabel(row),
        source: row.source,
        sourceUrl: row.source_url,
        publishedAt: row.published_at,
        regionTag
    });
}

export async function registerPublicJobClick(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'ID de vaga inválido.' });
    }

    const exists = await ExternalJobPosting.findOne({
        where: {
            id,
            is_active: true,
            published_at: { [Op.gte]: minPublishedAtForPublicList() },
            [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: new Date() } }]
        },
        attributes: ['id']
    });
    if (!exists) {
        return res.status(404).json({ message: 'Vaga não encontrada.' });
    }
    return res.status(202).json({ message: 'click_registered' });
}
