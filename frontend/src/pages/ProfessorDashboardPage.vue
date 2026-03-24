<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-6">
            <main class="py-8">
                <div class="grid gap-6 lg:grid-cols-[300px_1fr]">
                    <aside class="lg:sticky lg:top-24 self-start">
                        <div class="sd-card sd-card-section p-6">
                            <span class="sd-badge sd-badge-primary">Gestão administrativa</span>
                            <h2 class="mt-4 sd-card-title">
                                Olá, {{ auth.user?.username }}
                            </h2>
                            <p class="mt-2 text-muted leading-relaxed">
                                Gerencie episódios, publique materiais e mantenha a área pública atualizada.
                            </p>

                            <div class="mt-5 flex flex-col gap-3">
                                <button
                                    class="sd-button sd-button-primary w-full"
                                    type="button"
                                    :disabled="isMutating || loadingEpisodes"
                                    @click="openCreate"
                                >
                                    Novo episódio
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section class="grid gap-6">
                        <div class="sd-card p-6">
                            <div class="flex justify-between items-center gap-3 flex-wrap">
                                <h2 class="sd-section-title">Métricas de gamificação</h2>
                                <button
                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                    type="button"
                                    :disabled="loadingMetrics"
                                    @click="loadMetrics"
                                >
                                    {{ loadingMetrics ? 'Atualizando...' : 'Atualizar métricas' }}
                                </button>
                            </div>

                            <div v-if="metricsError" class="sd-error mt-4">
                                {{ metricsError }}
                            </div>

                            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Usuários ativos</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.usersWithProfile }}</strong>
                                </div>
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Episódios concluídos</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.completedEpisodes }}</strong>
                                </div>
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Missões resgatadas</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.missionClaims }}</strong>
                                </div>
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Recomp. trocadas</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.rewardsRedeemed }}</strong>
                                </div>
                            </div>

                            <div class="mt-5">
                                <h3 class="sd-card-title">
                                    Eventos recentes
                                    <span class="text-sm text-muted">({{ metrics.recentEvents.length }})</span>
                                </h3>
                                <div class="mt-2 max-h-56 sm:max-h-64 lg:max-h-80 overflow-y-auto overscroll-contain pr-1">
                                    <div class="space-y-2" v-if="metrics.recentEvents.length">
                                        <div
                                            v-for="(event, index) in metrics.recentEvents"
                                            :key="event.id || `${event.username}-${event.type}-${index}`"
                                            class="sd-list-item p-3 flex justify-between gap-4 flex-wrap"
                                        >
                                            <span class="text-sm break-words">
                                                <b>{{ event.username }}</b> • {{ event.type }}
                                            </span>
                                            <span class="text-xs text-muted">
                                                XP {{ event.xpDelta >= 0 ? '+' : '' }}{{ event.xpDelta }} • Moedas {{ event.coinsDelta >= 0 ? '+' : '' }}{{ event.coinsDelta }}
                                            </span>
                                        </div>
                                    </div>
                                    <div v-else class="sd-notice">
                                        Sem eventos de gamificação ainda.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <EpisodeForm
                            v-if="showForm"
                            :editing="editing"
                            :model-value="selectedEpisode"
                            @submit="handleSubmit"
                            @cancel="resetForm"
                        />

                        <div class="sd-card sd-card-section p-6 overflow-auto">
                            <div v-if="actionError" class="sd-error mb-4">
                                {{ actionError }}
                            </div>

                            <div v-if="episodesError" class="sd-error mb-4">
                                {{ episodesError }}
                            </div>
                            <div v-else-if="loadingEpisodes" class="sd-notice">
                                Carregando episódios...
                            </div>

                            <template v-else>
                            <div class="flex justify-between items-center gap-3 flex-wrap">
                                <h2 class="sd-section-title">Episódios cadastrados</h2>
                                <span class="sd-badge">{{ episodes.length }} registro(s)</span>
                            </div>

                            <table class="sd-table mt-4">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th class="text-right">Ano</th>
                                        <th class="text-center">Status</th>
                                        <th>Categoria</th>
                                        <th class="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="episode in paginatedEpisodes"
                                        :key="episode.id"
                                        class="hover:bg-surface-2/40"
                                    >
                                        <td class="font-medium">{{ episode.title }}</td>
                                        <td class="text-right">{{ episode.year_target }}º ano</td>
                                        <td class="text-center">
                                            <span
                                                class="sd-badge"
                                                :class="episode.is_published ? 'sd-badge-published' : 'sd-badge-draft'"
                                            >
                                                {{ episode.is_published ? 'Publicado' : 'Rascunho' }}
                                            </span>
                                        </td>
                                        <td>{{ episode.category }}</td>
                                        <td class="text-right">
                                            <div class="relative inline-flex justify-end">
                                                <button
                                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                                    type="button"
                                                    aria-label="Abrir ações do episódio"
                                                    :disabled="isMutating || loadingEpisodes"
                                                    @click.stop="toggleActionMenu(episode.id)"
                                                >
                                                    Ações
                                                </button>
                                                <div
                                                    v-if="openActionMenuId === episode.id"
                                                    class="row-actions-menu"
                                                    @click.stop
                                                >
                                                    <button
                                                        class="row-actions-item"
                                                        type="button"
                                                        :disabled="isMutating || loadingEpisodes"
                                                        @click="handleEditAction(episode)"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        class="row-actions-item row-actions-item-danger"
                                                        type="button"
                                                        :disabled="isMutating || loadingEpisodes"
                                                        @click="handleDeleteAction(episode.id)"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr v-if="episodes.length === 0">
                                        <td colspan="5" class="py-8 text-center text-muted">
                                            Nenhum episódio cadastrado.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div
                                v-if="episodes.length > 0"
                                class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                            >
                                <span class="text-sm text-muted">
                                    Mostrando {{ pageFrom }}-{{ pageTo }} de {{ totalItems }} episódio(s)
                                </span>
                                <div class="flex flex-wrap items-center gap-2">
                                    <label class="text-xs text-muted" for="per-page-select">Itens por página</label>
                                    <select
                                        id="per-page-select"
                                        v-model.number="itemsPerPage"
                                        class="sd-input !w-auto !py-2 !px-3 text-sm"
                                    >
                                        <option v-for="option in perPageOptions" :key="option" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="isMutating || loadingEpisodes || isFirstPage"
                                        @click="goToPrevPage"
                                    >
                                        Anterior
                                    </button>
                                    <span class="text-sm text-muted">
                                        Página {{ currentPage }} de {{ totalPages }}
                                    </span>
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="isMutating || loadingEpisodes || isLastPage"
                                        @click="goToNextPage"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                            </template>
                        </div>
                    </section>
                </div>
            </main>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeForm from '../components/EpisodeForm.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
const auth = useAuthStore();
const episodes = ref([]);
const showForm = ref(false);
const editing = ref(false);
const selectedEpisode = ref(null);
const loadingEpisodes = ref(false);
const episodesError = ref('');
const actionError = ref('');
const isMutating = ref(false);
const loadingMetrics = ref(false);
const metricsError = ref('');
const metrics = ref({
    totals: {
        usersWithProfile: 0,
        completedEpisodes: 0,
        missionClaims: 0,
        rewardsRedeemed: 0
    },
    recentEvents: []
});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [5, 10, 20, 50];

const totalItems = computed(() => episodes.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const paginatedEpisodes = computed(() => episodes.value.slice(startIndex.value, endIndex.value));
const pageFrom = computed(() => (totalItems.value ? startIndex.value + 1 : 0));
const pageTo = computed(() => Math.min(endIndex.value, totalItems.value));
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);
const openActionMenuId = ref(null);

watch(itemsPerPage, () => {
    currentPage.value = 1;
});

watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
        currentPage.value = pages;
    }
});

async function loadEpisodes() {
    loadingEpisodes.value = true;
    episodesError.value = '';

    try {
        const { data } = await api.get('/episodes');
        episodes.value = data;
    } catch (e) {
        episodes.value = [];
        episodesError.value = e?.response?.data?.message || 'Não foi possível carregar os episódios.';
    } finally {
        loadingEpisodes.value = false;
    }
}

async function loadMetrics() {
    loadingMetrics.value = true;
    metricsError.value = '';
    try {
        const { data } = await api.get('/gamification/admin/metrics');
        metrics.value = data;
    } catch (e) {
        metricsError.value = e?.response?.data?.message || 'Não foi possível carregar métricas de gamificação.';
    } finally {
        loadingMetrics.value = false;
    }
}

function goToPrevPage() {
    if (isFirstPage.value) return;
    currentPage.value -= 1;
}

function goToNextPage() {
    if (isLastPage.value) return;
    currentPage.value += 1;
}

function closeActionMenu() {
    openActionMenuId.value = null;
}

function toggleActionMenu(episodeId) {
    openActionMenuId.value = openActionMenuId.value === episodeId ? null : episodeId;
}

function handleEditAction(episode) {
    closeActionMenu();
    editEpisode(episode);
}

function handleDeleteAction(episodeId) {
    closeActionMenu();
    removeEpisode(episodeId);
}

function handleDocumentClick() {
    closeActionMenu();
}

function openCreate() {
    if (isMutating.value) return;
    editing.value = false;
    selectedEpisode.value = null;
    showForm.value = true;
}

function editEpisode(episode) {
    if (isMutating.value) return;
    editing.value = true;
    selectedEpisode.value = episode;
    showForm.value = true;
}

function resetForm() {
    showForm.value = false;
    editing.value = false;
    selectedEpisode.value = null;
}

async function handleSubmit(payload) {
    actionError.value = '';
    isMutating.value = true;

    try {
        if (editing.value && selectedEpisode.value) {
            await api.put(
                `/episodes/${selectedEpisode.value.id}`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
        } else {
            await api.post('/episodes', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        }

        resetForm();
        await loadEpisodes();
    } catch (e) {
        actionError.value = e?.response?.data?.message || 'Não foi possível salvar o episódio.';
    } finally {
        isMutating.value = false;
    }
}
async function removeEpisode(id) {
    if (!confirm('Deseja realmente excluir este episódio?')) return;

    actionError.value = '';
    isMutating.value = true;

    try {
        await api.delete(`/episodes/${id}`);
        await loadEpisodes();
    } catch (e) {
        actionError.value = e?.response?.data?.message || 'Não foi possível excluir o episódio.';
    } finally {
        isMutating.value = false;
    }
}

onMounted(async () => {
    document.addEventListener('click', handleDocumentClick);
    await Promise.all([loadEpisodes(), loadMetrics()]);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
.row-actions-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    z-index: 30;
    min-width: 9.5rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--border) 90%, transparent);
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.row-actions-item {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: left;
    padding: 0.625rem 0.75rem;
    cursor: pointer;
}

.row-actions-item:hover {
    background: color-mix(in srgb, var(--surface-2) 58%, transparent);
}

.row-actions-item-danger {
    color: color-mix(in srgb, var(--danger) 78%, white);
}
</style>
