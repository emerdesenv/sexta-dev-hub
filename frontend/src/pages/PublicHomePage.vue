<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-10 md:pt-10">
            <section class="sd-card sd-card-section p-7 home-hero md:grid md:grid-cols-[1.2fr_0.95fr] md:items-center md:gap-6">
                <div>
                    <div class="flex flex-wrap items-center gap-2">
                        <Badge tone="primary">Conteúdo aberto para alunos</Badge>
                        <Badge
                            v-if="auth.isAuthenticated && auth.user?.role === 'student'"
                            :tone="streakShieldCount > 0 ? 'audio' : 'neutral'"
                        >
                            Escudo de streak: {{ streakShieldCount }}
                        </Badge>
                    </div>
                    <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
                        Microaulas de ADS
                    </h1>
                    <p class="mt-4 text-base text-muted leading-7">
                        Conteúdos rápidos do <b>Sexta Dev</b> com <b>PDF e áudio</b>, abordando práticas reais de desenvolvimento de software.
                    </p>

                    <div class="mt-6 flex flex-wrap gap-3">
                        <a href="#episodios" class="sd-button sd-button-primary">
                            Explorar episódios
                        </a>
                        <router-link
                            v-if="auth.isAuthenticated"
                            to="/comunidade"
                            class="sd-button sd-button-secondary"
                        >
                            Comunidade
                        </router-link>
                        <button
                            v-else
                            type="button"
                            class="sd-button sd-button-secondary"
                            @click="showCommunityGate = true"
                        >
                            Comunidade
                        </button>
                    </div>
                </div>

                <div class="mt-6 md:mt-0 home-hero-visual-wrap">
                    <img
                        src="/home-hero-illustration.svg"
                        alt="Ilustração da plataforma Sexta Dev com notebook e fones"
                        class="home-hero-visual"
                    >
                </div>
            </section>

            <section class="mt-4">
                <div class="grid gap-3 sm:grid-cols-3">
                    <div class="sd-card-item p-4 home-kpi-card">
                        <div class="home-kpi-icon" aria-hidden="true">▶</div>
                        <div>
                            <strong class="text-2xl font-extrabold leading-none">{{ episodes.length }}</strong>
                            <div class="text-muted text-sm mt-1">episódios publicados</div>
                        </div>
                    </div>
                    <div class="sd-card-item p-4 home-kpi-card">
                        <div class="home-kpi-icon" aria-hidden="true">📄</div>
                        <div>
                            <strong class="text-xl font-extrabold leading-none">PDF + Áudio</strong>
                            <div class="text-muted text-sm mt-1">microlearning centralizado</div>
                        </div>
                    </div>
                    <div class="sd-card-item p-4 home-kpi-card">
                        <div class="home-kpi-icon" aria-hidden="true">◉</div>
                        <div>
                            <strong class="text-xl font-extrabold leading-none">GitHub / Site</strong>
                            <div class="text-muted text-sm mt-1">base pronta para produção</div>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="activeEvents.length" class="mt-8 space-y-4">
                <article
                    v-for="eventItem in activeEvents"
                    :key="eventItem.id"
                    class="sd-card sd-card-section p-6 md:p-7 event-banner"
                >
                    <div class="event-banner-grid">
                        <div class="min-w-0">
                            <Badge tone="warning">Evento relâmpago</Badge>
                            <h2 class="mt-3 text-2xl sm:text-3xl font-extrabold leading-tight">
                                {{ eventItem.title }}
                            </h2>
                            <p v-if="eventItem.description" class="mt-2 text-sm text-muted max-w-3xl">
                                {{ eventItem.description }}
                            </p>
                            <p class="mt-3 text-sm">
                                Expira em <strong>{{ eventRemainingLabel(eventItem) }}</strong>
                            </p>
                            <div class="mt-4 flex flex-wrap items-center gap-2">
                                <div
                                    v-if="eventItem.reward"
                                    class="event-chip event-chip-reward"
                                >
                                    <span class="text-lg" aria-hidden="true">{{ resolveEventVisualIcon(eventItem) }}</span>
                                    <span class="text-sm">
                                        Recompensa: <strong>{{ eventItem.reward.title }}</strong>
                                    </span>
                                </div>
                                <div
                                    v-if="eventItem.requiresCompletion"
                                    class="event-chip"
                                >
                                    <span class="text-lg" aria-hidden="true">🛡️</span>
                                    <span class="text-sm font-semibold">
                                        Tarefa: {{ eventItem.eligible ? 'concluída' : 'pendente' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="event-visual" aria-hidden="true">
                            <div class="event-visual-icon">{{ resolveEventVisualIcon(eventItem) }}</div>
                        </div>

                        <div class="shrink-0 flex flex-col gap-2">
                            <div class="event-time-card">
                                <div class="event-time-head">
                                    <span class="event-time-icon" aria-hidden="true">⏳</span>
                                    <div class="event-time-value">{{ eventRemainingLabel(eventItem) }}</div>
                                </div>
                                <div class="event-time-label">Restantes</div>
                            </div>
                            <router-link
                                v-if="eventItem.episodeSlug"
                                class="sd-button sd-button-primary"
                                :to="`/episodio/${eventItem.episodeSlug}`"
                            >
                                Fazer tarefa
                            </router-link>
                            <button
                                v-if="auth.isAuthenticated"
                                class="sd-button event-claim-button"
                                :class="{
                                    'sd-button-primary': !eventItem.claimed && !(eventItem.requiresCompletion && !eventItem.eligible),
                                    'event-claim-button-claimed': eventItem.claimed,
                                    'event-claim-button-locked': !eventItem.claimed && eventItem.requiresCompletion && !eventItem.eligible
                                }"
                                :disabled="eventItem.claimed || claimingEventId === eventItem.id || (eventItem.requiresCompletion && !eventItem.eligible)"
                                type="button"
                                @click="claimActiveEvent(eventItem)"
                            >
                                <span v-if="eventItem.claimed" aria-hidden="true">✓</span>
                                {{
                                    eventItem.claimed
                                        ? 'Já resgatado'
                                        : (
                                            eventItem.requiresCompletion && !eventItem.eligible
                                                ? 'Conclua a tarefa para resgatar'
                                                : (claimingEventId === eventItem.id ? 'Resgatando...' : 'Resgatar item')
                                        )
                                }}
                            </button>
                            <button
                                v-else
                                class="sd-button sd-button-secondary"
                                type="button"
                                @click="goToStudentAuth"
                            >
                                Entrar para resgatar
                            </button>
                            <div v-if="eventNotice" class="text-xs" :class="eventNoticeToneClass">
                                {{ eventNotice }}
                            </div>
                        </div>
                    </div>
                </article>
            </section>

            <section id="episodios" class="mt-8">
                <div class="sd-card sd-card-section p-5 md:p-6 home-filter-shell">
                <div class="flex items-center justify-between gap-4 flex-wrap">
                    <div
                        class="episode-tab-switch home-tab-switch inline-flex rounded-2xl border border-border/50 bg-surface/40 p-1 shadow-sm"
                        role="tablist"
                        aria-label="Tipo de episódio"
                    >
                        <button
                            type="button"
                            class="episode-tab-btn"
                            :class="{ 'episode-tab-btn--active': activeTab === 'study' }"
                            @click="activeTab = 'study'"
                            role="tab"
                            :aria-selected="activeTab === 'study'"
                        >
                            Estudos
                        </button>
                        <button
                            type="button"
                            class="episode-tab-btn"
                            :class="{ 'episode-tab-btn--active': activeTab === 'assessment' }"
                            @click="activeTab = 'assessment'"
                            role="tab"
                            :aria-selected="activeTab === 'assessment'"
                        >
                            Atividades
                        </button>
                    </div>
                </div>
                <div class="mt-4 home-filter-grid">
                    <label class="home-filter-field">
                        <span class="sd-label">Ano</span>
                        <select class="sd-input home-filter-input" v-model="filters.year">
                            <option value="">Todos os anos</option>
                            <option value="1">1º ano</option>
                            <option value="2">2º ano</option>
                            <option value="3">3º ano</option>
                        </select>
                    </label>

                    <label class="home-filter-field">
                        <span class="sd-label">Categoria</span>
                        <input
                            class="sd-input home-filter-input"
                            v-model="filters.category"
                            placeholder="Filtrar por categoria"
                        />
                    </label>

                    <button
                        class="sd-button sd-button-primary home-filter-button"
                        :disabled="loading"
                        @click="loadEpisodes"
                        type="button"
                    >
                        {{ loading ? 'Carregando...' : 'Filtrar' }}
                    </button>
                </div>
                </div>
            </section>

            <div v-if="error" class="sd-error mt-6">
                {{ error }}
            </div>

            <div v-else-if="loading" class="sd-notice mt-8">
                Carregando episódios...
            </div>

            <div v-else-if="episodes.length" class="mt-10">
                <section v-if="newEpisodes.length">
                    <div class="flex items-end justify-between gap-3 flex-wrap">
                        <h2 class="text-xl font-extrabold">Novos</h2>
                        <span class="text-xs text-muted">
                            Últimos {{ NEW_DAYS_WINDOW }} dias
                        </span>
                    </div>
                    <div class="mt-4 grid gap-6 md:gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        <EpisodeCard v-for="episode in newEpisodes" :key="`new-${episode.id}`" :episode="episode" />
                    </div>
                </section>

                <section class="mt-10">
                    <div class="flex items-center justify-between gap-4 flex-wrap">
                        <h2 class="text-xl font-extrabold">
                            {{ activeTab === 'assessment' ? 'Atividades' : 'Estudos' }}
                        </h2>
                    </div>
                    <div v-if="tabEpisodes.length" class="mt-4 grid gap-6 md:gap-7 sm:grid-cols-2 lg:grid-cols-3">
                        <EpisodeCard v-for="episode in tabEpisodes" :key="episode.id" :episode="episode" />
                    </div>
                    <div v-else class="sd-notice mt-4">
                        Nenhum episódio encontrado para esta seção com os filtros selecionados.
                    </div>
                </section>
            </div>

            <div v-else class="sd-notice mt-6">
                Nenhum episódio publicado encontrado com os filtros selecionados.
            </div>
        </PageContainer>
        <Footer />

        <StudentAuthGateModal
            v-model="showCommunityGate"
            aria-label="Acesso à comunidade"
            description="Entre como aluno para participar da comunidade, trocar conhecimento e acompanhar conteúdos compartilhados por outros estudantes e desenvolvedores."
            @auth="onCommunityGateAuth"
        />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeCard from '../components/EpisodeCard.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
import StudentAuthGateModal from '../components/StudentAuthGateModal.vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const episodes = ref([]);
const loading = ref(false);
const error = ref('');
const filters = reactive({ year: '', category: '' });
const githubUrl = import.meta.env.VITE_GITHUB_URL || '';
const streakShieldCount = ref(0);
const auth = useAuthStore();
const router = useRouter();
const completedEpisodeSlugs = ref(new Set());
const activeTab = ref('study'); // 'study' | 'assessment'

const NEW_DAYS_WINDOW = 7;

const activeEvents = ref([]);
const claimingEventId = ref(null);
const eventNotice = ref('');
const showCommunityGate = ref(false);

const eventNoticeToneClass = computed(() => (
    String(eventNotice.value || '').toLowerCase().includes('sucesso')
        ? 'text-success'
        : 'text-muted'
));

function eventRemainingLabel(eventItem) {
    const end = eventItem?.endAt ? new Date(eventItem.endAt) : null;
    if (!end || Number.isNaN(end.getTime())) return '-';
    const diffMs = end.getTime() - Date.now();
    if (diffMs <= 0) return '0min';
    const totalMin = Math.ceil(diffMs / 60000);
    if (totalMin < 60) return `${totalMin}min`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m ? `${h}h${m}m` : `${h}h`;
}

function resolveEventVisualIcon(eventItem) {
    const text = `${eventItem?.title || ''} ${eventItem?.description || ''} ${eventItem?.reward?.title || ''} ${eventItem?.reward?.category || ''}`.toLowerCase();
    if (text.includes('boné') || text.includes('bone') || text.includes('hat') || text.includes('cap')) return '🧢';
    if (text.includes('camisa') || text.includes('camiseta') || text.includes('shirt')) return '👕';
    if (text.includes('mochila') || text.includes('backpack')) return '🎒';
    if (text.includes('fone') || text.includes('headset')) return '🎧';
    if (text.includes('caneca') || text.includes('mug')) return '☕';
    return '🎁';
}

function goToStudentAuth() {
    router.push('/aluno');
}

function onCommunityGateAuth() {
    showCommunityGate.value = false;
    goToStudentAuth();
}

async function loadActiveEvent() {
    try {
        const { data } = await api.get('/events/active');
        if (Array.isArray(data?.events)) {
            activeEvents.value = data.events;
            return;
        }
        activeEvents.value = data?.event ? [data.event] : [];
    } catch {
        activeEvents.value = [];
    }
}

async function claimActiveEvent(eventItem) {
    if (!eventItem?.id || claimingEventId.value) return;
    eventNotice.value = '';
    claimingEventId.value = eventItem.id;
    try {
        const { data } = await api.post(`/events/${eventItem.id}/claim`);
        const updated = data?.event || { ...eventItem, claimed: true };
        activeEvents.value = activeEvents.value.map((item) => (
            item.id === eventItem.id ? updated : item
        ));
        eventNotice.value = 'Sucesso: item resgatado e salvo na sua coleção.';
    } catch (e) {
        eventNotice.value = e?.response?.data?.message || 'Não foi possível resgatar o item do evento.';
    } finally {
        claimingEventId.value = null;
    }
}

function parseEpisodeDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

const filteredEpisodes = computed(() => {
    const year = String(filters.year || '').trim();
    const category = String(filters.category || '').trim().toLowerCase();
    return (episodes.value || []).filter((episode) => {
        if (year && String(episode.year_target) !== year) return false;
        if (category && !String(episode.category || '').toLowerCase().includes(category)) return false;
        return true;
    });
});

const tabAllEpisodes = computed(() => (
    filteredEpisodes.value
        .filter((episode) => String(episode.episode_type || 'study') === String(activeTab.value))
        .slice()
        .sort((a, b) => {
            const da = parseEpisodeDate(a.created_at) || parseEpisodeDate(a.updated_at);
            const db = parseEpisodeDate(b.created_at) || parseEpisodeDate(b.updated_at);
            if (da && db) return db.getTime() - da.getTime();
            return Number(b.ordering || 0) - Number(a.ordering || 0);
        })
));

const newEpisodes = computed(() => {
    const now = Date.now();
    const min = now - NEW_DAYS_WINDOW * 24 * 60 * 60 * 1000;
    const list = tabAllEpisodes.value.filter((episode) => {
        const d = parseEpisodeDate(episode.created_at) || parseEpisodeDate(episode.updated_at);
        return d ? d.getTime() >= min : false;
    });
    // fallback: se não houver datas no payload, não força "Novos"
    return list;
});

const tabEpisodes = computed(() => {
    if (!newEpisodes.value.length) return tabAllEpisodes.value;
    const newIds = new Set(newEpisodes.value.map((e) => e.id));
    return tabAllEpisodes.value.filter((e) => !newIds.has(e.id));
});

function applyCompletionState(list) {
    if (!auth.isAuthenticated || auth.user?.role !== 'student') {
        return list.map((episode) => ({ ...episode, completed: false }));
    }

    return list.map((episode) => ({
        ...episode,
        completed: Boolean(episode.completed) || completedEpisodeSlugs.value.has(episode.slug),
    }));
}

async function loadEpisodes() {
    const params = {};
    if (filters.year) params.year = filters.year;
    if (filters.category) params.category = filters.category;

    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get('/episodes/public', { params });
        episodes.value = applyCompletionState(data);
    } catch (e) {
        episodes.value = [];
        error.value = e?.response?.data?.message || 'Não foi possível carregar episódios.';
    } finally {
        loading.value = false;
    }
}

async function loadStudentPerks() {
    if (!auth.isAuthenticated || auth.user?.role !== 'student') {
        streakShieldCount.value = 0;
        completedEpisodeSlugs.value = new Set();
        episodes.value = applyCompletionState(episodes.value);
        return;
    }

    try {
        const [{ data }, { data: historyData }] = await Promise.all([
            api.get('/gamification/me'),
            api.get('/gamification/history/me'),
        ]);
        streakShieldCount.value = Number(data?.profile?.streakShieldCount || 0);
        completedEpisodeSlugs.value = new Set(
            (historyData?.completedEpisodes || [])
                .map((episode) => episode.slug)
                .filter(Boolean),
        );
        episodes.value = applyCompletionState(episodes.value);
    } catch {
        streakShieldCount.value = 0;
        completedEpisodeSlugs.value = new Set();
        episodes.value = applyCompletionState(episodes.value);
    }
}

let activeEventInterval = null;
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        loadActiveEvent();
    }
}

onMounted(async () => {
    await Promise.all([loadEpisodes(), loadStudentPerks(), loadActiveEvent()]);
    activeEventInterval = window.setInterval(loadActiveEvent, 60_000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
    if (activeEventInterval) window.clearInterval(activeEventInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.episode-tab-btn {
    border-radius: 0.9rem;
    padding: 0.55rem 0.95rem;
    font-size: 0.9rem;
    font-weight: 800;
    color: color-mix(in srgb, var(--text) 72%, transparent);
    background: transparent;
    border: 1px solid transparent;
    transition:
        background 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        transform 120ms ease;
}

.episode-tab-btn:hover {
    color: color-mix(in srgb, var(--text) 92%, transparent);
    background: color-mix(in srgb, var(--surface-2) 58%, transparent);
}

.episode-tab-btn:active {
    transform: translateY(1px);
}

.episode-tab-btn--active {
    color: var(--text);
    background: color-mix(in srgb, var(--primary) 18%, transparent);
    border-color: color-mix(in srgb, var(--primary) 40%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.episode-tab-btn:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary) 55%, transparent);
    outline-offset: 2px;
}

.event-banner {
    background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--primary) 28%, var(--surface-elevated)) 0%,
        color-mix(in srgb, var(--primary-2) 18%, var(--surface-elevated)) 58%,
        color-mix(in srgb, #f59e0b 18%, var(--surface-elevated)) 100%
    );
    border-color: color-mix(in srgb, #f59e0b 26%, var(--border));
    overflow: hidden;
    position: relative;
}

.event-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
        radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.16), transparent 35%),
        radial-gradient(circle at 82% 68%, rgba(56, 189, 248, 0.18), transparent 30%);
}

.event-banner-grid {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
    .event-banner-grid {
        grid-template-columns: minmax(0, 1.2fr) 220px auto;
        align-items: center;
    }
}

.event-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--border) 64%, white);
    background: color-mix(in srgb, var(--surface) 24%, transparent);
    padding: 0.36rem 0.72rem;
}

.event-chip-reward {
    border-color: color-mix(in srgb, var(--primary) 48%, var(--border));
}

.event-visual {
    display: none;
}

@media (min-width: 1024px) {
    .event-visual {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.event-visual-icon {
    width: 10.5rem;
    height: 10.5rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    border: 1px solid color-mix(in srgb, var(--primary-2) 35%, var(--border));
    background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--primary-2) 35%, transparent), color-mix(in srgb, var(--surface-elevated) 92%, transparent));
    box-shadow: 0 22px 40px rgba(4, 10, 24, 0.35);
}

.event-time-card {
    border-radius: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--primary-2) 52%, var(--border));
    background:
        linear-gradient(
            140deg,
            color-mix(in srgb, var(--primary) 20%, var(--surface)),
            color-mix(in srgb, var(--surface) 82%, transparent)
        );
    padding: 0.7rem 0.9rem;
    min-width: 10.5rem;
}

.event-time-head {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
}

.event-time-icon {
    width: 1.65rem;
    height: 1.65rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--primary-2) 52%, var(--border));
    background: color-mix(in srgb, var(--surface) 38%, transparent);
}

.event-time-value {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
}

.event-time-label {
    margin-top: 0.2rem;
    font-size: 0.82rem;
    color: var(--text-soft);
}

.event-claim-button {
    justify-content: center;
}

.event-claim-button-claimed {
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--success) 30%, var(--surface)),
        color-mix(in srgb, var(--surface) 92%, transparent)
    );
    border: 1px solid color-mix(in srgb, var(--success) 46%, var(--border));
    color: color-mix(in srgb, var(--success) 90%, white);
    cursor: default;
    opacity: 1;
}

.event-claim-button-locked {
    background: color-mix(in srgb, var(--surface) 65%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    color: var(--muted);
    cursor: not-allowed;
    opacity: 0.92;
}

.home-hero {
    background: linear-gradient(
        130deg,
        color-mix(in srgb, var(--primary) 14%, var(--surface)) 0%,
        color-mix(in srgb, var(--surface) 96%, transparent) 100%
    );
}

.home-hero-visual-wrap {
    display: flex;
    justify-content: center;
}

.home-hero-visual {
    width: min(100%, 29rem);
    height: auto;
    filter: drop-shadow(0 14px 28px rgba(8, 18, 43, 0.42));
}

.home-kpi-card {
    display: flex;
    align-items: center;
    gap: 0.72rem;
    border-color: color-mix(in srgb, var(--primary) 24%, var(--border));
    background: color-mix(in srgb, var(--surface-elevated) 76%, transparent);
}

.home-kpi-icon {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--border));
    background: color-mix(in srgb, var(--primary) 18%, var(--surface));
    color: color-mix(in srgb, var(--primary-2) 70%, white);
}

.home-filter-shell {
    border-color: color-mix(in srgb, var(--primary) 24%, var(--border));
    background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 40%),
        color-mix(in srgb, var(--surface) 96%, transparent);
}

.home-tab-switch {
    border-color: color-mix(in srgb, var(--primary) 28%, var(--border));
    background: color-mix(in srgb, var(--surface-2) 35%, var(--surface));
}

.home-filter-grid {
    display: grid;
    gap: 0.85rem;
    grid-template-columns: 1fr;
    align-items: end;
}

@media (min-width: 900px) {
    .home-filter-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    }
}

.home-filter-field {
    min-width: 0;
}

.home-filter-input {
    min-height: 3rem;
    border-color: color-mix(in srgb, var(--primary) 22%, var(--border));
    background: color-mix(in srgb, var(--surface-2) 36%, var(--surface));
}

.home-filter-button {
    min-height: 3rem;
    height: 3rem;
    min-width: 6rem;
    padding-left: 1.05rem;
    padding-right: 1.05rem;
    align-self: end;
    border-radius: 0.8rem;
}

body[data-theme='light'] .home-hero {
    background: linear-gradient(
        130deg,
        color-mix(in srgb, var(--primary) 11%, #ffffff) 0%,
        #ffffff 100%
    );
}
</style>
