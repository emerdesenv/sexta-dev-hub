<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-6">
            <main class="py-10">
                <div v-if="error" class="sd-error">
                    {{ error }}
                </div>

                <div v-else-if="loading" class="sd-notice">
                    Carregando episódio...
                </div>

                <div v-else-if="episode" class="sd-card p-6 md:p-8">
                    <div class="md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:items-start">
                        <img
                            v-if="episode.cover_url"
                            :src="episode.cover_url"
                            :alt="episode.title"
                            class="w-full h-72 sm:h-80 md:h-[520px] object-cover rounded-2xl"
                        />

                        <div class="mt-6 md:mt-0 flex flex-col gap-4">
                            <div class="flex flex-wrap gap-2">
                                <Badge>{{ episode.year_target }}º ano</Badge>
                                <Badge>{{ episode.category }}</Badge>
                                <Badge v-if="episode.duration_label">{{ episode.duration_label }}</Badge>
                                <Badge v-if="episode.audio_url" tone="audio">Áudio</Badge>
                                <Badge v-if="episode.pdf_url" tone="pdf">PDF</Badge>
                            </div>

                            <h1 class="text-3xl sm:text-4xl font-extrabold leading-tight">
                                {{ episode.title }}
                            </h1>
                            <p class="text-muted leading-relaxed">
                                {{ episode.summary }}
                            </p>

                            <audio
                                v-if="episode.audio_url"
                                class="w-full mt-2"
                                controls
                                :src="episode.audio_url"
                            />

                            <div class="flex flex-wrap gap-3 pt-2">
                                <a
                                    v-if="episode.pdf_url"
                                    class="sd-button sd-button-primary"
                                    :href="episode.pdf_url"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Abrir PDF
                                </a>
                                <router-link
                                    class="sd-button sd-button-secondary"
                                    to="/"
                                >
                                    Voltar
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="sd-notice">
                    Episódio não encontrado.
                </div>
            </main>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
const route = useRoute();
const episode = ref(null);
const loading = ref(false);
const error = ref('');
async function loadEpisode() {
    loading.value = true;
    error.value = '';
    episode.value = null;

    try {
        const { data } = await api.get(`/episodes/public/${route.params.slug}`);
        episode.value = data;
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível carregar o episódio.';
    } finally {
        loading.value = false;
    }
}
onMounted(loadEpisode);
</script>
