import { Op } from 'sequelize';
import { ExternalJobPosting } from '../models/index.js';

const DEFAULT_STACK_ALIASES = {
    node: ['node', 'node.js', 'nodejs'],
    vue: ['vue', 'vue.js', 'vuejs'],
    react: ['react', 'react.js', 'reactjs'],
    java: ['java', 'java se', 'spring'],
    javascript: ['javascript', 'js', 'ecmascript'],
    typescript: ['typescript', 'ts'],
    python: ['python', 'django', 'flask'],
    sql: ['sql', 'mysql', 'postgres', 'postgresql'],
    qa: ['qa', 'quality assurance', 'testes', 'testing'],
    docker: ['docker', 'kubernetes', 'k8s'],
    aws: ['aws', 'amazon web services', 'azure', 'gcp']
};

function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
}

function clampString(value, maxLength) {
    const source = String(value || '').trim();
    if (!source) return '';
    return source.length > maxLength ? source.slice(0, maxLength) : source;
}

function normalizeStackLabel(value) {
    const source = String(value || '').toLowerCase().trim();
    if (!source) return null;
    const entries = Object.entries(DEFAULT_STACK_ALIASES);
    for (const [canonical, aliases] of entries) {
        if (aliases.some((alias) => source.includes(alias))) return canonical;
    }
    return source.replace(/\s+/g, '-');
}

/** Evita exibir slugs longos como chip de stack no frontend. */
function isPresentableStackTag(tag) {
    if (!tag || typeof tag !== 'string') return false;
    const t = tag.trim();
    if (t.length < 2 || t.length > 28) return false;
    const hyphens = (t.match(/-/g) || []).length;
    if (hyphens >= 2) return false;
    if (/^\d/.test(t)) return false;
    if (/[()]/.test(t)) return false;
    return true;
}

function extractKnownStacksFromText(...parts) {
    const combined = parts.filter(Boolean).join(' ').toLowerCase();
    if (!combined) return [];
    const found = new Set();
    for (const [canonical, aliases] of Object.entries(DEFAULT_STACK_ALIASES)) {
        if (aliases.some((alias) => combined.includes(alias))) found.add(canonical);
    }
    return [...found];
}

/** Títulos Adzuna/outros: "123456 - Cidade - Cargo" -> cargo mais legível. */
function sanitizeJobTitle(rawTitle) {
    let t = String(rawTitle || '').trim().replace(/\s+/g, ' ');
    t = t.replace(/^\d{4,}\s*-\s*/g, '').trim();
    if (/^\d{4,}\s*-\s*/.test(t)) t = t.replace(/^\d{4,}\s*-\s*/g, '').trim();
    return t;
}

/** Remove tags e entidades comuns (ex.: snippets Jooble/Adzuna com HTML). */
function cleanRichTextSnippet(text) {
    let s = String(text || '');
    s = s.replace(/<[^>]*>/g, ' ');
    s = s.replace(/&nbsp;/gi, ' ');
    s = s.replace(/&amp;/gi, '&');
    s = s.replace(/&quot;/gi, '"');
    s = s.replace(/&#39;/g, "'");
    s = s.replace(/&lt;/gi, '<');
    s = s.replace(/&gt;/gi, '>');
    return s.replace(/\r\n|\r|\n/g, ' ').replace(/\s+/g, ' ').trim();
}

/** JOBS_REQUIRE_TECH_SIGNAL=false desliga o filtro (padrão: ligado). */
function isJobsTechFilterEnabled() {
    const v = String(process.env.JOBS_REQUIRE_TECH_SIGNAL ?? 'true').trim().toLowerCase();
    if (['0', 'false', 'no', 'off'].includes(v)) return false;
    return true;
}

/**
 * Cargo claramente de software/TI no título (não usa descrição — snippets agregadores mentem).
 */
function titlePositiveTechRole(t) {
    const n = normalizeForRegionMatch(t);
    if (!n.trim()) return false;
    return /\b(software|desenvolvedor|developer|devops|programador|programacao|programmer|coding|codificacao|engenheir[oa]\s+de\s+software|engenheir[oa]\s+de\s+dados|full[\s-]?stack|front[\s-]?end|back[\s-]?end|web\s+developer|mobile\s+developer|react\s+native|stack\s+developer|node(\.js)?\s+developer|java\s+developer|python\s+developer|\.net\s+developer|c[#+]\s+developer|typescript\s+developer|javascript\s+developer|data\s+scientist|cientista\s+de\s+dados|data\s+engineer|machine\s+learning|cloud\s+engineer|kubernetes|site\s+reliability|sre\b|dba\b|administrador\s+de\s+banco|quality\s+assurance|qa\s+engineer|test\s+automation|automation\s+engineer|cyber\s+security|seguranca\s+(da\s+)?informacao|analista\s+de\s+(sistemas|ti|dados|tecnologia|negocios\s+em\s+ti)|suporte\s+de\s+ti|help\s?desk|administrador\s+de\s+redes|network\s+engineer|ux\s+designer|ui\s+designer|product\s+owner|scrum\s+master|tech\s+lead|lider\s+tecnico|computacao|computer\s+science|desenvolvimento\s+de\s+sistemas|software\s+development|it\s+support|unix\s+.*\s+support|sql\s+.*\s+support|produc(tion)?\s+support\s+engineer|project\s+manager\b.*\b(software|ti|it|technology|digital|tecnologia|plataforma|produto\s+digital)\b|\b(it|digital|technical|technology)\s+project\s+manager\b)\b/.test(
        n
    );
}

/** Construção civil, obra, idiomas, etc. — rejeitar se o título não for claramente TI (acima). */
function titleNonTechExclusion(t) {
    const n = normalizeForRegionMatch(t);
    if (!n.trim()) return false;
    const patterns = [
        /\bestimator\b/,
        /\b(wastewater|heavy\s+civil|water\s*&\s*wastewater)\b/,
        /\bfederal\s+construction\b/,
        /\bgeneral\s+construction\b/,
        /\belectrical\s+construction\b/,
        /\b(construction|contractor|contracting)\b/,
        /\bcivil\b/,
        /\b(concrete|superintendent|foreman)\b/,
        /\b(manufacturing\s+specialist|lean\s+manufacturing)\b/,
        /\bpersonal\s+banker\b/,
        /\b(bilingual|polyglot|interpreter|translator)\b/,
        /\bspeaker\b.*\b(portuguese|espanhol|spanish|chinese|mandarin|vietnam|brl)\b/,
        /\bvietnam\b/,
        /\(\s*brl\s*\)|\/\s*brl\b/,
        /\b(consultancy|consultoria)\b.*\b(management|idioma|language|lingua)\b/,
        /\bfield\s+engineer\b.*\b(construction|federal|civil|contractor)\b/,
        /\b(construction|federal|civil|contractor)\b.*\bfield\s+engineer\b/,
        /\bproject\s+manager\b.*\b(construction|civil|federal\s+construction)\b/,
        /\b(construction|civil|federal\s+construction)\b.*\bproject\s+manager\b/
    ];
    return patterns.some((re) => re.test(n));
}

/**
 * Radar Tech: não confia em palavras só na descrição (Jooble injeta &lt;b&gt;developer&lt;/b&gt;, typescript, etc.).
 * Passa se: título é cargo TI explícito OU (título não é lista de exclusão E (stack só no título ou tags da API)).
 */
function passesTechRadarGate({ title, stacks }) {
    const t = normalizeForRegionMatch(title);
    if (titlePositiveTechRole(t)) return true;
    if (titleNonTechExclusion(t)) return false;
    if (Array.isArray(stacks) && stacks.length > 0) return true;
    return false;
}

/** Adzuna às vezes devolve descrição como slug (só hífens). */
function humanizeDescriptionIfSlug(text) {
    const s = String(text || '').trim();
    if (!s) return '';
    if (s.includes('<') && s.includes('>')) return s;
    const hyphenCount = (s.match(/-/g) || []).length;
    const hasSpace = /\s/.test(s);
    const avgSegment = s.length / Math.max(hyphenCount, 1);
    if (!hasSpace && hyphenCount >= 8 && avgSegment < 25) {
        return s.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if (!hasSpace && hyphenCount >= 15) {
        return s.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return s;
}

function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function detectWorkModel(text, explicit) {
    const source = `${explicit || ''} ${text || ''}`.toLowerCase();
    if (source.includes('remote') || source.includes('remoto') || source.includes('home office')) return 'remote';
    if (source.includes('hybrid') || source.includes('hibrido')) return 'hybrid';
    if (source.includes('onsite') || source.includes('presencial')) return 'onsite';
    return 'unknown';
}

function detectSeniority(text, explicit) {
    const source = `${explicit || ''} ${text || ''}`.toLowerCase();
    if (source.includes('estagio') || source.includes('intern')) return 'intern';
    if (source.includes('junior') || source.includes(' júnior') || source.includes(' jr')) return 'junior';
    if (source.includes('senior') || source.includes(' sênior') || source.includes(' sr')) return 'senior';
    if (source.includes('pleno') || source.includes(' mid')) return 'mid';
    return 'unknown';
}

function toSafeUrl(value) {
    let raw = String(value || '').trim();
    if (!raw) return null;
    if (raw.startsWith('//')) {
        raw = `https:${raw}`;
    }
    try {
        const parsed = new URL(raw);
        return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
    } catch {
        return null;
    }
}

function detectAdsAudience({ seniority, stacks }) {
    const entryLevel = seniority === 'intern' || seniority === 'junior' || seniority === 'unknown';
    const stackSet = new Set(stacks);
    const adsMatches = ['node', 'vue', 'react', 'java', 'javascript', 'typescript', 'python', 'sql', 'qa'].some(
        (key) => stackSet.has(key)
    );
    return entryLevel && adsMatches;
}

const BR_STATE_KEYS = [
    'acre', 'alagoas', 'amazonas', 'amapa', 'bahia', 'ceara', 'distrito federal', 'espirito santo',
    'goias', 'maranhao', 'mato grosso', 'mato grosso do sul', 'minas gerais', 'para', 'paraiba',
    'parana', 'pernambuco', 'piaui', 'rio de janeiro', 'rio grande do norte', 'rio grande do sul',
    'rondonia', 'roraima', 'santa catarina', 'sao paulo', 'sergipe', 'tocantins'
];

function normalizeForRegionMatch(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function looksLikeBrazilLocation(text) {
    const t = normalizeForRegionMatch(text);
    if (!t) return false;
    if (/(^|[^a-z])(brazil|brasil|br)([^a-z]|$)/.test(t)) return true;
    return BR_STATE_KEYS.some((state) => t.includes(state));
}

function detectRegionTag(location) {
    const text = String(location || '').toLowerCase().trim();
    if (!text) return 'unknown';

    const hasBrazil = looksLikeBrazilLocation(location);
    const foreignHints = [
        'argentina', 'usa', 'united states', 'canada', 'europe', 'uk', 'germany', 'france',
        'spain', 'portugal', 'mexico', 'chile', 'colombia', 'latam', 'worldwide', 'global'
    ];
    const hasForeignHint = foreignHints.some((hint) => text.includes(hint));

    if (hasBrazil && hasForeignHint) return 'mixed';
    if (hasBrazil) return 'brazil';
    if (hasForeignHint) return 'abroad';
    return 'unknown';
}

function resolveJobListFromPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    const candidates = [payload.jobs, payload.results, payload.data, payload.items];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
    }
    return [];
}

function resolveCompanyName(raw) {
    if (typeof raw.company === 'string') return raw.company.trim() || null;
    if (raw.company && typeof raw.company === 'object') {
        const nested = String(raw.company.display_name || raw.company.name || '').trim();
        if (nested) return nested;
    }
    const direct = String(raw.company_name || '').trim();
    return direct || null;
}

function resolveEnabledProviders() {
    const configured = String(process.env.JOBS_PROVIDERS || '').trim();
    if (configured) {
        return configured.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
    }

    // Backward compatibility with the old single-provider setup.
    const legacyUrl = String(process.env.JOBS_PROVIDER_URL || '').trim();
    const legacyName = String(process.env.JOBS_PROVIDER_NAME || '').trim().toLowerCase();
    if (legacyUrl) return [legacyName || 'custom'];

    return ['remotive'];
}

function getProviderConfig(providerName) {
    if (providerName === 'remotive') {
        return {
            source: 'remotive',
            url: String(process.env.JOBS_REMOTIVE_URL || 'https://remotive.com/api/remote-jobs').trim(),
            apiKey: String(process.env.JOBS_REMOTIVE_API_KEY || '').trim()
        };
    }

    if (providerName === 'arbeitnow') {
        return {
            source: 'arbeitnow',
            url: String(process.env.JOBS_ARBEITNOW_URL || 'https://www.arbeitnow.com/api/job-board-api').trim(),
            apiKey: String(process.env.JOBS_ARBEITNOW_API_KEY || '').trim()
        };
    }

    if (providerName === 'adzuna') {
        const appId = String(process.env.JOBS_ADZUNA_APP_ID || '').trim();
        const appKey = String(process.env.JOBS_ADZUNA_APP_KEY || '').trim();
        const country = String(process.env.JOBS_ADZUNA_COUNTRY || 'br').trim().toLowerCase();
        const page = Number(process.env.JOBS_ADZUNA_PAGE || 1);
        const perPage = Number(process.env.JOBS_ADZUNA_RESULTS_PER_PAGE || 50);
        const what = encodeURIComponent(String(process.env.JOBS_ADZUNA_WHAT || '').trim());
        const where = encodeURIComponent(String(process.env.JOBS_ADZUNA_WHERE || '').trim());

        if (!appId || !appKey) {
            return {
                source: 'adzuna',
                url: '',
                apiKey: ''
            };
        }

        let url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${Number.isInteger(page) && page > 0 ? page : 1}?app_id=${appId}&app_key=${appKey}&results_per_page=${Number.isInteger(perPage) && perPage > 0 ? perPage : 50}`;
        if (what) url += `&what=${what}`;
        if (where) url += `&where=${where}`;

        return {
            source: 'adzuna',
            url,
            apiKey: ''
        };
    }

    if (providerName === 'jooble') {
        const apiKey = String(process.env.JOBS_JOOBLE_API_KEY || '').trim();
        return {
            source: 'jooble',
            url: apiKey ? `https://jooble.org/api/${encodeURIComponent(apiKey)}` : '',
            apiKey: ''
        };
    }

    if (providerName === 'custom') {
        return {
            source: String(process.env.JOBS_PROVIDER_NAME || 'custom').trim().toLowerCase() || 'custom',
            url: String(process.env.JOBS_PROVIDER_URL || '').trim(),
            apiKey: String(process.env.JOBS_PROVIDER_API_KEY || '').trim()
        };
    }

    return {
        source: providerName,
        url: '',
        apiKey: ''
    };
}

function adaptProviderJob(source, row) {
    if (source === 'arbeitnow') {
        return {
            id: row.slug || row.url,
            title: row.title,
            company_name: row.company_name,
            location: row.location,
            description: row.description,
            tags: row.tags,
            url: row.url,
            created_at: row.created_at,
            job_type: row.remote ? 'remote' : toArray(row.job_types).join(',')
        };
    }

    if (source === 'adzuna') {
        const loc =
            row.location?.display_name
            || (Array.isArray(row.location?.area) ? row.location.area.join(', ') : null)
            || (typeof row.location === 'string' ? row.location : null);
        return {
            id: row.id || row.redirect_url,
            title: row.title,
            company: row.company,
            location: loc,
            description: row.description,
            redirect_url: row.redirect_url,
            created_at: row.created,
            salary_min: row.salary_min,
            salary_max: row.salary_max,
            salary_currency: 'BRL',
            job_type: `${row.contract_type || ''} ${row.contract_time || ''}`.trim()
        };
    }

    if (source === 'jooble') {
        const companyName = typeof row.company === 'string' ? row.company : row.company?.name;
        return {
            id: row.id != null ? row.id : row.link,
            title: row.title,
            company_name: companyName,
            location: row.location,
            description: row.snippet,
            url: row.link,
            created_at: row.updated,
            job_type: row.type,
            salary: row.salary,
            jooble_index_source: row.source
        };
    }
    return row;
}

function normalizeExternalJob(raw, source) {
    const titleRaw = clampString(raw.title || raw.position, 220);
    if (!titleRaw) return null;

    const applyUrl = toSafeUrl(raw.apply_url || raw.url || raw.link || raw.redirect_url);
    if (!applyUrl) return null;

    const title = clampString(sanitizeJobTitle(titleRaw), 220);
    const descriptionRaw = clampString(raw.description || raw.summary, 60000);
    const description = clampString(
        cleanRichTextSnippet(humanizeDescriptionIfSlug(descriptionRaw)),
        60000
    );
    const companyName = clampString(resolveCompanyName(raw), 160) || null;
    const location = clampString(raw.location || raw.city || raw.candidate_required_location, 160) || null;
    const explicitStacks = toArray(raw.stacks || raw.technologies || raw.tags)
        .map((item) => normalizeStackLabel(item))
        .filter(isPresentableStackTag);
    const stacksFromTitleOnly = extractKnownStacksFromText(title);
    const stacks = [...new Set([...explicitStacks.filter(Boolean), ...stacksFromTitleOnly])];
    if (isJobsTechFilterEnabled() && !passesTechRadarGate({ title, stacks })) {
        return null;
    }
    const workModel = detectWorkModel(`${title} ${description}`, raw.work_model || raw.workModel || raw.job_type);
    const seniority = detectSeniority(`${title} ${description}`, raw.seniority || raw.level || raw.job_type);
    const targetAudience = detectAdsAudience({ seniority, stacks }) ? ['ads'] : [];
    const regionTag = detectRegionTag(location);
    const externalId = clampString(raw.external_id || raw.id || raw.slug || applyUrl, 190);

    return {
        source,
        external_id: externalId,
        title,
        company_name: companyName,
        location,
        work_model: workModel,
        seniority,
        contract_type: 'unknown',
        stacks,
        target_audience: targetAudience,
        description: description || null,
        apply_url: applyUrl,
        source_url: toSafeUrl(raw.source_url || raw.sourceUrl || raw.company_url || ''),
        published_at: parseDate(raw.published_at || raw.created_at || raw.posted_at || raw.publication_date),
        expires_at: parseDate(raw.expires_at || raw.expiration_date),
        last_seen_at: new Date(),
        is_active: true,
        raw_payload: {
            ...raw,
            region_tag: regionTag
        }
    };
}

/** A API do Jooble costuma devolver 0 resultados com "Brasil"; "Brazil" funciona para o mesmo mercado. */
function normalizeJoobleLocation(value) {
    const s = String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    if (!s) return 'Brazil';
    if (s === 'brasil' || s === 'br' || s === 'brazil') return 'Brazil';
    return String(value || '').trim();
}

function buildJoobleSearchBody(page) {
    const keywords = String(process.env.JOBS_JOOBLE_KEYWORDS || 'desenvolvedor software').trim();
    const location = normalizeJoobleLocation(process.env.JOBS_JOOBLE_LOCATION || 'Brazil');
    const radius = String(process.env.JOBS_JOOBLE_RADIUS || '200');
    return JSON.stringify({
        keywords,
        location,
        radius,
        page: String(page),
        companysearch: 'false'
    });
}

async function fetchJoobleJobs(config) {
    const maxPages = Math.min(
        10,
        Math.max(1, Number(process.env.JOBS_JOOBLE_MAX_PAGES || 1))
    );
    const merged = [];
    const seenIds = new Set();

    for (let page = 1; page <= maxPages; page++) {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: buildJoobleSearchBody(page)
        });
        if (!response.ok) {
            throw new Error(`[jooble] Falha ao consultar provider de vagas: status ${response.status}`);
        }
        const payload = await response.json();
        const batch = resolveJobListFromPayload(payload);
        if (!batch.length) break;

        for (const row of batch) {
            const key = row.id != null ? `id:${row.id}` : `link:${row.link}`;
            if (seenIds.has(key)) continue;
            seenIds.add(key);
            merged.push(adaptProviderJob('jooble', row));
        }
    }

    return { source: 'jooble', jobs: merged };
}

async function fetchJobsFromProvider(providerName) {
    const config = getProviderConfig(providerName);

    if (providerName === 'jooble') {
        if (!config.url) {
            return { source: 'jooble', jobs: [] };
        }
        return fetchJoobleJobs(config);
    }

    if (!config.url) {
        return { source: config.source, jobs: [] };
    }

    const headers = {};
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

    const response = await fetch(config.url, { headers });
    if (!response.ok) {
        throw new Error(`[${config.source}] Falha ao consultar provider de vagas: status ${response.status}`);
    }
    const payload = await response.json();
    const jobs = resolveJobListFromPayload(payload).map((row) => adaptProviderJob(config.source, row));
    return {
        source: config.source,
        jobs
    };
}

async function syncProviderSource({ source, jobs, now }) {
    const normalized = jobs.map((row) => normalizeExternalJob(row, source)).filter(Boolean);
    const seenExternalIds = [];
    let upsertedCount = 0;

    for (const row of normalized) {
        seenExternalIds.push(row.external_id);
        const [model, created] = await ExternalJobPosting.findOrCreate({
            where: { source: row.source, external_id: row.external_id },
            defaults: row
        });
        if (!created) await model.update(row);
        upsertedCount += 1;
    }

    /** Só remove da lista vagas que não vieram neste ciclo se houver pelo menos uma vaga válida.
     * Lista vazia (API sem resultado, chave errada com 200 vazio, ou tudo rejeitado na normalização)
     * não pode desativar todo o histórico do provider. */
    let deactivatedCount = 0;
    if (seenExternalIds.length > 0) {
        const [n] = await ExternalJobPosting.update(
            { is_active: false },
            {
                where: {
                    source,
                    is_active: true,
                    external_id: { [Op.notIn]: seenExternalIds }
                }
            }
        );
        deactivatedCount = n;
    }
    const [expiredCount] = await ExternalJobPosting.update(
        { is_active: false },
        {
            where: {
                source,
                is_active: true,
                expires_at: { [Op.lt]: now }
            }
        }
    );

    return {
        source,
        fetched_count: jobs.length,
        normalized_count: normalized.length,
        upserted_count: upsertedCount,
        deactivated_count: deactivatedCount + expiredCount
    };
}

export async function syncExternalJobs() {
    const now = new Date();
    const startedAt = Date.now();
    const providers = resolveEnabledProviders();
    const summary = {
        providers,
        fetched_count: 0,
        normalized_count: 0,
        upserted_count: 0,
        deactivated_count: 0,
        provider_results: [],
        provider_errors: []
    };

    for (const providerName of providers) {
        try {
            const { source, jobs } = await fetchJobsFromProvider(providerName);
            const result = await syncProviderSource({ source, jobs, now });
            summary.provider_results.push(result);
            summary.fetched_count += result.fetched_count;
            summary.normalized_count += result.normalized_count;
            summary.upserted_count += result.upserted_count;
            summary.deactivated_count += result.deactivated_count;
        } catch (error) {
            summary.provider_errors.push({
                provider: providerName,
                message: error?.message || 'Erro ao sincronizar provider'
            });
        }
    }

    if (summary.provider_errors.length === providers.length) {
        throw new Error(`Falha em todos os providers de vagas: ${summary.provider_errors.map((item) => item.provider).join(', ')}`);
    }

    return {
        ...summary,
        duration_ms: Date.now() - startedAt,
        finished_at: new Date().toISOString()
    };
}

let syncInProgress = false;

export async function runExternalJobsSyncSafe(reason = 'interval') {
    if (syncInProgress) {
        return {
            skipped: true,
            reason: 'sync_already_running'
        };
    }

    syncInProgress = true;
    try {
        const result = await syncExternalJobs();
        console.info('[jobs] sync_completed', { reason, ...result });
        return result;
    } catch (error) {
        console.error('[jobs] sync_failed', { reason, message: error?.message });
        return {
            skipped: false,
            error: true,
            message: error?.message || 'Erro ao sincronizar vagas'
        };
    } finally {
        syncInProgress = false;
    }
}
