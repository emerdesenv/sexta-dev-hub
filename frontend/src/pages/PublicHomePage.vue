<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10">
            <section class="sd-card sd-card-section p-7 md:grid md:grid-cols-[1.35fr_0.9fr] md:items-center md:gap-6">
                <div>
                    <Badge tone="primary">Conteúdo aberto para alunos</Badge>
                    <Badge
                        v-if="auth.isAuthenticated && auth.user?.role === 'student'"
                        :tone="streakShieldCount > 0 ? 'audio' : 'neutral'"
                        class="ml-2"
                    >
                        Escudo de streak: {{ streakShieldCount }}
                    </Badge>
                    <h1 class="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight">
                        Microaulas de ADS
                    </h1>
                    <p class="mt-4 text-base text-muted leading-7">
                        Plataforma de microlearning com conteúdos do <b>Sexta Dev</b>, desenvolvida para apoiar alunos no aprendizado de desenvolvimento de software.
                    </p>
                    <p class="mt-3 text-base text-muted leading-7">
                        Aqui você encontra <b>episódios curtos com PDF e áudio</b>, abordando temas práticos do mercado de tecnologia como boas práticas de código, versionamento, arquitetura e desenvolvimento profissional.
                    </p>

                    <div class="mt-6 flex flex-wrap gap-3">
                        <a href="#episodios" class="sd-button sd-button-primary">
                            Explorar episódios
                        </a>
                        <a
                            v-if="githubUrl"
                            :href="githubUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="sd-button sd-button-secondary"
                        >
                            Ver no GitHub
                        </a>
                    </div>
                </div>

                <div class="mt-6 md:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="sd-card-item p-4">
                        <strong class="text-3xl font-extrabold">{{ episodes.length }}</strong>
                        <div class="text-muted text-sm mt-1">episódios publicados</div>
                    </div>
                    <div class="sd-card-item p-4">
                        <strong class="text-xl font-extrabold">PDF + Áudio</strong>
                        <div class="text-muted text-sm mt-1">microlearning centralizado</div>
                    </div>
                    <div class="sd-card-item p-4">
                        <strong class="text-xl font-extrabold">GitHub / Site</strong>
                        <div class="text-muted text-sm mt-1">base pronta para produção</div>
                    </div>
                </div>
            </section>

            <section id="episodios" class="mt-10">
                <div class="flex flex-col md:flex-row md:items-end gap-4">
                    <label class="flex-1">
                        <span class="sd-label">Ano</span>
                        <select class="sd-input" v-model="filters.year">
                            <option value="">Todos os anos</option>
                            <option value="1">1º ano</option>
                            <option value="2">2º ano</option>
                            <option value="3">3º ano</option>
                        </select>
                    </label>

                    <label class="flex-1">
                        <span class="sd-label">Categoria</span>
                        <input
                            class="sd-input"
                            v-model="filters.category"
                            placeholder="Filtrar por categoria"
                        />
                    </label>

                    <button
                        class="sd-button sd-button-primary md:shrink-0"
                        :disabled="loading"
                        @click="loadEpisodes"
                        type="button"
                    >
                        {{ loading ? 'Carregando...' : 'Filtrar' }}
                    </button>
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
                        <div
                            class="episode-tab-switch inline-flex rounded-2xl border border-border/50 bg-surface/40 p-1 shadow-sm"
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
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeCard from '../components/EpisodeCard.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
import { useAuthStore } from '../stores/auth';

const episodes = ref([]);
const loading = ref(false);
const error = ref('');
const filters = reactive({ year: '', category: '' });
const githubUrl = import.meta.env.VITE_GITHUB_URL || '';
const streakShieldCount = ref(0);
const auth = useAuthStore();
const completedEpisodeSlugs = ref(new Set());
const activeTab = ref('study'); // 'study' | 'assessment'

const NEW_DAYS_WINDOW = 7;

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

onMounted(async () => {
    await Promise.all([loadEpisodes(), loadStudentPerks()]);
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
</style>
