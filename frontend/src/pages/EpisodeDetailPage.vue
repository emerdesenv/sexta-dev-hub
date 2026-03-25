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

                <div
                    v-else-if="episode"
                    class="sd-card p-6 md:p-8 episode-card-shell"
                >
                    <div class="episode-layout" :class="episodeLayoutClasses">
                        <div v-if="showEpisodeCover" class="episode-cover">
                            <img
                                v-if="episode.cover_url"
                                :src="episode.cover_url"
                                :alt="episode.title"
                                class="w-full h-full object-contain"
                            />
                            <span v-else class="text-sm text-muted">Sem capa</span>
                        </div>

                        <div
                            class="episode-main mt-6 md:mt-0 flex flex-col gap-4"
                            :class="{
                                'episode-main-challenge': isAssessmentEpisode,
                                'episode-main-study': !isAssessmentEpisode
                            }"
                        >
                            <nav class="episode-nav w-full shrink-0" aria-label="Navegação do episódio">
                                <router-link
                                    class="sd-button sd-button-secondary episode-nav-back"
                                    to="/"
                                >
                                    Voltar
                                </router-link>
                            </nav>

                            <div
                                class="flex flex-col gap-3"
                                :class="{ 'episode-challenge-hero': isAssessmentEpisode }"
                            >
                                <div class="flex flex-wrap gap-2" :class="{ 'justify-center': isAssessmentEpisode }">
                                    <Badge v-if="episode.trophy_tier" tone="warning" class="!inline-flex !items-center !gap-2">
                                        <span
                                            class="trophy-pill-dot flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-slate-900 shadow-inner"
                                            :class="trophyTierMeta(episode.trophy_tier).dotClass"
                                            aria-hidden="true"
                                        >
                                            {{ trophyTierMeta(episode.trophy_tier).short }}
                                        </span>
                                        <span class="font-semibold">{{ trophyTierMeta(episode.trophy_tier).label }}</span>
                                    </Badge>
                                    <Badge v-else tone="neutral" title="Este episódio não concede troféu na coleção">
                                        Sem troféu
                                    </Badge>
                                    <Badge tone="primary">+{{ episode.xp_reward || 40 }} XP</Badge>
                                    <Badge>{{ episode.year_target }}º ano</Badge>
                                    <Badge>{{ episode.category }}</Badge>
                                </div>

                                <div
                                    class="episode-detail-meta flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted"
                                    :class="{ 'justify-center': isAssessmentEpisode }"
                                >
                                    <span v-if="episode.duration_label" class="episode-detail-meta-item">
                                        {{ episode.duration_label }}
                                    </span>
                                    <span v-if="episode.pdf_url" class="episode-detail-meta-item">PDF</span>
                                    <span v-if="episode.audio_url" class="episode-detail-meta-item">Áudio</span>
                                </div>

                                <h1
                                    class="text-3xl sm:text-4xl font-extrabold leading-tight"
                                    :class="{ 'text-center': isAssessmentEpisode }"
                                >
                                    {{ episode.title }}
                                </h1>
                                <p
                                    v-if="episode.trophy_tier"
                                    class="text-sm text-muted max-w-2xl"
                                    :class="{ 'text-center mx-auto': isAssessmentEpisode }"
                                >
                                    Troféu <strong>{{ trophyTierMeta(episode.trophy_tier).label }}</strong> na coleção ao concluir
                                    com sucesso — não altera XP ou moedas além do que este episódio já oferece.
                                </p>
                            </div>

                            <section
                                v-if="auth.isAuthenticated && episode.episode_type === 'assessment'"
                                class="sd-card p-4 mt-1 flex flex-col gap-4"
                                :class="{ 'assessment-focus-card': isAssessmentFocus }"
                            >
                                <div class="flex flex-wrap items-start justify-between gap-3">
                                    <h2 class="text-lg font-semibold">Missão avaliativa</h2>
                                    <span
                                        v-if="assessmentState.attemptId"
                                        class="assessment-badge-live"
                                        aria-hidden="true"
                                    >
                                        Tentativa em andamento
                                    </span>
                                </div>

                                <div
                                    v-if="assessmentAnswerProgress"
                                    class="assessment-progress-block"
                                >
                                    <div class="flex justify-between gap-2 text-xs text-muted">
                                        <span>Progresso desta tentativa</span>
                                        <span>{{ assessmentAnswerProgress.label }}</span>
                                    </div>
                                    <div class="assessment-progress-track" role="progressbar" :aria-valuenow="assessmentAnswerProgress.pct" aria-valuemin="0" aria-valuemax="100">
                                        <div
                                            class="assessment-progress-fill assessment-progress-fill--primary"
                                            :style="{ width: `${assessmentAnswerProgress.pct}%` }"
                                        />
                                    </div>
                                </div>

                                <p class="text-sm text-muted">
                                    Nota mínima: {{ episode.passing_score }}% • Tentativas: {{ assessmentState.attemptsUsed }}/{{ assessmentState.maxAttempts }}
                                </p>
                                <p
                                    v-if="assessmentState.bestScore !== null && !assessmentState.attemptId"
                                    class="text-sm text-muted"
                                >
                                    Melhor nota: {{ Math.round(assessmentState.bestScore) }}%
                                </p>
                                <div v-if="assessmentState.attemptHistory.length && !assessmentState.attemptId" class="sd-card p-3">
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

                                <div
                                    v-if="!assessmentState.attemptId && !assessmentState.completed && !assessmentState.locked"
                                    class="assessment-cta"
                                >
                                    <p class="assessment-cta-kicker">Sua vez</p>
                                    <p class="assessment-cta-lead">
                                        Quando estiver pronto, inicie a contagem de tempo e mostre o que sabe.
                                    </p>
                                    <button
                                        class="sd-button sd-button-primary assessment-cta-btn"
                                        :disabled="assessmentState.loading"
                                        type="button"
                                        @click="startAttempt"
                                    >
                                        {{ assessmentState.loading ? 'Iniciando...' : 'Iniciar avaliação' }}
                                    </button>
                                </div>
                                <div
                                    v-if="!assessmentState.attemptId && !assessmentState.completed && assessmentState.locked"
                                    class="inline-flex flex-wrap items-center gap-2"
                                >
                                    <Badge tone="neutral">Bloqueado • tentativas esgotadas</Badge>
                                    <span class="text-xs text-muted">
                                        Use XP para liberar novas tentativas ou tente outro episódio.
                                    </span>
                                </div>
                                <button
                                    v-if="!assessmentState.attemptId && !assessmentState.completed && assessmentState.locked"
                                    class="sd-button sd-button-primary w-fit"
                                    :disabled="assessmentState.loading"
                                    type="button"
                                    @click="resetAttempts"
                                >
                                    {{ assessmentState.loading ? 'Processando...' : 'Desbloquear tentativas (50 XP)' }}
                                </button>
                                <p
                                    v-if="assessmentState.xpTotal !== null && !assessmentState.completed && assessmentState.locked"
                                    class="text-xs text-muted"
                                >
                                    Seu saldo: <strong>{{ assessmentState.xpTotal }} XP</strong>
                                </p>

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
                                    <div class="mini-game-board">
                                        <div class="mini-game-pool">
                                            <button
                                                v-for="item in miniGamePoolItems"
                                                :key="item.id"
                                                type="button"
                                                class="mini-game-pill"
                                                @pointerdown="startMiniGameDrag(item.id, $event)"
                                            >
                                                {{ item.label }}
                                            </button>
                                        </div>
                                        <div
                                            class="mini-game-slots"
                                            :style="{ '--mg-cols': miniGameColumnCount }"
                                        >
                                            <div
                                                v-for="(slot, index) in miniGameSlots"
                                                :key="`mini-slot-${index}`"
                                                class="mini-game-slot"
                                                :class="{ 'mini-game-slot-active': activeMiniGameDropSlot === index }"
                                                :data-mini-slot-index="index"
                                            >
                                                <div class="mini-game-slot-label">{{ index + 1 }}ª posição</div>
                                                <div v-if="slot" class="mini-game-slot-card">
                                                    {{ slot.label }}
                                                </div>
                                                <div v-else class="mini-game-slot-empty">
                                                    Solte aqui
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="assessmentState.orderingItems.length" class="text-xs text-muted">
                                        Itens posicionados: {{ assessmentState.orderingItems.length }}/{{ miniGameSlots.length }}
                                    </div>
                                    <div v-if="miniGameFeedback" class="text-xs" :class="miniGameFeedbackToneClass">
                                        {{ miniGameFeedback }}
                                    </div>
                                </div>

                                <div v-if="assessmentState.attemptId" class="flex w-full justify-end">
                                    <button
                                        class="sd-button sd-button-primary assessment-submit-btn"
                                        :disabled="assessmentState.loading"
                                        type="button"
                                        @click="submitAttempt"
                                    >
                                        {{ assessmentState.loading ? 'Enviando...' : 'Enviar avaliação' }}
                                    </button>
                                </div>

                                <div
                                    v-if="assessmentState.lastResult === 'passed'"
                                    class="assessment-result assessment-result--success assessment-result--pop"
                                    role="status"
                                >
                                    <span class="assessment-result-icon" aria-hidden="true">✓</span>
                                    <div>
                                        <p class="assessment-result-title">Missão concluída</p>
                                        <p class="assessment-result-text">{{ assessmentState.message }}</p>
                                    </div>
                                </div>
                                <div
                                    v-else-if="assessmentState.lastResult === 'failed'"
                                    class="assessment-result assessment-result--fail assessment-result--pop"
                                    role="status"
                                >
                                    <span class="assessment-result-icon" aria-hidden="true">!</span>
                                    <div>
                                        <p class="assessment-result-title">Resultado da tentativa</p>
                                        <p class="assessment-result-text">{{ assessmentState.message }}</p>
                                    </div>
                                </div>
                                <div v-else-if="assessmentState.message" class="sd-notice">
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

                            <section
                                v-if="showEpisodeMaterialSection"
                                class="sd-card p-4 md:p-5 flex flex-col gap-4 episode-material"
                                :class="{ 'mt-1': isAssessmentEpisode, 'mt-2': !isAssessmentEpisode }"
                            >
                                <h2 class="text-lg font-semibold episode-material-title">Conteúdo</h2>
                                <p v-if="episode.summary" class="text-muted leading-relaxed">
                                    {{ episode.summary }}
                                </p>

                                <audio
                                    v-if="episode.audio_url"
                                    class="w-full"
                                    controls
                                    :src="episode.audio_url"
                                />

                                <div class="flex flex-wrap gap-3">
                                    <button
                                        v-if="episode.pdf_url && enablePdfPreview && isDesktop"
                                        type="button"
                                        class="sd-button sd-button-primary episode-action-btn"
                                        @click="showPdfPreview = !showPdfPreview"
                                    >
                                        {{ showPdfPreview ? 'Ocultar pré-visualização' : 'Ver PDF aqui' }}
                                    </button>
                                    <a
                                        v-if="episode.pdf_url"
                                        class="sd-button sd-button-secondary episode-action-btn"
                                        :href="episode.pdf_url"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Abrir em nova aba
                                    </a>
                                    <a
                                        v-if="episode.pdf_url"
                                        class="sd-button sd-button-secondary episode-action-btn"
                                        :href="episode.pdf_url"
                                        :download="pdfDownloadName"
                                    >
                                        Baixar PDF
                                    </a>
                                    <button
                                        v-if="auth.isAuthenticated && episode.episode_type !== 'assessment'"
                                        class="sd-button sd-button-primary episode-action-btn episode-action-btn-primary"
                                        :disabled="completing"
                                        type="button"
                                        @click="markCompleted"
                                    >
                                        {{ completing ? 'Registrando...' : 'Marcar como concluído' }}
                                    </button>
                                </div>
                                <div v-if="completionMessage" class="sd-notice">
                                    {{ completionMessage }}
                                </div>
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
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
import { useAuthStore } from '../stores/auth';

const TROPHY_LABELS = {
    bronze: 'Bronze',
    silver: 'Prata',
    gold: 'Ouro',
    platinum: 'Platina'
};

function trophyTierLabel(tier) {
    const t = typeof tier === 'string' ? tier.toLowerCase() : '';
    return TROPHY_LABELS[t] || tier;
}

function trophyTierMeta(tier) {
    const t = typeof tier === 'string' ? tier.toLowerCase() : '';
    const label = trophyTierLabel(t);
    const short = t === 'platinum' ? 'P' : (t === 'gold' ? 'G' : (t === 'silver' ? 'S' : 'B'));
    const dotClass = t === 'platinum'
        ? 'trophy-pill-dot--platinum'
        : (t === 'gold'
            ? 'trophy-pill-dot--gold'
            : (t === 'silver' ? 'trophy-pill-dot--silver' : 'trophy-pill-dot--bronze'));
    return { label, short, dotClass };
}

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
    maxAttempts: 1,
    xpTotal: null,
    bestScore: null,
    loading: false,
    message: '',
    completed: false,
    locked: false,
    lastResult: null,
    showReviewModal: false,
    wrongAnswers: [],
    attemptHistory: [],
    quizAnswers: [],
    openTextAnswer: '',
    orderingItems: []
});
const miniGamePoolItems = ref([]);
const miniGameSlots = ref([]);
const draggingMiniGameItemId = ref(null);
const activeMiniGameDropSlot = ref(null);
const miniGameFeedback = ref('');
const miniGameFeedbackToneClass = computed(() => (
    miniGameFeedback.value.includes('ocupada')
        ? 'review-status-needs'
        : 'review-status-ok'
));

/** Evita repeat(auto-fit) refazer colunas quando a largura útil oscila no arraste. */
const miniGameColumnCount = computed(() => Math.max(1, miniGameSlots.value.length || 1));

const isAssessmentEpisode = computed(() => episode.value?.episode_type === 'assessment');

const showEpisodeMaterialSection = computed(() => {
    if (!episode.value) return false;
    const e = episode.value;
    if (String(e.summary || '').trim()) return true;
    if (e.audio_url) return true;
    if (e.pdf_url) return true;
    if (auth.isAuthenticated && e.episode_type !== 'assessment') return true;
    return false;
});

const showEpisodeCover = computed(() => {
    if (!episode.value) return false;
    if (isAssessmentEpisode.value) return Boolean(episode.value.cover_url);
    return true;
});

const episodeLayoutClasses = computed(() => (
    isAssessmentEpisode.value ? { 'episode-layout-challenge': true } : {}
));

const isAssessmentFocus = computed(() => {
    if (!auth.isAuthenticated) return false;
    if (!isAssessmentEpisode.value) return false;
    return Boolean(assessmentState.value.attemptId) || !assessmentState.value.completed;
});

const assessmentAnswerProgress = computed(() => {
    if (!episode.value || episode.value.episode_type !== 'assessment') return null;
    if (!assessmentState.value.attemptId) return null;
    const mode = episode.value.assessment_mode;
    if (mode === 'quiz') {
        const questions = episode.value.assessment_config?.questions || [];
        const total = questions.length;
        if (!total) return { pct: 0, label: '0/0' };
        const filled = assessmentState.value.quizAnswers.filter(
            (v) => v !== null && v !== undefined && Number.isFinite(Number(v))
        ).length;
        return {
            pct: Math.round((filled / total) * 100),
            label: `${filled}/${total} perguntas`
        };
    }
    if (mode === 'mini_game') {
        const total = miniGameSlots.value.length;
        if (!total) return { pct: 0, label: '0/0' };
        const filled = miniGameSlots.value.filter(Boolean).length;
        return {
            pct: Math.round((filled / total) * 100),
            label: `${filled}/${total} posições`
        };
    }
    const text = String(assessmentState.value.openTextAnswer || '');
    const cfg = episode.value.assessment_config || {};
    const minLen = Number(cfg.minLength) > 0 ? Number(cfg.minLength) : 80;
    const pct = Math.min(100, Math.round((text.length / minLen) * 100));
    return {
        pct,
        label: `${text.length} caracteres`
    };
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
            assessmentState.value.maxAttempts = Number(data.assessment_max_attempts_effective || data.max_attempts || 1);
            assessmentState.value.xpTotal = data.viewer_xp_total === undefined || data.viewer_xp_total === null
                ? assessmentState.value.xpTotal
                : Number(data.viewer_xp_total);
            assessmentState.value.attemptId = null;
            assessmentState.value.lastResult = null;
            assessmentState.value.completed = Boolean(data.assessment_passed);
            assessmentState.value.message = '';
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
            resetMiniGameBoard(assessmentState.value.orderingItems);
            if (data.assessment_passed) {
                assessmentState.value.lastResult = 'passed';
                assessmentState.value.message = assessmentState.value.bestScore !== null
                    ? `Você já concluiu esta missão. Melhor nota: ${Math.round(assessmentState.value.bestScore)}%.`
                    : 'Você já concluiu esta missão.';
            }
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
    assessmentState.value.lastResult = null;
    try {
        const { data } = await api.post(`/gamification/episodes/${episode.value.id}/attempts/start`);
        assessmentState.value.attemptId = data.attemptId;
        assessmentState.value.attemptsUsed = Number(data.attemptNumber) - 1;
        assessmentState.value.maxAttempts = Number(data.maxAttempts || assessmentState.value.maxAttempts || 1);
        // Sempre inicia uma tentativa "limpa" no frontend.
        const mode = episode.value?.assessment_mode;
        if (mode === 'quiz') {
            const questions = episode.value?.assessment_config?.questions || [];
            assessmentState.value.quizAnswers = new Array(questions.length).fill(null);
        } else if (mode === 'open_text') {
            assessmentState.value.openTextAnswer = '';
        } else if (mode === 'mini_game') {
            const srcItems = Array.isArray(episode.value?.assessment_config?.items)
                ? episode.value.assessment_config.items
                : [];
            const shuffled = [...srcItems]
                .map((item) => ({ ...item }))
                .sort(() => Math.random() - 0.5);
            assessmentState.value.orderingItems = shuffled;
            resetMiniGameBoard(shuffled);
        }
    } catch (e) {
        assessmentState.value.message = e?.response?.data?.message || 'Não foi possível iniciar a avaliação.';
    } finally {
        assessmentState.value.loading = false;
    }
}

async function resetAttempts() {
    if (!episode.value?.id) return;
    assessmentState.value.loading = true;
    assessmentState.value.message = '';
    try {
        const { data } = await api.post(`/gamification/episodes/${episode.value.id}/attempts/reset`);
        assessmentState.value.maxAttempts = Number(data.maxAttempts || assessmentState.value.maxAttempts || 1);
        assessmentState.value.locked = false;
        assessmentState.value.xpTotal = data.xpTotal === undefined || data.xpTotal === null
            ? assessmentState.value.xpTotal
            : Number(data.xpTotal);
        assessmentState.value.message = `Tentativas liberadas! -${Number(data.xpCost || 50)} XP.`;
    } catch (e) {
        assessmentState.value.message = e?.response?.data?.message || 'Não foi possível desbloquear novas tentativas.';
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
        return { orderedItemIds: miniGameSlots.value.map((item) => item?.id).filter(Boolean) };
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
    if (episode.value.assessment_mode === 'mini_game' && miniGameSlots.value.some((slot) => !slot)) {
        assessmentState.value.message = 'Preencha todas as posições antes de enviar a avaliação.';
        return;
    }
    assessmentState.value.loading = true;
    assessmentState.value.message = '';
    try {
        const payload = {
            attemptId: assessmentState.value.attemptId,
            answers: buildAssessmentAnswers()
        };
        const { data } = await api.post(`/gamification/episodes/${episode.value.id}/attempts/submit`, payload);
        assessmentState.value.attemptsUsed = Number(data.attemptsUsed || assessmentState.value.attemptsUsed + 1);
        assessmentState.value.maxAttempts = Number(data.maxAttempts || assessmentState.value.maxAttempts || 1);
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
            assessmentState.value.lastResult = 'passed';
            assessmentState.value.message = `Aprovado! Nota ${data.score}%. Recompensa: +${data.xpEarned} XP.`;
        } else {
            assessmentState.value.attemptId = null;
            assessmentState.value.lastResult = 'failed';
            assessmentState.value.message = `Nota ${data.score}%. Você ainda não atingiu a nota mínima de ${episode.value.passing_score}%.`;
        }
    } catch (e) {
        assessmentState.value.message = e?.response?.data?.message || 'Não foi possível enviar a avaliação.';
    } finally {
        assessmentState.value.loading = false;
    }
}

function resetMiniGameBoard(items) {
    miniGamePoolItems.value = [...(items || [])];
    miniGameSlots.value = Array(miniGamePoolItems.value.length).fill(null);
    draggingMiniGameItemId.value = null;
    activeMiniGameDropSlot.value = null;
    miniGameFeedback.value = '';
    assessmentState.value.orderingItems = [];
}

function startMiniGameDrag(itemId, event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    draggingMiniGameItemId.value = itemId;
    miniGameFeedback.value = '';
    window.addEventListener('pointermove', handleMiniGamePointerMove, { passive: false });
    window.addEventListener('pointerup', handleMiniGamePointerUp);
    window.addEventListener('pointercancel', handleMiniGamePointerUp);
}

function getMiniGameSlotIndexFromPoint(clientX, clientY) {
    const element = document.elementFromPoint(clientX, clientY);
    const slotElement = element?.closest?.('[data-mini-slot-index]');
    if (!slotElement) return null;
    const parsedIndex = Number(slotElement.getAttribute('data-mini-slot-index'));
    return Number.isNaN(parsedIndex) ? null : parsedIndex;
}

function handleMiniGamePointerMove(event) {
    if (!draggingMiniGameItemId.value) return;
    event.preventDefault();
    const slotIndex = getMiniGameSlotIndexFromPoint(event.clientX, event.clientY);
    activeMiniGameDropSlot.value = slotIndex;
}

function handleMiniGamePointerUp(event) {
    if (!draggingMiniGameItemId.value) return;
    const slotIndex = getMiniGameSlotIndexFromPoint(event.clientX, event.clientY);
    if (slotIndex === null) {
        draggingMiniGameItemId.value = null;
        activeMiniGameDropSlot.value = null;
        removeMiniGamePointerListeners();
        return;
    }
    dropMiniGameItem(slotIndex);
    removeMiniGamePointerListeners();
}

function dropMiniGameItem(index) {
    const itemId = draggingMiniGameItemId.value;
    if (!itemId) return;
    const targetItem = miniGamePoolItems.value.find((item) => String(item.id) === String(itemId));
    if (!targetItem) return;
    if (miniGameSlots.value[index]) {
        miniGameFeedback.value = 'Essa posição já está ocupada.';
        draggingMiniGameItemId.value = null;
        activeMiniGameDropSlot.value = null;
        return;
    }
    miniGameSlots.value[index] = targetItem;
    miniGamePoolItems.value = miniGamePoolItems.value.filter((item) => String(item.id) !== String(itemId));
    assessmentState.value.orderingItems = miniGameSlots.value.filter(Boolean);
    draggingMiniGameItemId.value = null;
    activeMiniGameDropSlot.value = null;
    miniGameFeedback.value = miniGamePoolItems.value.length === 0
        ? 'Todos os itens foram posicionados. Agora pode enviar.'
        : '';
}

function removeMiniGamePointerListeners() {
    window.removeEventListener('pointermove', handleMiniGamePointerMove);
    window.removeEventListener('pointerup', handleMiniGamePointerUp);
    window.removeEventListener('pointercancel', handleMiniGamePointerUp);
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
    removeMiniGamePointerListeners();
});
</script>

<style scoped>
.episode-layout {
    display: grid;
    gap: 1.5rem;
}

.episode-cover {
    width: 100%;
    height: 18rem;
    border-radius: 1rem;
    background: color-mix(in srgb, var(--surface-2) 40%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.episode-layout-challenge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
}

.episode-layout-challenge .episode-cover {
    width: 10.5rem;
    height: 6.5rem;
    max-width: 100%;
    flex-shrink: 0;
    border-radius: 0.75rem;
}

.episode-layout-challenge .episode-main {
    margin-top: 0;
    width: 100%;
    max-width: 100%;
    align-self: stretch;
    min-width: 0;
}

.episode-main-challenge {
    max-width: 64rem;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    min-width: 0;
}

.episode-challenge-hero {
    align-items: center;
    text-align: center;
}

.episode-card-shell {
    max-width: min(100%, 76rem);
    width: 100%;
    margin-left: auto;
    margin-right: auto;
}

.episode-nav {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 0.75rem;
    margin-bottom: 0.25rem;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
}

.episode-nav-back {
    padding: 0.45rem 0.85rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.episode-main-study {
    min-width: 0;
}

.episode-detail-meta-item:not(:last-child)::after {
    content: '•';
    margin-left: 0.75rem;
    color: color-mix(in srgb, var(--text-muted) 65%, transparent);
}

.episode-material {
    border-color: color-mix(in srgb, var(--border) 85%, transparent);
    background: color-mix(in srgb, var(--surface-2) 35%, transparent);
}

.episode-material-title {
    margin: 0;
    padding-bottom: 0.15rem;
    border-bottom: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
}

.episode-action-btn {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
}

.episode-action-btn-primary {
    font-weight: 700;
}

.trophy-pill-dot--platinum {
    background: linear-gradient(145deg, #e2e8f0, #38bdf8, #64748b);
}

.trophy-pill-dot--gold {
    background: linear-gradient(145deg, #fde68a, #f59e0b);
}

.trophy-pill-dot--silver {
    background: linear-gradient(145deg, #f1f5f9, #94a3b8);
}

.trophy-pill-dot--bronze {
    background: linear-gradient(145deg, #fdba74, #b45309);
}

.assessment-focus-card {
    border-color: color-mix(in srgb, var(--primary) 40%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 24%, transparent);
}

@media (min-width: 768px) {
    .episode-layout:not(.episode-layout-challenge) {
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        align-items: start;
        gap: 2rem;
    }

    .episode-layout:not(.episode-layout-challenge) .episode-cover {
        height: 32rem;
    }

    .episode-layout-challenge .episode-cover {
        width: 12rem;
        height: 7.25rem;
    }
}

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

.mini-game-board {
    border: 1px solid rgba(47, 61, 102, 0.8);
    border-radius: 12px;
    padding: 12px;
    background: rgba(17, 26, 47, 0.42);
    overflow-x: hidden;
    overscroll-behavior: contain;
    touch-action: pan-y;
    min-width: 0;
    width: 100%;
}

.mini-game-pool {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    touch-action: none;
}

.mini-game-pill {
    border: 1px solid rgba(59, 130, 246, 0.4);
    border-radius: 999px;
    padding: 8px 10px;
    background: rgba(15, 23, 42, 0.9);
    font-size: 0.8125rem;
    cursor: grab;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
}

.mini-game-pill:active {
    cursor: grabbing;
}

.mini-game-slots {
    margin-top: 10px;
    display: grid;
    gap: 8px;
    touch-action: none;
    min-width: 0;
    /* Desktop: número fixo de colunas (igual à quantidade de slots) — não depende de auto-fit. */
    grid-template-columns: repeat(var(--mg-cols, 6), minmax(0, 1fr));
}

@media (max-width: 1023px) {
    .mini-game-slots {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 639px) {
    .mini-game-slots {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.mini-game-slot {
    min-height: 76px;
    border: 1px dashed rgba(71, 85, 105, 0.9);
    border-radius: 10px;
    padding: 8px;
    background: rgba(15, 23, 42, 0.75);
}

.mini-game-slot-active {
    border-color: rgba(59, 130, 246, 0.95);
    background: rgba(30, 58, 138, 0.35);
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.mini-game-slot-label {
    font-size: 0.75rem;
    color: #93c5fd;
}

.mini-game-slot-empty {
    margin-top: 4px;
    font-size: 0.75rem;
    color: #94a3b8;
}

.mini-game-slot-card {
    margin-top: 4px;
    font-size: 0.8125rem;
}

.assessment-badge-live {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--primary) 88%, white);
    border: 1px solid color-mix(in srgb, var(--primary) 45%, transparent);
    background: color-mix(in srgb, var(--primary) 14%, transparent);
    border-radius: 999px;
    padding: 0.25rem 0.6rem;
}

.assessment-progress-block {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.assessment-progress-track {
    height: 0.45rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface-2) 75%, transparent);
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
}

.assessment-progress-fill {
    height: 100%;
    border-radius: inherit;
    transition: width 0.35s ease;
}

.assessment-progress-fill--primary {
    background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--primary) 82%, #1d4ed8),
        color-mix(in srgb, var(--primary) 55%, #38bdf8)
    );
}

.assessment-cta {
    border-radius: 14px;
    padding: 1.1rem 1.15rem;
    border: 1px solid color-mix(in srgb, var(--primary) 38%, transparent);
    background: linear-gradient(
        165deg,
        color-mix(in srgb, var(--primary) 12%, transparent),
        color-mix(in srgb, var(--surface-2) 45%, transparent)
    );
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.assessment-cta-kicker {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--primary) 80%, white);
    margin: 0;
}

.assessment-cta-lead {
    font-size: 0.9rem;
    line-height: 1.45;
    margin: 0;
    color: color-mix(in srgb, var(--text) 92%, var(--text-muted));
}

.assessment-cta-btn {
    align-self: flex-start;
    padding: 0.65rem 1.35rem;
    font-size: 1rem;
    font-weight: 700;
}

.assessment-submit-btn {
    font-weight: 700;
    padding: 0.65rem 1.5rem;
}

.assessment-result {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
    border-radius: 12px;
    padding: 0.9rem 1rem;
    border: 1px solid transparent;
}

.assessment-result--success {
    border-color: color-mix(in srgb, #22c55e 45%, transparent);
    background: color-mix(in srgb, #22c55e 12%, var(--surface));
}

.assessment-result--fail {
    border-color: color-mix(in srgb, #f97316 45%, transparent);
    background: color-mix(in srgb, #f97316 10%, var(--surface));
}

.assessment-result-icon {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1rem;
}

.assessment-result--success .assessment-result-icon {
    background: color-mix(in srgb, #22c55e 28%, transparent);
    color: #bbf7d0;
}

.assessment-result--fail .assessment-result-icon {
    background: color-mix(in srgb, #f97316 25%, transparent);
    color: #ffedd5;
}

.assessment-result-title {
    font-weight: 800;
    margin: 0 0 0.2rem;
    font-size: 0.95rem;
}

.assessment-result-text {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.45;
    opacity: 0.95;
}

.assessment-result--pop {
    animation: assessment-result-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes assessment-result-pop {
    0% {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
