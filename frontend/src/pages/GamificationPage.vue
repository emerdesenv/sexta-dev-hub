<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10 pb-12">
            <section class="sd-card sd-card-section p-6 md:p-7">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <Badge tone="primary">Gamificação</Badge>
                        <Badge v-if="isShowcase" tone="pdf" class="ml-2">Modo vitrine</Badge>
                        <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Sua jornada de evolução</h1>
                        <p class="mt-3 text-muted max-w-3xl">
                            Complete episódios para ganhar XP e moedas, cumpra missões e colecione troféus por
                            atividade — a barra abaixo soma conquistas globais e troféus de episódios.
                        </p>
                    </div>
                    <router-link
                        v-if="!auth.isAuthenticated"
                        class="sd-button sd-button-secondary"
                        to="/aluno"
                    >
                        Entrar como aluno
                    </router-link>
                </div>
                <p v-if="!auth.isAuthenticated" class="mt-3 text-sm text-muted">
                    Visitantes navegam em modo demonstracao. Crie uma conta de aluno para registrar pontuacao real.
                </p>
                <div v-if="isShowcase" class="sd-notice mt-4">
                    Você está vendo dados de exemplo. Entre como aluno para ativar progresso real, resgates e histórico.
                </div>

                <div class="mt-6">
                    <GamificationTrophyBar
                        :level="data.profile.level"
                        :level-percent="levelPercent"
                        :xp-current-level="data.profile.xpCurrentLevel"
                        :xp-next-level="data.profile.xpNextLevel"
                        :trophy-by-tier="data.trophyCollection?.byTier || emptyTrophyByTier"
                        :total-items="data.trophyCollection?.totalItems ?? 0"
                    />
                    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                        <span>{{ data.profile.xpTotal }} XP total</span>
                        <span
                            v-if="(data.profile.streakShieldCount || 0) > 0"
                            class="text-info"
                        >
                            Proteção de streak ativa
                        </span>
                    </div>
                </div>

                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                    <div class="sd-card-item p-4">
                        <div class="text-muted text-sm">Streak</div>
                        <strong class="text-3xl font-extrabold">{{ data.profile.streakDays }} dias</strong>
                        <div class="text-muted text-sm mt-1">Consistencia ativa</div>
                        <div class="text-xs mt-2" :class="data.profile.streakShieldCount > 0 ? 'text-info' : 'text-muted'">
                            Escudo de streak: {{ data.profile.streakShieldCount || 0 }}
                        </div>
                    </div>
                    <div class="sd-card-item p-4">
                        <div class="text-muted text-sm">Moedas</div>
                        <strong class="text-3xl font-extrabold">{{ data.profile.coins }}</strong>
                        <div class="text-muted text-sm mt-1">Para trocar por recompensas</div>
                    </div>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="sd-section-title">Missoes</h2>
                <div v-if="notice" class="sd-notice mt-3">{{ notice }}</div>
                <div v-if="errorMessage" class="sd-error mt-3">{{ errorMessage }}</div>
                <div class="mt-4 grid gap-4 md:grid-cols-3">
                    <article
                        v-for="mission in data.missions"
                        :key="mission.key"
                        class="sd-card sd-card-item p-5"
                    >
                        <h3 class="sd-card-title">{{ mission.title }}</h3>
                        <div class="sd-card-meta">Progresso {{ mission.progress }}/{{ mission.target }}</div>
                        <div class="sd-progress">
                            <div
                                class="sd-progress-fill sd-progress-fill-mission"
                                :style="{ width: missionPercent(mission) + '%' }"
                            ></div>
                        </div>
                        <div class="text-xs text-muted">
                            {{ missionPercent(mission) }}%
                        </div>
                        <div class="text-sm mt-3 text-muted">
                            Recompensa: +{{ mission.rewardXp }} XP • +{{ mission.rewardCoins }} moedas
                        </div>
                        <div class="mt-3">
                            <Badge :tone="mission.status === 'completed' ? 'success' : 'info'">
                                {{ mission.status === 'completed' ? 'Concluída' : 'Em andamento' }}
                            </Badge>
                        </div>
                        <button
                            v-if="auth.isAuthenticated"
                            class="sd-button sd-button-primary mt-3 w-full"
                            type="button"
                            :disabled="mission.claimed || mission.status !== 'completed' || loadingAction"
                            @click="claimMission(mission.key)"
                        >
                            {{ mission.claimed ? 'Já resgatada' : 'Resgatar missão' }}
                        </button>
                        <button
                            v-else
                            class="sd-button sd-button-secondary mt-3 w-full"
                            type="button"
                            @click="goToStudentAuth"
                        >
                            🔒 Entrar para resgatar
                        </button>
                    </article>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="sd-section-title">Desempenho em atividades</h2>
                <div v-if="auth.isAuthenticated" class="mt-4 grid gap-4 md:grid-cols-4">
                    <article class="sd-card sd-card-item p-4">
                        <div class="text-muted text-sm">Média de nota</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.averageScore }}%</strong>
                    </article>
                    <article class="sd-card sd-card-item p-4">
                        <div class="text-muted text-sm">Taxa de aprovação</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.passRate }}%</strong>
                    </article>
                    <article class="sd-card sd-card-item p-4">
                        <div class="text-muted text-sm">Tentativas totais</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.totalAttempts }}</strong>
                    </article>
                    <article class="sd-card sd-card-item p-4">
                        <div class="text-muted text-sm">Atividades avaliativas</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.distinctActivities }}</strong>
                    </article>
                </div>
                <div v-if="auth.isAuthenticated" class="sd-card sd-card-section mt-4 p-4">
                    <h3 class="sd-card-title">Últimas tentativas</h3>
                    <div v-if="assessmentAttempts.length" class="space-y-2 mt-3">
                        <router-link
                            v-for="attempt in assessmentAttempts.slice(0, 8)"
                            :key="attempt.attemptId"
                            :to="`/episodio/${attempt.slug}`"
                            class="sd-list-item flex justify-between items-center p-3"
                        >
                            <span class="text-sm">
                                {{ attempt.title }} • Tentativa {{ attempt.attemptNumber }}
                            </span>
                            <span class="inline-flex items-center gap-2">
                                <span class="text-xs text-muted">Nota {{ attempt.score ?? '-' }}%</span>
                                <Badge :tone="attempt.passed ? 'success' : 'neutral'">
                                    {{ attempt.passed ? 'Aprovado' : 'Reprovado' }}
                                </Badge>
                            </span>
                        </router-link>
                    </div>
                    <div v-else class="sd-notice mt-3">
                        Sem tentativas avaliativas registradas ainda.
                    </div>
                </div>
                <div v-else class="sd-notice mt-4">
                    Entre como aluno para acompanhar suas métricas de desempenho em atividades.
                </div>
            </section>

            <section class="mt-8">
                <h2 class="sd-section-title">Conquistas</h2>
                <div class="mt-4 grid gap-4 md:grid-cols-3">
                    <article
                        v-for="badge in data.badges"
                        :key="badge.key"
                        class="sd-card sd-card-item p-5"
                    >
                        <div class="flex flex-wrap items-center gap-2">
                            <h3 class="sd-card-title">{{ badge.title }}</h3>
                            <Badge v-if="badgeTierLabel(badge)" tone="neutral" class="!text-xs !py-0.5">
                                {{ badgeTierLabel(badge) }}
                            </Badge>
                        </div>
                        <p class="sd-card-meta" v-if="badge.target">
                            {{ badge.progress || 0 }}/{{ badge.target }}
                        </p>
                        <p class="text-sm mt-2" :class="badge.unlocked ? 'text-success' : 'text-muted'">
                            {{ badge.unlocked ? 'Desbloqueada' : 'Bloqueada' }}
                        </p>
                    </article>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="sd-section-title">Ranking</h2>
                <div class="sd-card sd-card-section mt-4 p-4">
                    <div class="space-y-2">
                        <div
                            v-for="(player, index) in leaderboard"
                            :key="`${player.username}-${index}`"
                            class="sd-list-item flex justify-between items-center p-3"
                        >
                            <span class="inline-flex items-center gap-2">
                                <span>#{{ index + 1 }} • {{ player.username }}</span>
                                <Badge v-if="player.profileProEnabled" tone="pro">PRO</Badge>
                            </span>
                            <span class="inline-flex items-center gap-3 text-sm text-muted">
                                <span title="Total de troféus na coleção">🏆 {{ player.trophyTotal ?? 0 }}</span>
                                <span>N{{ player.level }} • {{ player.xpTotal }} XP</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="sd-section-title">Recompensas</h2>
                <div class="mt-4 grid gap-4 md:grid-cols-4">
                    <article
                        v-for="reward in data.rewards"
                        :key="reward.key"
                        class="sd-card sd-card-item p-4"
                    >
                        <h3 class="sd-card-title">{{ reward.title }}</h3>
                        <p class="sd-card-meta">{{ reward.costCoins }} moedas</p>
                        <p class="text-xs text-muted mt-2">Categoria: {{ reward.category }}</p>
                        <p class="text-sm mt-3">{{ rewardHelpText(reward.key).whatItDoes }}</p>
                        <p class="text-xs text-muted mt-1">Quando usar: {{ rewardHelpText(reward.key).whenToUse }}</p>
                        <p v-if="reward.owned" class="text-xs text-success mt-2">Resgatada</p>
                        <button
                            v-if="auth.isAuthenticated"
                            class="sd-button sd-button-secondary mt-3 w-full"
                            type="button"
                            :disabled="loadingAction || (reward.owned && reward.key !== 'theme_neon') || (!reward.affordable && !reward.owned)"
                            @click="redeemReward(reward.key)"
                        >
                            {{
                                reward.owned
                                    ? (reward.key === 'theme_neon' ? 'Ativar tema' : 'Já resgatada')
                                    : (reward.affordable ? 'Resgatar' : 'Moedas insuficientes')
                            }}
                        </button>
                        <button
                            v-else
                            class="sd-button sd-button-secondary mt-3 w-full"
                            type="button"
                            @click="goToStudentAuth"
                        >
                            🔒 Entrar para resgatar
                        </button>
                    </article>
                </div>
            </section>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';
import GamificationTrophyBar from '../components/GamificationTrophyBar.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const emptyTrophyByTier = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
const data = ref({
    profile: {
        level: 1,
        xpTotal: 0,
        xpCurrentLevel: 0,
        xpNextLevel: 100,
        coins: 0,
        streakDays: 0,
        streakShieldCount: 0
    },
    missions: [],
    badges: [],
    rewards: [],
    trophyCollection: {
        byTier: { ...emptyTrophyByTier },
        totalItems: 0
    }
});
const leaderboard = ref([]);
const loadingAction = ref(false);
const notice = ref('');
const errorMessage = ref('');
const assessmentAttempts = ref([]);
const isShowcase = computed(() => !auth.isAuthenticated);

const levelPercent = computed(() => {
    const next = Number(data.value.profile.xpNextLevel || 0);
    if (!next) return 0;
    return Math.min(100, Math.round((Number(data.value.profile.xpCurrentLevel || 0) / next) * 100));
});

function missionPercent(mission) {
    if (!mission?.target) return 0;
    return Math.min(100, Math.round((mission.progress / mission.target) * 100));
}

const TIER_LABELS = {
    platinum: 'Platina',
    gold: 'Ouro',
    silver: 'Prata',
    bronze: 'Bronze'
};

function badgeTierLabel(badge) {
    const t = typeof badge?.tier === 'string' ? badge.tier.toLowerCase() : '';
    return TIER_LABELS[t] || '';
}

const assessmentStats = computed(() => {
    const attempts = assessmentAttempts.value;
    if (!attempts.length) {
        return { averageScore: 0, passRate: 0, totalAttempts: 0, distinctActivities: 0 };
    }
    const withScore = attempts.filter((item) => Number.isFinite(Number(item.score)));
    const averageScore = withScore.length
        ? Math.round(withScore.reduce((sum, item) => sum + Number(item.score), 0) / withScore.length)
        : 0;
    const passedCount = attempts.filter((item) => item.passed).length;
    const passRate = Math.round((passedCount / attempts.length) * 100);
    const distinctActivities = new Set(attempts.map((item) => item.episodeId)).size;
    return {
        averageScore,
        passRate,
        totalAttempts: attempts.length,
        distinctActivities
    };
});

function goToStudentAuth() {
    router.push('/aluno');
}

function rewardHelpText(rewardKey) {
    const helpByKey = {
        theme_neon: {
            whatItDoes: 'Muda o visual do sistema para o tema Neon.',
            whenToUse: 'Quando quiser personalizar sua experiência.'
        },
        profile_pro: {
            whatItDoes: 'Ativa destaque PRO no seu perfil e ranking.',
            whenToUse: 'Quando quiser reconhecimento visual no sistema.'
        },
        streak_shield: {
            whatItDoes: 'Protege sua sequência de estudos por 1 ausência.',
            whenToUse: 'Quando achar que pode faltar um dia.'
        },
        early_access: {
            whatItDoes: 'Libera conteúdos antecipados antes da turma.',
            whenToUse: 'Quando quiser adiantar estudos e sair na frente.'
        }
    };

    return helpByKey[rewardKey] || {
        whatItDoes: 'Ativa um benefício especial no seu perfil.',
        whenToUse: 'Quando esse benefício ajudar seu ritmo de estudo.'
    };
}

async function loadData() {
    const endpoint = auth.isAuthenticated ? '/gamification/me' : '/gamification/preview';
    const requests = [
        api.get(endpoint),
        api.get('/gamification/leaderboard')
    ];
    if (auth.isAuthenticated) {
        requests.push(api.get('/gamification/history/me'));
    }
    const responses = await Promise.all(requests);
    const snapshot = responses[0].data;
    const ranking = responses[1].data;
    const historyData = auth.isAuthenticated ? responses[2].data : null;

    data.value = {
        profile: snapshot.profile,
        missions: snapshot.missions || [],
        badges: snapshot.badges || [],
        rewards: snapshot.rewards || [],
        trophyCollection: snapshot.trophyCollection || {
            byTier: { ...emptyTrophyByTier },
            totalItems: 0
        }
    };
    assessmentAttempts.value = Array.isArray(historyData?.assessmentAttempts)
        ? historyData.assessmentAttempts
        : [];
    leaderboard.value = ranking?.length ? ranking : (snapshot.leaderboard || []);
}

async function claimMission(missionKey) {
    loadingAction.value = true;
    notice.value = '';
    errorMessage.value = '';
    try {
        const { data: response } = await api.post(`/gamification/missions/${missionKey}/claim`);
        data.value = {
            ...data.value,
            ...response.snapshot
        };
        notice.value = `Missão resgatada: +${response.awarded.xp} XP e +${response.awarded.coins} moedas.`;
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível resgatar a missão.';
    } finally {
        loadingAction.value = false;
    }
}

async function redeemReward(rewardKey) {
    loadingAction.value = true;
    notice.value = '';
    errorMessage.value = '';
    try {
        const reward = data.value.rewards.find((item) => item.key === rewardKey);
        const shouldActivate = reward?.owned && rewardKey === 'theme_neon';
        const { data: response } = shouldActivate
            ? await api.post(`/gamification/rewards/${rewardKey}/activate`)
            : await api.post(`/gamification/rewards/${rewardKey}/redeem`);
        data.value = {
            ...data.value,
            ...response.snapshot
        };
        if (shouldActivate) {
            notice.value = 'Tema Neon ativado com sucesso.';
        } else {
            notice.value = `Recompensa resgatada: ${response.redeemed.title}.`;
        }
        await auth.refreshThemePreference();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível resgatar a recompensa.';
    } finally {
        loadingAction.value = false;
    }
}

onMounted(loadData);
</script>
