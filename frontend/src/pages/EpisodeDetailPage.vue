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
                        <div class="w-full h-72 sm:h-80 md:h-[520px] rounded-2xl bg-surface-2/40 border border-border/40 flex items-center justify-center overflow-hidden">
                            <img
                                v-if="episode.cover_url"
                                :src="episode.cover_url"
                                :alt="episode.title"
                                class="w-full h-full object-contain"
                            />
                            <span v-else class="text-sm text-muted">Sem capa</span>
                        </div>

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
                                <button
                                    v-if="episode.pdf_url && enablePdfPreview"
                                    type="button"
                                    class="sd-button sd-button-primary"
                                    @click="showPdfPreview = !showPdfPreview"
                                >
                                    {{ showPdfPreview ? 'Ocultar pre-visualizacao' : 'Ver PDF aqui' }}
                                </button>
                                <a
                                    v-if="episode.pdf_url"
                                    class="sd-button sd-button-secondary"
                                    :href="episode.pdf_url"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Abrir em nova aba
                                </a>
                                <a
                                    v-if="episode.pdf_url"
                                    class="sd-button sd-button-secondary"
                                    :href="episode.pdf_url"
                                    :download="pdfDownloadName"
                                >
                                    Baixar PDF
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

                    <Suspense v-if="episode.pdf_url && enablePdfPreview && showPdfPreview">
                        <template #default>
                            <PdfPreview :src="episode.pdf_url" />
                        </template>
                        <template #fallback>
                            <section class="sd-card mt-6 p-4 md:p-5">
                                <div class="animate-pulse">
                                    <div class="h-5 w-56 rounded bg-surface-2/70 mb-4"></div>
                                    <div class="h-[440px] rounded-xl border border-border/40 bg-surface/40"></div>
                                </div>
                                <p class="text-sm text-muted mt-3">
                                    Carregando visualizador de PDF...
                                </p>
                            </section>
                        </template>
                    </Suspense>
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
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
const PdfPreview = defineAsyncComponent(() => import('../components/PdfPreview.vue'));
const route = useRoute();
const episode = ref(null);
const loading = ref(false);
const error = ref('');
const enablePdfPreview = String(import.meta.env.VITE_ENABLE_PDF_PREVIEW || 'true').toLowerCase() === 'true';
const showPdfPreview = ref(false);
const pdfDownloadName = ref('episodio.pdf');
async function loadEpisode() {
    loading.value = true;
    error.value = '';
    episode.value = null;

    try {
        const { data } = await api.get(`/episodes/public/${route.params.slug}`);
        episode.value = data;
        const safeTitle = String(data?.title || 'episodio')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        pdfDownloadName.value = `${safeTitle || 'episodio'}.pdf`;
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível carregar o episódio.';
    } finally {
        loading.value = false;
    }
}
onMounted(loadEpisode);
</script>
