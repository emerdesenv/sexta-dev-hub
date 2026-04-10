<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer>
            <section class="sd-card sd-card-section jobs-intro-card">
                <div class="jobs-intro-badges flex flex-wrap items-center gap-2">
                    <Badge tone="primary">Radar de Vagas Tech</Badge>
                    <Badge tone="neutral">Atualização automática</Badge>
                </div>
                <h1 class="mt-4 sd-page-hero-title">
                    Vagas conectadas ao mercado
                </h1>
                <p class="jobs-hero-lede text-muted">
                    <span class="jobs-copy-desktop">
                        Busque por cargo ou stack, ajuste nível e se quer só remoto ou vagas com perfil
                        <abbr class="jobs-abbr-ads" :title="adsAudienceHelpText">ADS</abbr>
                        (Análise e Desenvolvimento de Sistemas).
                        Só aparecem anúncios publicados na última semana.
                    </span>
                    <span class="jobs-copy-mobile">
                        Busque por cargo ou stack com foco em ADS. Exibimos vagas da última semana.
                    </span>
                </p>
                <aside class="jobs-disclaimer" role="note" aria-label="Sobre a origem das vagas">
                    <p class="jobs-disclaimer-title">Sobre a origem destas vagas</p>
                    <p class="jobs-disclaimer-body jobs-copy-desktop">
                        O Radar reúne anúncios públicos indexados por parceiros (ex.: Adzuna, Jooble, Remotive, Arbeitnow).
                        A plataforma não é empregadora: metadados podem estar incompletos, genéricos ou desatualizados.
                        Sempre confira requisitos, salário e prazo no site oficial da empresa ou no link de candidatura.
                    </p>
                    <p class="jobs-disclaimer-body jobs-copy-mobile">
                        Vagas de fontes externas. Confirme requisitos e prazo no anúncio original antes de se candidatar.
                    </p>
                </aside>
            </section>

            <section class="mt-6 sd-card sd-card-section p-5 md:p-6 jobs-filters-outer">
                <p class="sd-filter-legend">Refinar resultados</p>
                <div class="sd-search-well jobs-search-well sd-filter-stack">
                    <label class="sd-filter-field">
                        <span class="sd-filter-label">Busca</span>
                        <div class="sd-filter-search-row">
                            <input
                                v-model.trim="filters.q"
                                class="sd-input sd-input--search"
                                placeholder="Cargo, empresa ou palavra-chave"
                                @keyup.enter="applyFilters"
                            >
                        </div>
                    </label>

                    <div class="sd-filter-grid-3">
                        <label class="sd-filter-field">
                            <span class="sd-filter-label">Stack</span>
                            <input
                                v-model.trim="filters.stack"
                                class="sd-input sd-input--search"
                                placeholder="Ex.: node, vue, java"
                                @keyup.enter="applyFilters"
                            >
                        </label>

                        <label class="sd-filter-field">
                            <span class="sd-filter-label">Onde</span>
                            <select v-model="filters.region" class="sd-input sd-input--search">
                                <option value="">Brasil e exterior</option>
                                <option value="brazil">Brasil</option>
                                <option value="abroad">Fora do Brasil</option>
                            </select>
                        </label>

                        <label class="sd-filter-field">
                            <span class="sd-filter-label">Nível</span>
                            <select v-model="filters.seniority" class="sd-input sd-input--search">
                                <option value="">Qualquer</option>
                                <option value="intern">Estágio</option>
                                <option value="junior">Júnior</option>
                                <option value="mid">Pleno</option>
                                <option value="senior">Sênior</option>
                            </select>
                        </label>
                    </div>

                    <div class="jobs-filter-extras" role="group" aria-label="Filtros extras">
                        <label class="jobs-check">
                            <input
                                v-model="filters.workModel"
                                type="checkbox"
                                class="jobs-check-input"
                                true-value="remote"
                                false-value=""
                            >
                            <span>Somente remotas</span>
                        </label>
                        <label class="jobs-check" :title="adsAudienceHelpText">
                            <input
                                v-model="filters.target"
                                type="checkbox"
                                class="jobs-check-input"
                                true-value="ads"
                                false-value=""
                                aria-describedby="jobs-ads-filter-hint"
                            >
                            <span>Com foco em ADS</span>
                        </label>
                    </div>
                    <p id="jobs-ads-filter-hint" class="jobs-extras-hint">
                        <span class="jobs-extras-hint-label">ADS</span>
                        = Análise e Desenvolvimento de Sistemas. Com o filtro ativo, priorizamos vagas alinhadas a quem está na grade (entrada na carreira + stacks comuns como Node, Java, Vue).
                    </p>

                    <div class="sd-filter-actions mt-1">
                        <button type="button" class="sd-button sd-button-primary" :disabled="loading" @click="applyFilters">
                            {{ loading ? 'Carregando...' : 'Aplicar filtros' }}
                        </button>
                        <button type="button" class="sd-button sd-button-secondary sd-filter-secondary-btn" :disabled="loading" @click="clearFilters">
                            Limpar
                        </button>
                    </div>
                </div>

                <div v-if="activeFilterLabels.length" class="mt-3 flex flex-wrap gap-2">
                    <span class="text-xs text-muted">Filtros ativos:</span>
                    <Badge v-for="label in activeFilterLabels" :key="label" tone="neutral">
                        {{ label }}
                    </Badge>
                </div>
            </section>

            <div v-if="error" class="sd-error mt-6">
                {{ error }}
            </div>

            <div v-else-if="loading" class="sd-notice mt-6">
                Carregando vagas...
            </div>

            <section v-else class="mt-8 jobs-results-wrap">
                <div class="jobs-results-head">
                    <div class="jobs-results-title-block">
                        <h2 class="text-xl font-extrabold jobs-results-title">Resultados</h2>
                        <p class="jobs-results-subline">Lista filtrada para foco em TI; trate cada card como referência e confira o edital no site da empresa.</p>
                    </div>
                    <div class="sd-metric-chip jobs-results-metric" :title="resultsCountTitle">
                        <span class="sd-metric-chip-value">{{ pagination.total }} vaga(s) na busca</span>
                        <span class="sd-metric-chip-label jobs-copy-desktop">
                            Últimos 7 dias · deduplicadas · {{ JOBS_PAGE_SIZE }} por página
                        </span>
                        <span class="sd-metric-chip-label jobs-copy-mobile">
                            7 dias · deduplicadas · {{ JOBS_PAGE_SIZE }}/página
                        </span>
                    </div>
                </div>
                <div v-if="jobs.length" class="mt-5 grid gap-4 jobs-list-grid">
                    <article v-for="job in jobs" :key="job.id" class="sd-card-item p-5 jobs-item">
                        <div class="jobs-card-head">
                            <div class="jobs-card-main">
                                <div class="jobs-company-avatar" aria-hidden="true">
                                    {{ companyInitial(job.companyName) }}
                                </div>
                                <div class="min-w-0">
                                    <h3 class="jobs-card-title">{{ job.title }}</h3>
                                    <p class="jobs-card-company">{{ job.companyName || 'Empresa não informada' }}</p>
                                    <p class="jobs-card-meta">
                                        {{ relativePostedLabel(job) || 'Agora mesmo' }}
                                        <span aria-hidden="true">•</span>
                                        Fonte: Via {{ job.source }}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                class="sd-button sd-button-primary jobs-analyze-button"
                                @click="openApply(job)"
                                :title="'Abre o anúncio original para leitura completa e candidatura.'"
                            >
                                Analisar vaga
                            </button>
                        </div>
                        <div class="jobs-badges-row">
                            <Badge v-if="isNewJob(job)" tone="success">Nova</Badge>
                            <Badge tone="warning">{{ formatSeniority(job.seniority) }}</Badge>
                            <Badge tone="audio">{{ formatWorkModel(job.workModel) }}</Badge>
                            <Badge v-if="showInternationalBadge(job)" tone="neutral">Vaga internacional</Badge>
                            <span
                                v-if="(job.targetAudience || []).includes('ads')"
                                class="jobs-ads-badge-wrap"
                                :title="adsAudienceHelpText"
                            >
                                <Badge tone="primary">ADS</Badge>
                            </span>
                            <Badge v-for="tag in (job.stacks || []).slice(0, 2)" :key="`${job.id}-${tag}`" tone="neutral">
                                {{ tag }}
                            </Badge>
                        </div>
                        <p class="jobs-card-location">{{ job.location || 'Local não informado' }}</p>
                        <p v-if="job.salaryLabel" class="jobs-salary">Salário: {{ job.salaryLabel }}</p>
                        <p class="jobs-apply-hint">
                            A ação abre o anúncio original para validar requisitos, salário e prazo.
                        </p>
                    </article>
                </div>

                <div v-else class="sd-notice mt-4">
                    Nenhuma vaga encontrada com os filtros selecionados.
                </div>

                <div v-if="jobs.length" class="mt-5 flex items-center gap-2">
                    <button
                        type="button"
                        class="sd-button sd-button-secondary"
                        :disabled="loading || pagination.page <= 1"
                        @click="loadJobs(pagination.page - 1, { syncRoute: true })"
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        class="sd-button sd-button-secondary"
                        :disabled="loading || !pagination.hasNext"
                        @click="loadJobs(pagination.page + 1, { syncRoute: true })"
                    >
                        Próxima
                    </button>
                </div>
            </section>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import api from '../services/api';
import { useRoute, useRouter } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';

const route = useRoute();
const router = useRouter();
const jobs = ref([]);
const loading = ref(false);
const error = ref('');
/** Limite de vagas por página no Radar (alinha com a API pública). */
const JOBS_PAGE_SIZE = 5;

/** Texto longo para title/tooltip: o que significa o filtro e o selo ADS. */
const adsAudienceHelpText =
    'ADS é o curso de Análise e Desenvolvimento de Sistemas. Este filtro prioriza vagas com perfil de quem está começando (estágio, júnior ou nível em aberto) e stacks próximos à grade, como Node, Vue, Java, JavaScript ou QA.';

/** Tooltip resumido do bloco de contagem de resultados. */
const resultsCountTitle =
    'Incluem só anúncios com até 7 dias; o total reflete deduplicação entre fontes — pode ser menor que a soma bruta dos parceiros.';

const pagination = reactive({
    page: 1,
    pageSize: JOBS_PAGE_SIZE,
    total: 0,
    hasNext: false
});
const filters = reactive({
    q: '',
    seniority: '',
    workModel: '',
    region: '',
    stack: '',
    target: ''
});
const NEW_JOB_WINDOW_HOURS = 24;
const syncingFromRoute = ref(false);

const activeFilterLabels = computed(() => {
    const applied = normalizeRouteQuery(route.query || {});
    const labels = [];
    if (applied.q) labels.push(`Busca: ${applied.q}`);
    if (applied.seniority) labels.push(`Nível: ${formatSeniority(applied.seniority)}`);
    if (applied.workModel === 'remote') labels.push('Somente remotas');
    else if (applied.workModel) labels.push(`Modelo: ${formatWorkModel(applied.workModel)}`);
    if (applied.region) {
        labels.push(
            applied.region === 'brazil' ? 'Onde: Brasil' : 'Onde: fora do Brasil'
        );
    }
    if (applied.stack) labels.push(`Stack: ${applied.stack}`);
    if (applied.target === 'ads') labels.push('Foco ADS');
    return labels;
});

function formatSeniority(value) {
    const map = { intern: 'Estágio', junior: 'Júnior', mid: 'Pleno', senior: 'Sênior', unknown: 'Nível aberto' };
    return map[value] || 'Nível aberto';
}

function formatWorkModel(value) {
    const map = { remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial', unknown: 'Modelo aberto' };
    return map[value] || 'Modelo aberto';
}

function buildQuery(page = 1) {
    const pageSize = Math.min(
        JOBS_PAGE_SIZE,
        Math.max(1, Number(pagination.pageSize) || JOBS_PAGE_SIZE)
    );
    const query = {
        page,
        pageSize
    };
    if (filters.q) query.q = filters.q;
    if (filters.seniority) query.seniority = filters.seniority;
    if (filters.workModel) query.workModel = filters.workModel;
    if (filters.region) query.region = filters.region;
    if (filters.stack) query.stack = filters.stack.toLowerCase();
    if (filters.target) query.target = filters.target.toLowerCase();
    return query;
}

function normalizeRouteQuery(query) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || pagination.pageSize || JOBS_PAGE_SIZE);
    return {
        q: String(query.q || '').trim(),
        seniority: String(query.seniority || '').trim(),
        workModel: String(query.workModel || '').trim(),
        region: String(query.region || '').trim(),
        stack: String(query.stack || '').trim(),
        target: String(query.target || '').trim(),
        page: Number.isInteger(page) && page > 0 ? page : 1,
        pageSize:
            Number.isInteger(pageSize) && pageSize > 0
                ? Math.min(JOBS_PAGE_SIZE, pageSize)
                : JOBS_PAGE_SIZE
    };
}

function syncFiltersFromRoute(query) {
    const normalized = normalizeRouteQuery(query);
    filters.q = normalized.q;
    filters.seniority = normalized.seniority;
    filters.workModel = normalized.workModel;
    filters.region = normalized.region;
    filters.stack = normalized.stack;
    filters.target = normalized.target;
    pagination.pageSize = normalized.pageSize;
    return normalized.page;
}

function buildRouteQuery(page = 1) {
    const query = {};
    if (filters.q) query.q = filters.q;
    if (filters.seniority) query.seniority = filters.seniority;
    if (filters.workModel) query.workModel = filters.workModel;
    if (filters.region) query.region = filters.region;
    if (filters.stack) query.stack = filters.stack.toLowerCase();
    if (filters.target) query.target = filters.target.toLowerCase();
    if (page > 1) query.page = String(page);
    if (pagination.pageSize !== JOBS_PAGE_SIZE) query.pageSize = String(pagination.pageSize);
    return query;
}

async function updateRouteQuery(page = 1) {
    const nextQuery = buildRouteQuery(page);
    const currentQuery = route.query || {};
    if (JSON.stringify(nextQuery) === JSON.stringify(currentQuery)) return;
    syncingFromRoute.value = true;
    try {
        await router.replace({ query: nextQuery });
    } finally {
        syncingFromRoute.value = false;
    }
}

function clearFilters() {
    filters.q = '';
    filters.seniority = '';
    filters.workModel = '';
    filters.region = '';
    filters.stack = '';
    filters.target = '';
    applyFilters();
}

function applyFilters() {
    loadJobs(1, { syncRoute: true });
}

async function loadJobs(page = 1, { syncRoute = false } = {}) {
    if (syncRoute) {
        await updateRouteQuery(page);
    }
    loading.value = true;
    error.value = '';
    try {
        const { data } = await api.get('/jobs/public', { params: buildQuery(page) });
        jobs.value = Array.isArray(data?.items) ? data.items : [];
        pagination.page = Number(data?.pagination?.page || page);
        pagination.pageSize = Number(data?.pagination?.pageSize || pagination.pageSize);
        pagination.total = Number(data?.pagination?.total || 0);
        pagination.hasNext = Boolean(data?.pagination?.hasNext);
    } catch (err) {
        error.value = err?.response?.data?.message || 'Não foi possível carregar as vagas agora.';
    } finally {
        loading.value = false;
    }
}

async function openApply(job) {
    const targetUrl = String(job?.applyUrl || '').trim();
    if (!targetUrl) return;
    try {
        await api.post(`/jobs/public/${job.id}/click`);
    } catch {
        // Não bloqueia candidatura se métrica falhar.
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

function isNewJob(job) {
    const publishedAt = String(job?.publishedAt || '').trim();
    if (!publishedAt) return false;
    const publishedMs = new Date(publishedAt).getTime();
    if (Number.isNaN(publishedMs)) return false;
    const diffHours = (Date.now() - publishedMs) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= NEW_JOB_WINDOW_HOURS;
}

function relativePostedLabel(job) {
    const publishedAt = String(job?.publishedAt || '').trim();
    if (!publishedAt) return '';
    const publishedMs = new Date(publishedAt).getTime();
    if (Number.isNaN(publishedMs)) return '';

    const diffMs = Date.now() - publishedMs;
    if (diffMs < 0) return 'Agora mesmo';

    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (diffMs < hourMs) {
        const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
        return `${minutes}min atrás`;
    }
    if (diffMs < dayMs) {
        const hours = Math.floor(diffMs / hourMs);
        return `${hours}h atrás`;
    }
    const days = Math.floor(diffMs / dayMs);
    return `${days}d atrás`;
}

function companyInitial(companyName) {
    const value = String(companyName || '').trim();
    return value ? value.charAt(0).toUpperCase() : 'V';
}

function showInternationalBadge(job) {
    const tag = job.regionTag;
    if (tag === 'brazil') return false;
    if (tag === 'abroad' || tag === 'mixed') return true;
    const location = String(job?.location || '').toLowerCase();
    if (!location) return false;
    return !/(^|[^a-z])(brazil|brasil|br)([^a-z]|$)/.test(location);
}

onMounted(() => {
    const initialPage = syncFiltersFromRoute(route.query);
    loadJobs(initialPage);
});

watch(
    () => route.query,
    (query) => {
        if (syncingFromRoute.value) return;
        const page = syncFiltersFromRoute(query);
        loadJobs(page);
    }
);
</script>

<style scoped>
.jobs-intro-card {
    padding: clamp(1.75rem, 4vw, 2.5rem);
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--surface) 92%, var(--primary) 5%),
        color-mix(in srgb, var(--surface) 97%, var(--primary-2) 3%)
    );
    border-color: color-mix(in srgb, var(--border) 88%, var(--primary) 12%);
}

.jobs-intro-badges {
    margin-bottom: 0.25rem;
}

.jobs-hero-lede {
    margin: 1.25rem 0 0;
    max-width: 100%;
    font-size: 1.0625rem;
    line-height: 1.65;
}

@media (min-width: 768px) {
    .jobs-hero-lede {
        margin-top: 1.5rem;
        font-size: 1.125rem;
        line-height: 1.7;
    }
}

.jobs-filters-outer {
    background: color-mix(in srgb, var(--surface-2) 35%, var(--surface));
    border-color: color-mix(in srgb, var(--border) 92%, var(--primary) 8%);
}

.jobs-search-well {
    margin: 0;
}

.jobs-copy-mobile {
    display: none;
}

.jobs-copy-desktop {
    display: inline;
}

.jobs-filter-extras {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
    margin-top: 0;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in srgb, var(--border) 85%, transparent);
}

.jobs-check {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.92rem;
    cursor: pointer;
    user-select: none;
    color: color-mix(in srgb, var(--text) 92%, transparent);
}

.jobs-check-input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--primary);
    flex-shrink: 0;
}

.jobs-extras-hint {
    margin: 0.55rem 0 0;
    max-width: 42rem;
    font-size: 0.78rem;
    line-height: 1.5;
    color: color-mix(in srgb, var(--text) 70%, transparent);
}

.jobs-extras-hint-label {
    font-weight: 800;
    color: color-mix(in srgb, var(--primary) 85%, var(--text));
}

.jobs-abbr-ads {
    text-decoration: underline dotted;
    text-underline-offset: 2px;
    cursor: help;
}

.jobs-results-wrap {
    padding: 0.15rem 0 0.5rem;
}

.jobs-results-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.85rem 1.25rem;
}

.jobs-results-title-block {
    min-width: min(100%, 22rem);
    flex: 1 1 auto;
}

.jobs-results-title {
    color: color-mix(in srgb, var(--text) 94%, var(--primary) 6%);
}

.jobs-results-subline {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--muted);
    max-width: 36rem;
}

.jobs-results-metric {
    flex-shrink: 0;
}

.jobs-ads-badge-wrap {
    display: inline-flex;
    vertical-align: middle;
    cursor: help;
}

.jobs-filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.jobs-disclaimer {
    margin-top: clamp(1.75rem, 4vw, 2.25rem);
    max-width: 100%;
    padding: 1rem 1.15rem 1.05rem 1.2rem;
    border-left: 4px solid color-mix(in srgb, var(--primary) 88%, var(--primary-2));
    border-radius: 0 14px 14px 0;
    background: color-mix(in srgb, var(--surface) 88%, var(--primary) 9%);
}

.jobs-disclaimer-title {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text) 72%, var(--primary) 28%);
}

.jobs-disclaimer-body {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.65;
    color: color-mix(in srgb, var(--text) 82%, transparent);
}

.jobs-apply-hint {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: color-mix(in srgb, var(--text) 68%, transparent);
}

.jobs-item {
    position: relative;
    border: 1px solid color-mix(in srgb, var(--primary) 14%, var(--border));
    border-radius: 16px;
    background: linear-gradient(
        105deg,
        color-mix(in srgb, var(--surface) 94%, var(--primary-2) 5%),
        color-mix(in srgb, var(--surface) 98%, var(--primary) 2%)
    );
    box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 6%, transparent);
    overflow: hidden;
}

.jobs-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 16px 0 0 16px;
    background: linear-gradient(180deg, var(--primary), var(--primary-2));
    opacity: 0.88;
}

.jobs-list-grid .jobs-item:hover {
    border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
    box-shadow: 0 10px 28px color-mix(in srgb, var(--primary) 10%, transparent);
}

.jobs-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;
}

.jobs-card-main {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.jobs-analyze-button {
    white-space: nowrap;
    flex-shrink: 0;
    padding-inline: 0.95rem;
}

.jobs-company-avatar {
    width: 46px;
    height: 46px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--primary), var(--primary-2));
    color: #ffffff;
    box-shadow: 0 8px 16px color-mix(in srgb, var(--primary) 20%, transparent);
    font-size: 1.08rem;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.jobs-card-title {
    margin: 0;
    font-size: 1.45rem;
    line-height: 1.15;
    font-weight: 800;
}

.jobs-card-company {
    margin-top: 0.18rem;
    font-size: 1.02rem;
    font-weight: 700;
}

.jobs-card-meta {
    margin-top: 0.22rem;
    font-size: 0.82rem;
    color: color-mix(in srgb, var(--text) 72%, transparent);
    display: flex;
    gap: 0.4rem;
    align-items: center;
}

.jobs-badges-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: 0.85rem;
}

.jobs-card-location {
    margin-top: 0.65rem;
    font-size: 0.96rem;
}

.jobs-salary {
    margin-top: 0.2rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: color-mix(in srgb, var(--success) 78%, var(--text));
}

@media (max-width: 640px) {
    .jobs-copy-desktop {
        display: none;
    }

    .jobs-copy-mobile {
        display: inline;
    }

    .jobs-results-head {
        flex-direction: column;
        align-items: stretch;
        gap: 0.65rem;
    }

    .jobs-results-metric.sd-metric-chip {
        align-items: flex-start;
        text-align: left;
        max-width: 100%;
    }

    .jobs-results-metric .sd-metric-chip-label {
        text-align: left;
    }

    .jobs-item {
        padding: 0.95rem !important;
    }

    .jobs-card-head {
        flex-direction: column;
        align-items: stretch;
        gap: 0.65rem;
    }

    .jobs-card-main {
        align-items: flex-start;
        gap: 0.65rem;
    }

    .jobs-company-avatar {
        width: 40px;
        height: 40px;
        font-size: 0.95rem;
    }

    .jobs-card-title {
        font-size: 1.08rem;
        line-height: 1.2;
    }

    .jobs-card-company {
        font-size: 0.92rem;
        line-height: 1.25;
    }

    .jobs-card-meta {
        font-size: 0.74rem;
        gap: 0.32rem;
        flex-wrap: wrap;
    }

    .jobs-analyze-button {
        width: 100%;
        justify-content: center;
        text-align: center;
        padding-inline: 0.85rem;
        min-height: 2.2rem;
    }

    .jobs-badges-row {
        margin-top: 0.65rem;
        gap: 0.34rem;
    }

    .jobs-card-location,
    .jobs-salary {
        font-size: 0.88rem;
    }

    .jobs-apply-hint {
        margin-top: 0.4rem;
        font-size: 0.7rem;
        line-height: 1.35;
    }

    .mt-5.flex.items-center.gap-2 {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 0.45rem;
    }

    .mt-5.flex.items-center.gap-2 .sd-button {
        width: 100%;
        justify-content: center;
    }
}
</style>
