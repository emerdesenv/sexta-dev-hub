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
                                <Badge tone="primary">+{{ episode.xp_reward || 40 }} XP</Badge>
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
                                    v-if="episode.pdf_url && enablePdfPreview && isDesktop"
                                    type="button"
                                    class="sd-button sd-button-primary"
                                    @click="showPdfPreview = !showPdfPreview"
                                >
                                    {{ showPdfPreview ? 'Ocultar pré-visualização' : 'Ver PDF aqui' }}
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
                                <button
                                    v-if="auth.isAuthenticated && episode.episode_type !== 'assessment'"
                                    class="sd-button sd-button-primary"
                                    :disabled="completing"
                                    type="button"
                                    @click="markCompleted"
                                >
                                    {{ completing ? 'Registrando...' : 'Marcar como concluído' }}
                                </button>
                            </div>
                            <div v-if="completionMessage" class="sd-notice mt-3">
                                {{ completionMessage }}
                            </div>

                            <section v-if="auth.isAuthenticated && episode.episode_type === 'assessment'" class="sd-card p-4 mt-3 flex flex-col gap-4">
                                <h2 class="text-lg font-semibold">Missão avaliativa</h2>
                                <p class="text-sm text-muted">
                                    Nota mínima: {{ episode.passing_score }}% • Tentativas: {{ assessmentState.attemptsUsed }}/{{ episode.max_attempts }}
                                </p>
                                <p v-if="assessmentState.bestScore !== null" class="text-sm text-muted">
                                    Melhor nota: {{ Math.round(assessmentState.bestScore) }}%
                                </p>
                                <div v-if="assessmentState.attemptHistory.length" class="sd-card p-3">
                                    <p class="text-sm font-semibold mb-2">Histórico de tentativas</p>
                                    <div class="flex flex-col gap-2">
                                        <div
                                            v-for="entry in assessmentState.attemptHistory"
                                            :key="`attempt-${entry.attemptNumber}`"
                                            class="flex flex-wrap items-center justify-between gap-2 text-sm"
                                        >
                                            <span>Tentativa {{ entry.attemptNumber }}</span>
                                            <span class="text-muted">Nota: {{ entry.score ?? '-' }}%</span>
                                            <span :class="entry.passed ? 'review-status-ok' : 'review-status-needs'">
                                                {{ entry.passed ? 'Aprovado' : 'Reprovado' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    v-if="!assessmentState.attemptId && !assessmentState.completed"
                                    class="sd-button sd-button-primary w-fit"
                                    :disabled="assessmentState.loading || assessmentState.locked"
                                    type="button"
                                    @click="startAttempt"
                                >
                                    {{ assessmentState.locked ? 'Tentativas esgotadas' : (assessmentState.loading ? 'Iniciando...' : 'Iniciar avaliação') }}
                                </button>

                                <div v-if="assessmentState.attemptId && episode.assessment_mode === 'quiz'" class="flex flex-col gap-4">
                                    <div v-for="(question, qIndex) in (episode.assessment_config?.questions || [])" :key="question.id || qIndex" class="sd-card p-3">
                                        <p class="font-medium mb-2">{{ qIndex + 1 }}. {{ question.prompt }}</p>
                                        <label
                                            v-for="(option, optionIndex) in (question.options || [])"
                                            :key="`q-${qIndex}-o-${optionIndex}`"
                                            class="flex items-center gap-2 text-sm mb-1"
                                        >
                                            <input
                                                type="radio"
                                                :name="`question-${qIndex}`"
                                                :value="optionIndex"
                                                v-model.number="assessmentState.quizAnswers[qIndex]"
                                            />
                                            <span>{{ option }}</span>
                                        </label>
                                    </div>
                                </div>

                                <div v-else-if="assessmentState.attemptId && episode.assessment_mode === 'open_text'" class="flex flex-col gap-2">
                                    <p class="text-sm">{{ episode.assessment_config?.prompt || 'Escreva sua resposta:' }}</p>
                                    <textarea class="sd-input" rows="5" v-model="assessmentState.openTextAnswer" />
                                </div>

                                <div v-else-if="assessmentState.attemptId" class="flex flex-col gap-3">
                                    <p class="text-sm">{{ episode.assessment_config?.prompt || 'Ordene os itens na sequência correta' }}</p>
                                    <div class="grid grid-cols-1 gap-2">
                                        <div v-for="(item, index) in assessmentState.orderingItems" :key="item.id || index" class="sd-card p-3 flex items-center justify-between gap-2">
                                            <span class="text-sm">{{ index + 1 }}. {{ item.label }}</span>
                                            <div class="flex gap-1">
                                                <button
                                                    type="button"
                                                    class="sd-button sd-button-secondary px-2 py-1 text-xs"
                                                    :disabled="index === 0"
                                                    @click="moveOrderingItem(index, -1)"
                                                >
                                                    Subir
                                                </button>
                                                <button
                                                    type="button"
                                                    class="sd-button sd-button-secondary px-2 py-1 text-xs"
                                                    :disabled="index === assessmentState.orderingItems.length - 1"
                                                    @click="moveOrderingItem(index, 1)"
                                                >
                                                    Descer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    v-if="assessmentState.attemptId"
                                    class="sd-button sd-button-primary w-fit"
                                    :disabled="assessmentState.loading"
                                    type="button"
                                    @click="submitAttempt"
                                >
                                    {{ assessmentState.loading ? 'Enviando...' : 'Enviar avaliação' }}
                                </button>

                                <div v-if="assessmentState.message" class="sd-notice">
                                    {{ assessmentState.message }}
                                </div>
                                <button
                                    v-if="assessmentState.wrongAnswers.length && !assessmentState.locked && !assessmentState.attemptId"
                                    type="button"
                                    class="sd-button sd-button-secondary w-fit"
                                    @click="assessmentState.showReviewModal = true"
                                >
                                    Revisar acertos e erros ({{ assessmentState.wrongAnswers.length }})
                                </button>
                            </section>
                        </div>
                    </div>

                    <Suspense v-if="episode.pdf_url && enablePdfPreview && isDesktop && showPdfPreview">
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

        <Teleport to="body">
            <div
                v-if="assessmentState.showReviewModal"
                class="episode-gate-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Revisão de respostas"
                @click.self="assessmentState.showReviewModal = false"
            >
                <div class="episode-gate-modal !max-w-2xl max-h-[82vh] overflow-y-auto" @click.stop>
                    <div class="flex items-center justify-between gap-2">
                        <h3 class="text-lg font-bold">Revisão de desempenho</h3>
                        <button
                            type="button"
                            class="sd-button sd-button-secondary px-3 py-2 text-sm"
                            @click="assessmentState.showReviewModal = false"
                        >
                            Fechar
                        </button>
                    </div>

                    <p class="text-sm text-muted mt-2">
                        Confira seu resultado e o esperado para cada critério/item.
                    </p>
                    <div class="mt-3 flex gap-2">
                        <button
                            v-if="!assessmentState.locked && !assessmentState.attemptId && !assessmentState.completed"
                            type="button"
                            class="sd-button sd-button-primary px-3 py-2 text-sm"
                            @click="startAttemptFromReview"
                        >
                            Tentar novamente
                        </button>
                    </div>

                    <div class="mt-4 flex flex-col gap-3">
                        <div
                            v-for="(item, index) in assessmentState.wrongAnswers"
                            :key="`${item.questionId}-${index}`"
                            class="sd-card p-4"
                        >
                            <p class="font-semibold">{{ index + 1 }}. {{ item.prompt }}</p>
                            <p class="text-sm mt-2">
                                <span class="text-muted">Sua resposta:</span>
                                <b class="review-wrong-answer">{{ item.submittedLabel }}</b>
                            </p>
                            <p class="text-sm mt-1">
                                <span class="text-muted">Resposta correta:</span>
                                <b class="review-correct-answer">{{ item.expectedLabel }}</b>
                            </p>
                            <div class="mt-2">
                                <span :class="item.status === 'ok' ? 'review-status-ok' : 'review-status-needs'">
                                    {{ item.status === 'ok' ? 'OK' : 'Ajustar' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
        <Footer />
    </div>
</template>

<script setup>
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
import { useAuthStore } from '../stores/auth';
const PdfPreview = defineAsyncComponent(() => import('../components/PdfPreview.vue'));
const route = useRoute();
const auth = useAuthStore();
const episode = ref(null);
const loading = ref(false);
const error = ref('');
const enablePdfPreview = String(import.meta.env.VITE_ENABLE_PDF_PREVIEW || 'true').toLowerCase() === 'true';
const showPdfPreview = ref(false);
const pdfDownloadName = ref('episodio.pdf');
const isDesktop = ref(false);
let desktopMediaQuery = null;
const completing = ref(false);
const completionMessage = ref('');
const assessmentState = ref({
    attemptId: null,
    attemptsUsed: 0,
    bestScore: null,
    loading: false,
    message: '',
    completed: false,
    locked: false,
    showReviewModal: false,
    wrongAnswers: [],
    attemptHistory: [],
    quizAnswers: [],
    openTextAnswer: '',
    orderingItems: []
});

function syncDesktopState() {
    if (!desktopMediaQuery) return;
    isDesktop.value = desktopMediaQuery.matches;
    if (!isDesktop.value) showPdfPreview.value = false;
}
async function loadEpisode() {
    loading.value = true;
    error.value = '';
    episode.value = null;

    try {
        const { data } = await api.get(`/episodes/public/${route.params.slug}`);
        episode.value = data;
        if (data?.episode_type === 'assessment') {
            assessmentState.value.attemptsUsed = Number(data.assessment_attempts_used || 0);
            assessmentState.value.attemptId = null;
            assessmentState.value.completed = Boolean(data.assessment_passed);
            assessmentState.value.bestScore = data.assessment_best_score === null || data.assessment_best_score === undefined
                ? null
                : Number(data.assessment_best_score);
            assessmentState.value.locked = Boolean(data.assessment_locked);
            assessmentState.value.quizAnswers = new Array((data.assessment_config?.questions || []).length).fill(null);
            assessmentState.value.openTextAnswer = '';
            assessmentState.value.showReviewModal = false;
            assessmentState.value.wrongAnswers = Array.isArray(data.assessment_wrong_answers)
                ? data.assessment_wrong_answers
                : [];
            assessmentState.value.attemptHistory = Array.isArray(data.assessment_attempt_history)
                ? data.assessment_attempt_history
                : [];
            assessmentState.value.orderingItems = [...(data.assessment_config?.items || [])]
                .sort(() => Math.random() - 0.5)
                .map((item) => ({ ...item }));
        }
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

async function markCompleted() {
    if (!episode.value?.id || completing.value) return;
    completing.value = true;
    completionMessage.value = '';

    try {
        const { data } = await api.post(`/gamification/episodes/${episode.value.id}/complete`);
        if (data.alreadyCompleted) {
            completionMessage.value = 'Esse episódio já estava contabilizado na sua jornada.';
        } else {
            completionMessage.value = `Progresso salvo: +${data.awarded.xp} XP e +${data.awarded.coins} moedas.`;
        }
    } catch (e) {
        completionMessage.value = e?.response?.data?.message || 'Não foi possível registrar a conclusão.';
    } finally {
        completing.value = false;
    }
}

async function startAttempt() {
    if (!episode.value?.id || assessmentState.value.locked) return;
    assessmentState.value.loading = true;
    assessmentState.value.message = '';
    try {
        const { data } = await api.post(`/gamification/episodes/${episode.value.id}/attempts/start`);
        assessmentState.value.attemptId = data.attemptId;
        assessmentState.value.attemptsUsed = Number(data.attemptNumber) - 1;
    } catch (e) {
        assessmentState.value.message = e?.response?.data?.message || 'Não foi possível iniciar a avaliação.';
    } finally {
        assessmentState.value.loading = false;
    }
}

async function startAttemptFromReview() {
    assessmentState.value.showReviewModal = false;
    await startAttempt();
}

function buildAssessmentAnswers() {
    if (episode.value.assessment_mode === 'quiz') {
        return (episode.value.assessment_config?.questions || []).map((question, idx) => ({
            questionId: question.id || `q_${idx}`,
            value: Number(assessmentState.value.quizAnswers[idx])
        }));
    }
    if (episode.value.assessment_mode === 'mini_game') {
        return { orderedItemIds: assessmentState.value.orderingItems.map((item) => item.id) };
    }
    return { text: assessmentState.value.openTextAnswer };
}

function buildReviewFromFeedback(feedback = []) {
    if (episode.value?.assessment_mode === 'mini_game') {
        const detailRows = Array.isArray(feedback?.[0]?.details) ? feedback[0].details : [];
        return detailRows.map((detail, index) => ({
            questionId: String(detail.itemId || `item_${index}`),
            prompt: `Item: ${detail.label || `Item ${index + 1}`}`,
            submittedLabel: detail.submittedPosition ? `${detail.submittedPosition}ª posição` : 'Não ordenado',
            expectedLabel: `${detail.expectedPosition}ª posição`,
            status: detail.correct ? 'ok' : 'needs_attention'
        }));
    }

    if (episode.value?.assessment_mode === 'open_text') {
        const info = feedback?.[0] || {};
        const rows = [
            {
                questionId: 'open_text_min_length',
                prompt: 'Critério: tamanho mínimo da resposta',
                submittedLabel: `${Number(info.currentLength || 0)} caracteres`,
                expectedLabel: `Mínimo ${Number(info.minLength || 15)} caracteres`,
                status: Number(info.currentLength || 0) >= Number(info.minLength || 15) ? 'ok' : 'needs_attention'
            }
        ];
        if (Number(info.minWords || 0) > 0) {
            rows.push({
                questionId: 'open_text_min_words',
                prompt: 'Critério: quantidade mínima de palavras',
                submittedLabel: `${Number(info.currentWords || 0)} palavras`,
                expectedLabel: `Mínimo ${Number(info.minWords)} palavras`,
                status: Number(info.currentWords || 0) >= Number(info.minWords) ? 'ok' : 'needs_attention'
            });
        }
        if (Array.isArray(info.requiredKeywords) && info.requiredKeywords.length) {
            rows.push({
                questionId: 'open_text_keywords',
                prompt: 'Critério: palavras-chave esperadas',
                submittedLabel: Array.isArray(info.matchedKeywords) && info.matchedKeywords.length
                    ? info.matchedKeywords.join(', ')
                    : 'Nenhuma palavra-chave identificada',
                expectedLabel: info.requiredKeywords.join(', '),
                status: Array.isArray(info.matchedKeywords) && info.matchedKeywords.length === info.requiredKeywords.length
                    ? 'ok'
                    : 'needs_attention'
            });
        }
        return rows;
    }

    const questions = episode.value?.assessment_config?.questions || [];
    const questionMap = new Map(questions.map((question, index) => [String(question.id || `q_${index}`), question]));
    return feedback
        .filter((item) => item)
        .map((item) => {
            const question = questionMap.get(String(item.questionId)) || {};
            const options = Array.isArray(question.options) ? question.options : [];
            const submittedLabel = Number.isInteger(item.submitted) && options[item.submitted] !== undefined
                ? options[item.submitted]
                : 'Não respondida';
            const expectedLabel = Number.isInteger(item.expected) && options[item.expected] !== undefined
                ? options[item.expected]
                : 'Sem gabarito disponível';
            return {
                questionId: String(item.questionId),
                prompt: question.prompt || 'Pergunta',
                submittedLabel,
                expectedLabel,
                status: item.correct ? 'ok' : 'needs_attention'
            };
        });
}

async function submitAttempt() {
    if (!assessmentState.value.attemptId || !episode.value?.id) return;
    assessmentState.value.loading = true;
    assessmentState.value.message = '';
    try {
        const payload = {
            attemptId: assessmentState.value.attemptId,
            answers: buildAssessmentAnswers()
        };
        const { data } = await api.post(`/gamification/episodes/${episode.value.id}/attempts/submit`, payload);
        assessmentState.value.attemptsUsed = Number(data.attemptsUsed || assessmentState.value.attemptsUsed + 1);
        assessmentState.value.locked = Boolean(data.locked);
        assessmentState.value.bestScore = assessmentState.value.bestScore === null
            ? Number(data.score)
            : Math.max(Number(assessmentState.value.bestScore), Number(data.score));
        assessmentState.value.wrongAnswers = buildReviewFromFeedback(data.feedback || []);
        assessmentState.value.attemptHistory = [
            {
                attemptNumber: assessmentState.value.attemptsUsed,
                score: Number(data.score),
                passed: Boolean(data.passed),
                submittedAt: new Date().toISOString()
            },
            ...assessmentState.value.attemptHistory
        ].slice(0, 5);
        assessmentState.value.showReviewModal = false;
        if (data.passed) {
            assessmentState.value.completed = true;
            assessmentState.value.attemptId = null;
            assessmentState.value.message = `Aprovado! Nota ${data.score}%. Recompensa: +${data.xpEarned} XP.`;
        } else {
            assessmentState.value.attemptId = null;
            assessmentState.value.message = `Nota ${data.score}%. Você ainda não atingiu a nota mínima de ${episode.value.passing_score}%.`;
        }
    } catch (e) {
        assessmentState.value.message = e?.response?.data?.message || 'Não foi possível enviar a avaliação.';
    } finally {
        assessmentState.value.loading = false;
    }
}

function moveOrderingItem(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= assessmentState.value.orderingItems.length) return;
    const copy = [...assessmentState.value.orderingItems];
    const current = copy[index];
    copy[index] = copy[target];
    copy[target] = current;
    assessmentState.value.orderingItems = copy;
}
onMounted(loadEpisode);
onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    syncDesktopState();
    desktopMediaQuery.addEventListener('change', syncDesktopState);
});

onBeforeUnmount(() => {
    if (desktopMediaQuery) {
        desktopMediaQuery.removeEventListener('change', syncDesktopState);
    }
});
</script>

<style scoped>
.episode-gate-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3, 8, 20, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 80;
}

.episode-gate-modal {
    width: 100%;
    max-width: 420px;
    border-radius: 14px;
    border: 1px solid rgba(47, 61, 102, 0.9);
    background: #111a2f;
    padding: 18px;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38);
}

.review-wrong-answer {
    color: #fecaca;
    background: rgba(185, 28, 28, 0.25);
    padding: 2px 8px;
    border-radius: 8px;
}

.review-correct-answer {
    color: #bbf7d0;
    background: rgba(21, 128, 61, 0.28);
    padding: 2px 8px;
    border-radius: 8px;
}

.review-status-ok {
    color: #bbf7d0;
    background: rgba(21, 128, 61, 0.28);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}

.review-status-needs {
    color: #fecaca;
    background: rgba(185, 28, 28, 0.25);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}
</style>
