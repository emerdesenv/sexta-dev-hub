<template>
    <Card class="overflow-hidden h-full flex flex-col episode-card">
        <div class="w-full h-44 sm:h-48 bg-surface-2/40 border-b border-border/40 flex items-center justify-center">
            <img
                v-if="episode.cover_url"
                :src="episode.cover_url"
                :alt="episode.title"
                class="w-full h-full object-contain"
            />
            <span v-else class="text-sm text-muted">Sem capa</span>
        </div>

        <div class="p-5 flex flex-col gap-3 flex-1">
            <!-- Linha 1: decisão (poucos sinais com alto destaque) -->
            <div class="flex flex-wrap gap-2 items-center">
                <Badge
                    v-if="episode.completed"
                    tone="success"
                    aria-label="Episódio concluído"
                    title="Episódio concluído"
                    class="!inline-flex !items-center !gap-1"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="w-4 h-4"
                        aria-hidden="true"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.32 7.381a1 1 0 0 1-1.42-.002L3.29 9.37a1 1 0 0 1 1.42-1.408l3.97 4.004 6.614-6.67a1 1 0 0 1 1.41-.006Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <span class="hidden sm:inline">Concluído</span>
                </Badge>

                <Badge
                    v-if="episode.trophy_tier"
                    tone="warning"
                    class="!inline-flex !items-center !gap-2"
                    :title="`Este episódio concede troféu ${trophyTierMeta(episode.trophy_tier).label}`"
                >
                    <span
                        class="trophy-pill-dot flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-slate-900 shadow-inner"
                        :class="trophyTierMeta(episode.trophy_tier).dotClass"
                        aria-hidden="true"
                    >
                        {{ trophyTierMeta(episode.trophy_tier).short }}
                    </span>
                    <span class="font-semibold">{{ trophyTierMeta(episode.trophy_tier).label }}</span>
                </Badge>
                <Badge
                    v-else
                    tone="neutral"
                    title="Este episódio não concede troféu na coleção"
                >
                    Sem troféu
                </Badge>

                <Badge v-if="episode.episode_type === 'assessment'" tone="audio">Avaliativo</Badge>

                <Badge tone="primary">+{{ episode.xp_reward || 40 }} XP</Badge>

                <Badge
                    v-if="episode.episode_type === 'assessment' && episode.assessment_best_score !== null && episode.assessment_best_score !== undefined"
                    :tone="episode.assessment_best_score >= (episode.passing_score || 60) ? 'success' : 'neutral'"
                >
                    Nota {{ Math.round(episode.assessment_best_score) }}%
                </Badge>
                <Badge v-if="episode.episode_type === 'assessment'" tone="neutral">
                    {{ attemptsUsed }}/{{ maxAttempts }} tentativas
                </Badge>
            </div>

            <!-- Linha 2: contexto (baixo destaque) -->
            <div class="episode-card-meta flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span v-for="item in contextItemsVisible" :key="item" class="episode-card-meta-item">
                    {{ item }}
                </span>
                <Badge
                    v-if="contextItemsOverflowCount > 0"
                    tone="neutral"
                    class="!text-xs"
                    :title="`${contextItemsOverflowCount} detalhe(s) a mais`"
                    aria-label="Mais detalhes"
                >
                    +{{ contextItemsOverflowCount }} mais
                </Badge>
            </div>

            <h3 class="sd-card-title">
                {{ episode.title }}
            </h3>
            <p class="sd-card-meta leading-relaxed episode-card-summary">
                {{ episode.summary }}
            </p>

            <router-link
                v-if="auth.isAuthenticated"
                class="sd-button sd-button-primary sd-card-actions px-4 py-2 text-sm"
                :to="`/episodio/${episode.slug}`"
            >
                Abrir episódio
            </router-link>
            <button
                v-else
                class="sd-button sd-button-primary sd-card-actions px-4 py-2 text-sm"
                type="button"
                @click="showLoginPrompt = true"
            >
                🔒 Abrir episódio
            </button>
        </div>

    </Card>

    <Teleport to="body">
        <div
            v-if="showLoginPrompt"
            class="episode-gate-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Acesso do episódio"
            @click.self="closeLoginPrompt"
        >
            <div class="episode-gate-modal" @click.stop>
                <div class="text-lg font-bold">Conteúdo para aluno logado</div>
                <p class="text-sm text-muted mt-2">
                    Entre como aluno para acompanhar progresso, ganhar XP e desbloquear recompensas.
                </p>
                <div class="flex gap-2 mt-4">
                    <button class="sd-button sd-button-primary w-full" type="button" @click="goToStudentAuth">
                        Entrar / Criar conta
                    </button>
                    <button
                        class="sd-button sd-button-secondary w-full"
                        type="button"
                        @click="closeLoginPrompt"
                    >
                        Continuar visitante
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Card from './ui/Card.vue';
import Badge from './ui/Badge.vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({ episode: Object });

const auth = useAuthStore();
const router = useRouter();
const showLoginPrompt = ref(false);
const attemptsUsed = computed(() => Number(props.episode?.assessment_attempts_used || 0));
const maxAttempts = computed(() => Number(props.episode?.assessment_max_attempts_effective || props.episode?.max_attempts || 1));
const contextItems = computed(() => {
    const e = props.episode || {};
    const items = [];
    if (e.year_target) items.push(`${e.year_target}º ano`);
    if (e.category) items.push(String(e.category));
    if (e.duration_label) items.push(String(e.duration_label));
    if (e.pdf_url) items.push('PDF');
    if (e.audio_url) items.push('Áudio');
    return items;
});

const CONTEXT_ITEMS_LIMIT = 3;
const contextItemsVisible = computed(() => contextItems.value.slice(0, CONTEXT_ITEMS_LIMIT));
const contextItemsOverflowCount = computed(() => Math.max(0, contextItems.value.length - CONTEXT_ITEMS_LIMIT));

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

function goToStudentAuth() {
    closeLoginPrompt();
    router.push('/aluno');
}

function closeLoginPrompt() {
    showLoginPrompt.value = false;
}
</script>

<style scoped>
.episode-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.3);
    border-color: rgba(147, 197, 253, 0.35);
}

.episode-card-meta-item:not(:last-child)::after {
    content: '•';
    margin-left: 0.75rem;
    color: color-mix(in srgb, var(--text-muted) 65%, transparent);
}

.episode-card-summary {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
</style>
