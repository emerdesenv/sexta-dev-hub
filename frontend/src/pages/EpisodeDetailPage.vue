<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer>
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
                        <div v-if="showEpisodeCover && isAssessmentEpisode" class="episode-cover-strip">
                            <button
                                type="button"
                                class="episode-cover"
                                @click="openEpisodeCoverPreview"
                            >
                                <img
                                    v-if="episode.cover_url"
                                    :src="episode.cover_url"
                                    :alt="episode.title"
                                    class="episode-cover-image"
                                />
                                <span v-else class="text-sm text-muted">Sem capa</span>
                            </button>

                            <aside class="episode-side-panel">
                                <p class="episode-side-kicker">Resumo rápido</p>
                                <ul class="episode-side-list">
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M10 2a8 8 0 1 0 8 8 1 1 0 0 0-2 0 6 6 0 1 1-6-6 1 1 0 1 0 0-2Z" />
                                            <path fill="currentColor" d="M13.586 1.586a1 1 0 0 0 0 1.414L14.586 4 11 7.586 9.707 6.293a1 1 0 0 0-1.414 0l-2 2a1 1 0 1 0 1.414 1.414L9 8.414l1.293 1.293a1 1 0 0 0 1.414 0l4.293-4.293L17 6.414a1 1 0 1 0 1.414-1.414l-4-4a1 1 0 0 0-1.414 0Z" />
                                        </svg>
                                        <span>Nota mínima: {{ episode?.passing_score ?? 70 }}%</span>
                                    </li>
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M3 10a7 7 0 0 1 11.95-4.95l.34-.34a1 1 0 1 1 1.42 1.41l-2 2a1 1 0 0 1-1.42 0l-2-2a1 1 0 0 1 1.42-1.41l.57.57A5 5 0 1 0 15 10a1 1 0 1 1 2 0A7 7 0 1 1 3 10Z" />
                                        </svg>
                                        <span>Tentativas restantes: {{ attemptsRemaining }}</span>
                                    </li>
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M11.5 1a1 1 0 0 0-.91.59l-4 9A1 1 0 0 0 7.5 12H10v6a1 1 0 0 0 1.8.6l6-8A1 1 0 0 0 17 9h-2.38l1.83-6.4A1 1 0 0 0 15.5 1h-4Z" />
                                        </svg>
                                        <span>Recompensa: +{{ episode?.xp_reward || 40 }} XP</span>
                                    </li>
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M6 2a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v1a5 5 0 0 0 4 4.9A4.98 4.98 0 0 0 9 12.9V15H7a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.1A4.98 4.98 0 0 0 14 10.9 5 5 0 0 0 18 6V5a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1H6Zm-2 4V6h1v2.75A3.01 3.01 0 0 1 4 6Zm12 0a3.01 3.01 0 0 1-1 2.75V6h1Z" />
                                        </svg>
                                        <span>Troféu: {{ trophyTierMeta(episode?.trophy_tier).label }}</span>
                                    </li>
                                </ul>
                            </aside>

                            <aside class="episode-side-panel episode-side-panel-objective">
                                <p class="episode-side-kicker">Objetivo da missão</p>
                                <p class="episode-side-copy">{{ missionObjectiveText }}</p>
                            </aside>
                        </div>

                        <div v-else-if="showEpisodeCover" class="episode-cover-strip episode-cover-strip-study">
                            <button
                                type="button"
                                class="episode-cover"
                                @click="openEpisodeCoverPreview"
                            >
                                <img
                                    v-if="episode.cover_url"
                                    :src="episode.cover_url"
                                    :alt="episode.title"
                                    class="episode-cover-image"
                                />
                                <span v-else class="text-sm text-muted">Sem capa</span>
                            </button>

                            <aside class="episode-side-panel">
                                <p class="episode-side-kicker">Resumo rápido</p>
                                <ul class="episode-side-list">
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M10 2a8 8 0 1 0 8 8 1 1 0 0 0-2 0 6 6 0 1 1-6-6 1 1 0 1 0 0-2Z" />
                                            <path fill="currentColor" d="M13.586 1.586a1 1 0 0 0 0 1.414L14.586 4 11 7.586 9.707 6.293a1 1 0 0 0-1.414 0l-2 2a1 1 0 1 0 1.414 1.414L9 8.414l1.293 1.293a1 1 0 0 0 1.414 0l4.293-4.293L17 6.414a1 1 0 1 0 1.414-1.414l-4-4a1 1 0 0 0-1.414 0Z" />
                                        </svg>
                                        <span>Duração: {{ episode?.duration_label || 'Não informada' }}</span>
                                    </li>
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M11.5 1a1 1 0 0 0-.91.59l-4 9A1 1 0 0 0 7.5 12H10v6a1 1 0 0 0 1.8.6l6-8A1 1 0 0 0 17 9h-2.38l1.83-6.4A1 1 0 0 0 15.5 1h-4Z" />
                                        </svg>
                                        <span>Recompensa: +{{ episode?.xp_reward || 40 }} XP</span>
                                    </li>
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M6 2a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v1a5 5 0 0 0 4 4.9A4.98 4.98 0 0 0 9 12.9V15H7a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.1A4.98 4.98 0 0 0 14 10.9 5 5 0 0 0 18 6V5a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1H6Zm-2 4V6h1v2.75A3.01 3.01 0 0 1 4 6Zm12 0a3.01 3.01 0 0 1-1 2.75V6h1Z" />
                                        </svg>
                                        <span>Troféu: {{ trophyTierMeta(episode?.trophy_tier).label }}</span>
                                    </li>
                                    <li>
                                        <svg aria-hidden="true" viewBox="0 0 20 20" class="episode-side-icon">
                                            <path fill="currentColor" d="M10 2a1 1 0 0 1 1 1v1.05a6 6 0 0 1 0 11.9V17a1 1 0 1 1-2 0v-1.05A6 6 0 0 1 9 4.05V3a1 1 0 0 1 1-1Zm-1 4.13v7.74a4 4 0 0 1 0-7.74Zm2 0v7.74a4 4 0 0 0 0-7.74Z" />
                                        </svg>
                                        <span>Áudio: {{ episode?.audio_url ? 'Disponível' : 'Não disponível' }}</span>
                                    </li>
                                </ul>
                            </aside>

                            <aside class="episode-side-panel episode-side-panel-objective">
                                <p class="episode-side-kicker">Objetivo do estudo</p>
                                <p class="episode-side-copy">{{ studyObjectiveText }}</p>
                            </aside>
                        </div>

                        <button
                            v-else-if="showEpisodeCover"
                            type="button"
                            class="episode-cover"
                            @click="openEpisodeCoverPreview"
                        >
                            <img
                                v-if="episode.cover_url"
                                :src="episode.cover_url"
                                :alt="episode.title"
                                class="episode-cover-image"
                            />
                            <span v-else class="text-sm text-muted">Sem capa</span>
                        </button>

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
                                :class="{
                                    'episode-challenge-hero': isAssessmentEpisode,
                                    'episode-study-hero': !isAssessmentEpisode
                                }"
                            >
                                <div class="flex flex-wrap gap-2 justify-center">
                                    <Badge
                                        v-for="tag in episodeTagList"
                                        :key="`episode-tag-${tag}`"
                                        tone="neutral"
                                    >
                                        #{{ tag }}
                                    </Badge>
                                    <Badge v-if="!episodeTagList.length" tone="neutral">
                                        Sem tags
                                    </Badge>
                                </div>

                                <h1
                                    class="text-3xl sm:text-4xl font-extrabold leading-tight text-center"
                                >
                                    {{ episode.title }}
                                </h1>
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
                                <p v-if="assessmentState.attemptId" class="assessment-attempt-warning">
                                    Evite atualizar ou sair desta página agora para não perder a tentativa em andamento.
                                </p>

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
                                                {{ entry.passed ? 'Aprovado' : 'Ainda não' }}
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
                                    <p v-if="assessmentPromptHtml" class="text-sm assessment-prompt-markdown" v-html="assessmentPromptHtml" />
                                    <p v-else class="text-sm">Escreva sua resposta:</p>
                                    <textarea class="sd-input" rows="5" v-model="assessmentState.openTextAnswer" />
                                </div>

                                <div v-else-if="assessmentState.attemptId && episode.assessment_mode === 'semver'" class="flex flex-col gap-3">
                                    <p v-if="assessmentPromptHtml" class="text-sm assessment-prompt-markdown" v-html="assessmentPromptHtml" />
                                    <p v-else class="text-sm">Preencha a versão correta (MAJOR.MINOR.PATCH)</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label class="flex flex-col gap-2">
                                            <span class="sd-label">MAJOR</span>
                                            <input class="sd-input assessment-answer-input" type="number" min="0" step="1" placeholder="Ex.: 2" v-model="assessmentState.semverAnswer.major" />
                                        </label>
                                        <label class="flex flex-col gap-2">
                                            <span class="sd-label">MINOR</span>
                                            <input class="sd-input assessment-answer-input" type="number" min="0" step="1" placeholder="Ex.: 4" v-model="assessmentState.semverAnswer.minor" />
                                        </label>
                                        <label class="flex flex-col gap-2">
                                            <span class="sd-label">PATCH</span>
                                            <input class="sd-input assessment-answer-input" type="number" min="0" step="1" placeholder="Ex.: 0" v-model="assessmentState.semverAnswer.patch" />
                                        </label>
                                    </div>
                                </div>

                                <div v-else-if="assessmentState.attemptId && episode.assessment_mode === 'classification'" class="flex flex-col gap-3">
                                    <p v-if="assessmentPromptHtml" class="text-sm assessment-prompt-markdown" v-html="assessmentPromptHtml" />
                                    <p v-else class="text-sm">Classifique os itens nos grupos corretos</p>
                                    <div v-for="(placement, index) in assessmentState.classificationPlacements" :key="`classification-${placement.itemId}`" class="sd-card p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div class="text-sm font-medium">
                                            {{ index + 1 }}. {{ (episode.assessment_config?.items || [])[index]?.label || placement.itemId }}
                                        </div>
                                        <label class="flex flex-col gap-2">
                                            <span class="sd-label">Grupo</span>
                                            <select class="sd-input assessment-answer-select" v-model="placement.groupId">
                                                <option value="" disabled>Selecione</option>
                                                <option v-for="group in (episode.assessment_config?.groups || [])" :key="`group-${group.id}`" :value="group.id">
                                                    {{ group.label || group.id }}
                                                </option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div v-else-if="assessmentState.attemptId && episode.assessment_mode === 'fill_blanks'" class="flex flex-col gap-3">
                                    <p v-if="assessmentPromptHtml" class="text-sm assessment-prompt-markdown" v-html="assessmentPromptHtml" />
                                    <p v-else class="text-sm">Preencha as lacunas abaixo</p>
                                    <label v-for="(blank, index) in assessmentState.fillBlankAnswers" :key="`fill-${blank.blankId}`" class="flex flex-col gap-2">
                                        <span class="sd-label">Lacuna {{ index + 1 }} ({{ blank.blankId }})</span>
                                        <input class="sd-input assessment-answer-input" v-model="blank.value" />
                                    </label>
                                </div>

                                <div v-else-if="assessmentState.attemptId && episode.assessment_mode === 'matching'" class="flex flex-col gap-3">
                                    <p v-if="assessmentPromptHtml" class="text-sm assessment-prompt-markdown" v-html="assessmentPromptHtml" />
                                    <p v-else class="text-sm">Relacione cada item da esquerda com a opção correta</p>
                                    <div v-for="(pair, index) in assessmentState.matchingPairs" :key="`match-${pair.leftId}`" class="sd-card p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div class="text-sm font-medium">
                                            {{ (episode.assessment_config?.leftItems || []).find((item) => String(item.id) === String(pair.leftId))?.label || pair.leftId }}
                                        </div>
                                        <label class="flex flex-col gap-2">
                                            <span class="sd-label">Correspondência</span>
                                            <select class="sd-input assessment-answer-select" v-model="pair.rightId">
                                                <option value="" disabled>Selecione</option>
                                                <option v-for="right in (episode.assessment_config?.rightItems || [])" :key="`right-opt-${right.id}`" :value="right.id">
                                                    {{ right.label || right.id }}
                                                </option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <div v-else-if="assessmentState.attemptId" class="flex flex-col gap-3">
                                    <p v-if="assessmentPromptHtml" class="text-sm assessment-prompt-markdown" v-html="assessmentPromptHtml" />
                                    <p v-else class="text-sm">Ordene os itens na sequência correta</p>
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
                                                    <span>{{ slot.label }}</span>
                                                    <button
                                                        type="button"
                                                        class="mini-game-slot-remove"
                                                        @click="removeMiniGameSlotItem(index)"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                                <div v-else class="mini-game-slot-empty">
                                                    Solte aqui
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex">
                                        <button
                                            type="button"
                                            class="sd-button sd-button-secondary text-sm"
                                            @click="resetMiniGameBoard(assessmentState.orderingItems)"
                                        >
                                            Limpar posições
                                        </button>
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

                                <button
                                    v-if="episode.image_url"
                                    type="button"
                                    class="episode-tip-pulse"
                                    @click="openSupportImagePreview"
                                >
                                    <span class="episode-tip-pulse-dot" aria-hidden="true">i</span>
                                    <span class="episode-tip-pulse-copy">
                                        <strong>Olhe aqui:</strong> uma dica para você.
                                    </span>
                                    <span class="episode-tip-pulse-action">Clique para ampliar</span>
                                </button>

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
                v-if="supportImagePreviewOpen && episode?.image_url"
                class="episode-gate-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Visualização da imagem complementar"
                @click.self="closeSupportImagePreview"
            >
                <div class="episode-image-preview-modal" @click.stop>
                    <button
                        type="button"
                        class="sd-button sd-button-secondary px-3 py-2 text-sm self-end"
                        @click="closeSupportImagePreview"
                    >
                        Fechar
                    </button>
                    <img
                        :src="episode.image_url"
                        alt="Imagem complementar da atividade ampliada"
                        class="episode-image-preview-full"
                    />
                </div>
            </div>

            <div
                v-if="coverPreviewOpen && episode?.cover_url"
                class="episode-gate-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Visualização da capa do episódio"
                @click.self="closeEpisodeCoverPreview"
            >
                <div class="episode-image-preview-modal" @click.stop>
                    <button
                        type="button"
                        class="sd-button sd-button-secondary px-3 py-2 text-sm self-end"
                        @click="closeEpisodeCoverPreview"
                    >
                        Fechar
                    </button>
                    <img
                        :src="episode.cover_url"
                        alt="Capa do episódio ampliada"
                        class="episode-image-preview-full"
                    />
                </div>
            </div>

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
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import api from '../services/api';
import PageContainer from '../components/layout/PageContainer.vue';
import Badge from '../components/ui/Badge.vue';
import Footer from '../components/layout/Footer.vue';
import { useRewardToast } from '../composables/useRewardToast';
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
const supportImagePreviewOpen = ref(false);
const coverPreviewOpen = ref(false);
const pdfDownloadName = ref('episodio.pdf');
const isDesktop = ref(false);
const { showRewardToast } = useRewardToast();
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
    orderingItems: [],
    semverAnswer: { major: '', minor: '', patch: '' },
    classificationPlacements: [],
    fillBlankAnswers: [],
    matchingPairs: []
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
const hasActiveAssessmentAttempt = computed(() => Boolean(assessmentState.value.attemptId));

/** Evita repeat(auto-fit) refazer colunas quando a largura útil oscila no arraste. */
const miniGameColumnCount = computed(() => Math.max(1, miniGameSlots.value.length || 1));

const isAssessmentEpisode = computed(() => episode.value?.episode_type === 'assessment');

const showEpisodeMaterialSection = computed(() => {
    if (!episode.value) return false;
    const e = episode.value;
    if (String(e.summary || '').trim()) return true;
    if (e.image_url) return true;
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
    isAssessmentEpisode.value
        ? { 'episode-layout-challenge': true }
        : { 'episode-layout-study': true }
));

const isAssessmentFocus = computed(() => {
    if (!auth.isAuthenticated) return false;
    if (!isAssessmentEpisode.value) return false;
    return Boolean(assessmentState.value.attemptId) || !assessmentState.value.completed;
});

const attemptsRemaining = computed(() => Math.max(
    0,
    Number(assessmentState.value.maxAttempts || 1) - Number(assessmentState.value.attemptsUsed || 0)
));

const missionObjectiveText = computed(() => {
    if (!isAssessmentEpisode.value) return 'Concluir a atividade com atenção aos critérios de avaliação.';
    const mode = String(episode.value?.assessment_mode || '');
    if (mode === 'quiz') return 'Responder corretamente as perguntas e alcançar a nota mínima.';
    if (mode === 'mini_game') return 'Organizar os itens na sequência correta e enviar a tentativa.';
    if (mode === 'open_text') return 'Escrever uma resposta clara, objetiva e alinhada ao enunciado.';
    if (mode === 'semver') return 'Preencher MAJOR, MINOR e PATCH conforme o cenário proposto.';
    if (mode === 'classification') return 'Classificar todos os itens nos grupos corretos.';
    if (mode === 'fill_blanks') return 'Completar todas as lacunas com os termos adequados.';
    if (mode === 'matching') return 'Relacionar cada item da esquerda com a opção correta.';
    return 'Concluir a atividade com atenção aos critérios de avaliação.';
});

const studyObjectiveText = computed(() => {
    if (!episode.value) return 'Estudar o conteúdo principal deste episódio e registrar sua conclusão.';
    const category = String(episode.value.category || '').trim();
    if (category) {
        return `Estudar os conceitos de ${category} e consolidar o aprendizado com os materiais deste episódio.`;
    }
    return 'Estudar o conteúdo principal deste episódio e consolidar o aprendizado com os materiais disponíveis.';
});

const episodeTagList = computed(() => {
    const raw = episode.value?.tags;
    const tags = Array.isArray(raw)
        ? raw
        : String(raw || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    return tags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
        .slice(0, 6);
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
    if (mode === 'semver') {
        const values = assessmentState.value.semverAnswer || {};
        const filled = ['major', 'minor', 'patch'].filter((part) => {
            const raw = values?.[part];
            return raw !== '' && raw !== null && raw !== undefined;
        }).length;
        return {
            pct: Math.round((filled / 3) * 100),
            label: `${filled}/3 componentes`
        };
    }
    if (mode === 'classification') {
        const total = Array.isArray(assessmentState.value.classificationPlacements)
            ? assessmentState.value.classificationPlacements.length
            : 0;
        if (!total) return { pct: 0, label: '0/0' };
        const filled = assessmentState.value.classificationPlacements.filter((item) => String(item.groupId || '').trim()).length;
        return { pct: Math.round((filled / total) * 100), label: `${filled}/${total} itens` };
    }
    if (mode === 'fill_blanks') {
        const total = Array.isArray(assessmentState.value.fillBlankAnswers) ? assessmentState.value.fillBlankAnswers.length : 0;
        if (!total) return { pct: 0, label: '0/0' };
        const filled = assessmentState.value.fillBlankAnswers.filter((item) => String(item.value || '').trim()).length;
        return { pct: Math.round((filled / total) * 100), label: `${filled}/${total} lacunas` };
    }
    if (mode === 'matching') {
        const total = Array.isArray(assessmentState.value.matchingPairs) ? assessmentState.value.matchingPairs.length : 0;
        if (!total) return { pct: 0, label: '0/0' };
        const filled = assessmentState.value.matchingPairs.filter((item) => String(item.rightId || '').trim()).length;
        return { pct: Math.round((filled / total) * 100), label: `${filled}/${total} pares` };
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

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatInlineMarkdown(value) {
    let output = escapeHtml(value);
    output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/\*(.+?)\*/g, '<em>$1</em>');
    output = output.replace(/`(.+?)`/g, '<code>$1</code>');
    return output;
}

function renderPromptMarkdown(value) {
    const source = String(value || '').trim();
    if (!source) return '';
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const chunks = [];
    let paragraphBuffer = [];
    let listType = null;
    let listBuffer = [];

    const flushParagraph = () => {
        if (!paragraphBuffer.length) return;
        const html = paragraphBuffer.map((line) => formatInlineMarkdown(line)).join('<br />');
        chunks.push(`<p>${html}</p>`);
        paragraphBuffer = [];
    };

    const flushList = () => {
        if (!listType || !listBuffer.length) return;
        const tag = listType === 'ol' ? 'ol' : 'ul';
        const items = listBuffer.map((line) => `<li>${formatInlineMarkdown(line)}</li>`).join('');
        chunks.push(`<${tag}>${items}</${tag}>`);
        listType = null;
        listBuffer = [];
    };

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();
            const level = Math.min(3, headingMatch[1].length);
            chunks.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
            continue;
        }

        const unorderedMatch = trimmed.match(/^-\s+(.+)$/);
        if (unorderedMatch) {
            flushParagraph();
            if (listType !== 'ul') {
                flushList();
                listType = 'ul';
            }
            listBuffer.push(unorderedMatch[1]);
            continue;
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (orderedMatch) {
            flushParagraph();
            if (listType !== 'ol') {
                flushList();
                listType = 'ol';
            }
            listBuffer.push(orderedMatch[1]);
            continue;
        }

        flushList();
        paragraphBuffer.push(trimmed);
    }

    flushParagraph();
    flushList();
    return chunks.join('');
}

const assessmentPromptHtml = computed(() => renderPromptMarkdown(episode.value?.assessment_config?.prompt || ''));

function syncDesktopState() {
    if (!desktopMediaQuery) return;
    isDesktop.value = desktopMediaQuery.matches;
    if (!isDesktop.value) showPdfPreview.value = false;
}

function openSupportImagePreview() {
    supportImagePreviewOpen.value = true;
}

function closeSupportImagePreview() {
    supportImagePreviewOpen.value = false;
}

function openEpisodeCoverPreview() {
    if (!episode.value?.cover_url) return;
    coverPreviewOpen.value = true;
}

function closeEpisodeCoverPreview() {
    coverPreviewOpen.value = false;
}

function handleAttemptBeforeUnload(event) {
    if (!hasActiveAssessmentAttempt.value) return;
    event.preventDefault();
    event.returnValue = '';
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
            assessmentState.value.semverAnswer = { major: '', minor: '', patch: '' };
            assessmentState.value.classificationPlacements = [];
            assessmentState.value.fillBlankAnswers = [];
            assessmentState.value.matchingPairs = [];
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
            announceEpisodeCompletionReward();
        }
    } catch (e) {
        completionMessage.value = e?.response?.data?.message || 'Não foi possível registrar a conclusão.';
    } finally {
        completing.value = false;
    }
}

function announceEpisodeCompletionReward() {
    if (episode.value?.trophy_tier) {
        showCompletionToast({
            kind: 'trophy',
            title: 'Nova conquista',
            icon: '🏆',
            message: `Você desbloqueou o troféu ${trophyTierLabel(episode.value.trophy_tier)} deste episódio.`
        });
        return;
    }
    showCompletionToast({
        kind: 'study',
        title: 'Atividade concluída',
        icon: '✅',
        message: 'Progresso registrado com sucesso. Continue avançando para manter sua evolução.'
    });
}

function showCompletionToast(payload) {
    showRewardToast(payload, 8000);
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
        } else if (mode === 'semver') {
            assessmentState.value.semverAnswer = { major: '', minor: '', patch: '' };
        } else if (mode === 'classification') {
            const items = Array.isArray(episode.value?.assessment_config?.items) ? episode.value.assessment_config.items : [];
            assessmentState.value.classificationPlacements = items.map((item, index) => ({
                itemId: String(item?.id || `c_${index + 1}`),
                groupId: ''
            }));
        } else if (mode === 'fill_blanks') {
            const blanks = Array.isArray(episode.value?.assessment_config?.blanks) ? episode.value.assessment_config.blanks : [];
            assessmentState.value.fillBlankAnswers = blanks.map((blank, index) => ({
                blankId: String(blank?.id || `b${index + 1}`),
                value: ''
            }));
        } else if (mode === 'matching') {
            const pairs = Array.isArray(episode.value?.assessment_config?.pairs) ? episode.value.assessment_config.pairs : [];
            const leftItems = Array.isArray(episode.value?.assessment_config?.leftItems) ? episode.value.assessment_config.leftItems : [];
            const source = pairs.length ? pairs : leftItems.map((item) => ({ leftId: item?.id }));
            assessmentState.value.matchingPairs = source.map((pair, index) => ({
                leftId: String(pair?.leftId || `l${index + 1}`),
                rightId: ''
            }));
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
    if (episode.value.assessment_mode === 'semver') {
        return {
            major: Number(assessmentState.value.semverAnswer?.major),
            minor: Number(assessmentState.value.semverAnswer?.minor),
            patch: Number(assessmentState.value.semverAnswer?.patch)
        };
    }
    if (episode.value.assessment_mode === 'classification') {
        return { placements: assessmentState.value.classificationPlacements || [] };
    }
    if (episode.value.assessment_mode === 'fill_blanks') {
        return { blanks: assessmentState.value.fillBlankAnswers || [] };
    }
    if (episode.value.assessment_mode === 'matching') {
        return { pairs: assessmentState.value.matchingPairs || [] };
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

    if (episode.value?.assessment_mode === 'semver') {
        const labels = { major: 'MAJOR', minor: 'MINOR', patch: 'PATCH' };
        return (Array.isArray(feedback) ? feedback : []).map((item) => ({
            questionId: `semver_${item.part || 'part'}`,
            prompt: `Componente ${labels[item.part] || String(item.part || '').toUpperCase()}`,
            submittedLabel: Number.isInteger(Number(item.submitted)) && Number(item.submitted) >= 0
                ? String(Number(item.submitted))
                : 'Não informado',
            expectedLabel: Number.isInteger(Number(item.expected)) && Number(item.expected) >= 0
                ? String(Number(item.expected))
                : 'Não definido',
            status: Boolean(item.correct) ? 'ok' : 'needs_attention'
        }));
    }

    if (episode.value?.assessment_mode === 'classification') {
        const groups = Array.isArray(episode.value?.assessment_config?.groups) ? episode.value.assessment_config.groups : [];
        const groupLabelById = new Map(groups.map((group) => [String(group.id), String(group.label || group.id)]));
        const items = Array.isArray(episode.value?.assessment_config?.items) ? episode.value.assessment_config.items : [];
        return (Array.isArray(feedback) ? feedback : []).map((item, index) => ({
            questionId: String(item.itemId || `classification_${index + 1}`),
            prompt: `Item: ${items[index]?.label || `Item ${index + 1}`}`,
            submittedLabel: item.submittedGroupId ? (groupLabelById.get(String(item.submittedGroupId)) || String(item.submittedGroupId)) : 'Não classificado',
            expectedLabel: item.expectedGroupId ? (groupLabelById.get(String(item.expectedGroupId)) || String(item.expectedGroupId)) : 'Sem gabarito',
            status: Boolean(item.correct) ? 'ok' : 'needs_attention'
        }));
    }

    if (episode.value?.assessment_mode === 'fill_blanks') {
        return (Array.isArray(feedback) ? feedback : []).map((item, index) => ({
            questionId: String(item.blankId || `blank_${index + 1}`),
            prompt: `Lacuna ${index + 1}`,
            submittedLabel: item.submitted ? String(item.submitted) : 'Não preenchida',
            expectedLabel: Array.isArray(item.accepted) && item.accepted.length ? item.accepted.join(' | ') : 'Sem gabarito',
            status: Boolean(item.correct) ? 'ok' : 'needs_attention'
        }));
    }

    if (episode.value?.assessment_mode === 'matching') {
        const leftItems = Array.isArray(episode.value?.assessment_config?.leftItems) ? episode.value.assessment_config.leftItems : [];
        const rightItems = Array.isArray(episode.value?.assessment_config?.rightItems) ? episode.value.assessment_config.rightItems : [];
        const leftLabelById = new Map(leftItems.map((item) => [String(item.id), String(item.label || item.id)]));
        const rightLabelById = new Map(rightItems.map((item) => [String(item.id), String(item.label || item.id)]));
        return (Array.isArray(feedback) ? feedback : []).map((item, index) => ({
            questionId: `pair_${String(item.leftId || index)}`,
            prompt: `Correspondência: ${leftLabelById.get(String(item.leftId || '')) || `Par ${index + 1}`}`,
            submittedLabel: item.submittedRightId ? (rightLabelById.get(String(item.submittedRightId)) || String(item.submittedRightId)) : 'Não relacionado',
            expectedLabel: item.expectedRightId ? (rightLabelById.get(String(item.expectedRightId)) || String(item.expectedRightId)) : 'Sem gabarito',
            status: Boolean(item.correct) ? 'ok' : 'needs_attention'
        }));
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
    if (episode.value.assessment_mode === 'semver') {
        const semver = assessmentState.value.semverAnswer || {};
        const hasInvalid = ['major', 'minor', 'patch'].some((part) => {
            const raw = semver?.[part];
            const value = Number(raw);
            return raw === '' || raw === null || raw === undefined || !Number.isInteger(value) || value < 0;
        });
        if (hasInvalid) {
            assessmentState.value.message = 'Informe MAJOR, MINOR e PATCH com números inteiros maiores ou iguais a 0.';
            return;
        }
    }
    if (episode.value.assessment_mode === 'classification') {
        const hasMissing = (assessmentState.value.classificationPlacements || []).some((item) => !String(item.groupId || '').trim());
        if (hasMissing) {
            assessmentState.value.message = 'Classifique todos os itens em um grupo antes de enviar.';
            return;
        }
    }
    if (episode.value.assessment_mode === 'fill_blanks') {
        const hasMissing = (assessmentState.value.fillBlankAnswers || []).some((item) => !String(item.value || '').trim());
        if (hasMissing) {
            assessmentState.value.message = 'Preencha todas as lacunas antes de enviar.';
            return;
        }
    }
    if (episode.value.assessment_mode === 'matching') {
        const hasMissing = (assessmentState.value.matchingPairs || []).some((item) => !String(item.rightId || '').trim());
        if (hasMissing) {
            assessmentState.value.message = 'Complete todas as correspondências antes de enviar.';
            return;
        }
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
            announceEpisodeCompletionReward();
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

function removeMiniGameSlotItem(index) {
    const item = miniGameSlots.value[index];
    if (!item) return;
    miniGameSlots.value[index] = null;
    miniGamePoolItems.value = [...miniGamePoolItems.value, item];
    assessmentState.value.orderingItems = miniGameSlots.value.filter(Boolean);
    miniGameFeedback.value = 'Item removido da posição. Você pode reposicionar.';
}

function removeMiniGamePointerListeners() {
    window.removeEventListener('pointermove', handleMiniGamePointerMove);
    window.removeEventListener('pointerup', handleMiniGamePointerUp);
    window.removeEventListener('pointercancel', handleMiniGamePointerUp);
}
onMounted(loadEpisode);
onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', handleAttemptBeforeUnload);
    }
    if (typeof window === 'undefined' || !window.matchMedia) return;
    desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    syncDesktopState();
    desktopMediaQuery.addEventListener('change', syncDesktopState);
});

onBeforeRouteLeave(() => {
    if (!hasActiveAssessmentAttempt.value) return true;
    return window.confirm('Você tem uma tentativa em andamento. Se sair agora, ela pode ser perdida. Deseja realmente sair?');
});

onBeforeUnmount(() => {
    if (desktopMediaQuery) {
        desktopMediaQuery.removeEventListener('change', syncDesktopState);
    }
    window.removeEventListener('beforeunload', handleAttemptBeforeUnload);
    removeMiniGamePointerListeners();
});
</script>

<style scoped>
.episode-layout {
    display: grid;
    gap: 1.5rem;
}

.episode-layout-study {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
}

.episode-cover {
    width: 100%;
    min-height: 9.5rem;
    aspect-ratio: 16 / 9;
    border-radius: 1rem;
    background: color-mix(in srgb, var(--surface-2) 40%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: zoom-in;
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.episode-cover:hover {
    border-color: color-mix(in srgb, var(--primary) 36%, var(--border));
    transform: translateY(-1px);
}

.episode-cover-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
}

.episode-layout-challenge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
}

.episode-cover-strip {
    width: 100%;
    display: grid;
    gap: 0.85rem;
    grid-template-columns: 1fr;
    align-items: center;
}

.episode-cover-strip-study .episode-cover {
    width: min(18rem, 62vw);
    height: 10.125rem;
    aspect-ratio: auto;
    max-width: 100%;
    min-width: 0;
    justify-self: start;
}

.episode-cover-strip-study .episode-cover-image {
    object-fit: contain;
    object-position: center;
}

@media (max-width: 767px) {
    .episode-layout-challenge .episode-cover,
    .episode-cover-strip-study .episode-cover {
        justify-self: center;
        margin-left: auto;
        margin-right: auto;
    }
}

.episode-side-panel {
    border: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--surface-2) 28%, transparent);
    padding: 0.75rem;
    min-height: 100%;
}

.episode-side-kicker {
    margin: 0 0 0.3rem;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--primary) 70%, var(--text));
}

.episode-side-copy {
    margin: 0;
    font-size: 0.84rem;
    line-height: 1.4;
    color: color-mix(in srgb, var(--text) 90%, var(--text-muted));
}

.episode-side-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.38rem;
    font-size: 0.8rem;
    color: color-mix(in srgb, var(--text) 92%, var(--text-muted));
}

.episode-side-list li {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
}

.episode-side-icon {
    width: 0.95rem;
    height: 0.95rem;
    flex-shrink: 0;
    color: color-mix(in srgb, var(--primary) 72%, var(--text));
}

.episode-layout-challenge .episode-cover {
    width: min(18rem, 62vw);
    height: 10.125rem;
    aspect-ratio: auto;
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
    width: 100%;
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
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
}

.episode-study-hero {
    align-items: center;
    text-align: center;
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

.episode-tip-pulse {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    width: 100%;
    border: 1px solid color-mix(in srgb, var(--primary) 35%, var(--border));
    border-radius: 12px;
    padding: 0.65rem 0.75rem;
    background: linear-gradient(
        140deg,
        color-mix(in srgb, var(--primary) 12%, var(--surface)),
        color-mix(in srgb, var(--surface-2) 70%, transparent)
    );
    cursor: zoom-in;
    text-align: left;
    animation: episode-tip-pulse-glow 2s ease-in-out infinite;
}

.episode-tip-pulse-dot {
    width: 1.55rem;
    height: 1.55rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 800;
    color: color-mix(in srgb, var(--primary) 80%, #fff);
    background: color-mix(in srgb, var(--primary) 18%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--primary) 45%, transparent);
    flex-shrink: 0;
}

.episode-tip-pulse-copy {
    font-size: 0.9rem;
    line-height: 1.35;
    color: color-mix(in srgb, var(--text) 94%, var(--text-muted));
}

.episode-tip-pulse-action {
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 700;
    color: color-mix(in srgb, var(--primary) 85%, #fff);
    white-space: nowrap;
}

@keyframes episode-tip-pulse-glow {
    0%,
    100% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 22%, transparent);
    }
    50% {
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--primary) 8%, transparent);
    }
}

.episode-image-preview-modal {
    width: min(92vw, 64rem);
    max-height: 90vh;
    overflow: auto;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.episode-image-preview-full {
    width: 100%;
    max-height: calc(90vh - 4.2rem);
    object-fit: contain;
    display: block;
    border-radius: 10px;
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
        min-height: 16rem;
    }

    .episode-layout-challenge .episode-cover {
        width: min(20rem, 38vw);
        height: 11.25rem;
    }

    .episode-cover-strip {
        grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, 1.45fr);
        gap: 1rem;
    }

    .episode-cover-strip-study {
        grid-template-columns: minmax(0, auto) minmax(220px, 0.9fr) minmax(320px, 1.4fr);
        align-items: center;
    }

    .episode-cover-strip-study .episode-side-panel {
        min-width: 0;
    }

    .episode-cover-strip-study .episode-cover {
        width: min(20rem, 38vw);
        height: 11.25rem;
    }
}

.episode-gate-overlay {
    position: fixed;
    inset: 0;
    background: var(--modal-overlay);
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
    border: 1px solid color-mix(in srgb, var(--border) 92%, transparent);
    background: color-mix(in srgb, var(--surface) 98%, transparent);
    padding: 18px;
    box-shadow: var(--modal-shadow);
}

.review-wrong-answer {
    color: color-mix(in srgb, var(--danger) 80%, var(--text));
    background: color-mix(in srgb, var(--danger) 14%, transparent);
    padding: 2px 8px;
    border-radius: 8px;
}

.review-correct-answer {
    color: color-mix(in srgb, var(--success) 82%, var(--text));
    background: color-mix(in srgb, var(--success) 14%, transparent);
    padding: 2px 8px;
    border-radius: 8px;
}

.review-status-ok {
    color: color-mix(in srgb, var(--success) 82%, var(--text));
    background: color-mix(in srgb, var(--success) 14%, transparent);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}

.review-status-needs {
    color: color-mix(in srgb, var(--danger) 80%, var(--text));
    background: color-mix(in srgb, var(--danger) 14%, transparent);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
}

.mini-game-board {
    border: 1px solid color-mix(in srgb, var(--border) 90%, var(--primary) 8%);
    border-radius: 12px;
    padding: 12px;
    /* Alinhado ao “papel” do app: leve, sem blocos pretos */
    background: color-mix(in srgb, var(--surface) 92%, var(--primary) 8%);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--text) 5%, transparent);
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
    border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border));
    border-radius: 999px;
    padding: 8px 10px;
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--surface) 88%, var(--primary) 12%),
        color-mix(in srgb, var(--surface-2) 75%, var(--primary) 8%)
    );
    color: var(--text);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    text-align: left;
    cursor: grab;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    box-shadow: 0 1px 2px color-mix(in srgb, var(--text) 6%, transparent);
}

.mini-game-pill:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary) 55%, var(--focus-ring));
    outline-offset: 2px;
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
    border: 1px dashed color-mix(in srgb, var(--border) 55%, var(--primary) 28%);
    border-radius: 10px;
    padding: 8px;
    background: color-mix(in srgb, var(--surface) 96%, var(--primary) 4%);
}

.mini-game-slot-active {
    border-color: color-mix(in srgb, var(--primary) 52%, var(--border));
    border-style: solid;
    background: color-mix(in srgb, var(--primary) 11%, var(--surface));
    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--primary) 22%, transparent);
}

.mini-game-slot-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: color-mix(in srgb, var(--text-soft) 70%, var(--primary) 30%);
}

.mini-game-slot-empty {
    margin-top: 4px;
    font-size: 0.75rem;
    color: var(--muted);
}

.mini-game-slot-card {
    margin-top: 4px;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.mini-game-slot-remove {
    align-self: flex-start;
    border: 1px solid color-mix(in srgb, var(--border) 72%, var(--danger) 28%);
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.7rem;
    font-weight: 700;
    background: color-mix(in srgb, var(--surface) 88%, var(--danger) 12%);
    color: color-mix(in srgb, var(--danger) 78%, var(--text));
    cursor: pointer;
}

.mini-game-slot-remove:hover {
    border-color: color-mix(in srgb, var(--danger) 55%, var(--border));
    background: color-mix(in srgb, var(--danger) 16%, var(--surface));
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

.assessment-attempt-warning {
    margin: 0;
    padding: 0.55rem 0.7rem;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, #f59e0b 45%, transparent);
    background: color-mix(in srgb, #f59e0b 12%, var(--surface));
    color: color-mix(in srgb, #f59e0b 72%, var(--text));
    font-size: 0.78rem;
    font-weight: 600;
}

.assessment-prompt-markdown {
    line-height: 1.45;
}

.assessment-prompt-markdown :deep(p) {
    margin: 0.35rem 0;
}

.assessment-prompt-markdown :deep(ul),
.assessment-prompt-markdown :deep(ol) {
    margin: 0.35rem 0 0.35rem 1.25rem;
    padding: 0;
}

.assessment-prompt-markdown :deep(li) {
    margin: 0.15rem 0;
}

.assessment-prompt-markdown :deep(h1),
.assessment-prompt-markdown :deep(h2),
.assessment-prompt-markdown :deep(h3) {
    margin: 0.45rem 0 0.25rem;
    font-weight: 700;
}

.assessment-prompt-markdown :deep(code) {
    background: color-mix(in srgb, var(--surface-2) 70%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
    border-radius: 6px;
    padding: 0.05rem 0.35rem;
    font-size: 0.82em;
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

.assessment-answer-input,
.assessment-answer-select {
    background: color-mix(in srgb, var(--surface) 94%, white 6%);
    border-color: color-mix(in srgb, var(--border) 78%, var(--primary) 22%);
    color: var(--text);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--text) 4%, transparent);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.assessment-answer-input::placeholder {
    color: color-mix(in srgb, var(--text-muted) 80%, transparent);
}

.assessment-answer-input:hover,
.assessment-answer-select:hover {
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
    background: color-mix(in srgb, var(--surface) 88%, white 12%);
}

.assessment-answer-input:focus,
.assessment-answer-select:focus {
    border-color: color-mix(in srgb, var(--primary) 72%, var(--focus-ring));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
    outline: none;
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
