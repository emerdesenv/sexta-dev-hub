<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-6">
            <main class="py-8">
                <div class="grid gap-6 lg:grid-cols-[300px_1fr]">
                    <aside class="lg:sticky lg:top-24 self-start">
                        <div class="sd-card p-6">
                            <span class="sd-badge sd-badge-primary">Gestão administrativa</span>
                            <h2 class="mt-4 text-xl font-bold">
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
                        <EpisodeForm
                            v-if="showForm"
                            :editing="editing"
                            :model-value="selectedEpisode"
                            @submit="handleSubmit"
                            @cancel="resetForm"
                        />

                        <div class="sd-card p-6 overflow-auto">
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
                                <h2 class="text-xl font-bold">Episódios cadastrados</h2>
                                <span class="sd-badge">{{ episodes.length }} registro(s)</span>
                            </div>

                            <table class="sd-table mt-4">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Ano</th>
                                        <th>Status</th>
                                        <th>Categoria</th>
                                        <th class="text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="episode in episodes"
                                        :key="episode.id"
                                        class="hover:bg-surface-2/40"
                                    >
                                        <td class="font-medium">{{ episode.title }}</td>
                                        <td>{{ episode.year_target }}º ano</td>
                                        <td class="text-muted">
                                            {{ episode.is_published ? 'Publicado' : 'Rascunho' }}
                                        </td>
                                        <td>{{ episode.category }}</td>
                                        <td class="text-right">
                                            <div class="flex gap-2 flex-wrap justify-end">
                                                <button
                                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                                    type="button"
                                                    :disabled="isMutating || loadingEpisodes"
                                                    @click="editEpisode(episode)"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    class="sd-button sd-button-danger px-3 py-2 text-sm"
                                                    type="button"
                                                    :disabled="isMutating || loadingEpisodes"
                                                    @click="removeEpisode(episode.id)"
                                                >
                                                    Excluir
                                                </button>
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
import { onMounted, ref } from 'vue';
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

onMounted(loadEpisodes);
</script>
