<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10">
            <section class="sd-card p-7 md:grid md:grid-cols-[1.35fr_0.9fr] md:items-center md:gap-6">
                <div>
                    <Badge tone="primary">Conteúdo aberto para alunos</Badge>
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
                    </div>
                </div>

                <div class="mt-6 md:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <strong class="text-3xl font-extrabold">{{ episodes.length }}</strong>
                        <div class="text-muted text-sm mt-1">episódios publicados</div>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <strong class="text-xl font-extrabold">PDF + Áudio</strong>
                        <div class="text-muted text-sm mt-1">microlearning centralizado</div>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
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

            <div v-else-if="episodes.length" class="mt-10 grid gap-6 md:gap-7 sm:grid-cols-2 lg:grid-cols-3">
                <EpisodeCard v-for="episode in episodes" :key="episode.id" :episode="episode" />
            </div>

            <div v-else class="sd-notice mt-6">
                Nenhum episódio publicado encontrado com os filtros selecionados.
            </div>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeCard from '../components/EpisodeCard.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';

const episodes = ref([]);
const loading = ref(false);
const error = ref('');
const filters = reactive({ year: '', category: '' });

async function loadEpisodes() {
    const params = {};
    if (filters.year) params.year = filters.year;
    if (filters.category) params.category = filters.category;

    loading.value = true;
    error.value = '';

    try {
        const { data } = await api.get('/episodes/public', { params });
        episodes.value = data;
    } catch (e) {
        episodes.value = [];
        error.value = e?.response?.data?.message || 'Não foi possível carregar episódios.';
    } finally {
        loading.value = false;
    }
}

onMounted(loadEpisodes);
</script>
