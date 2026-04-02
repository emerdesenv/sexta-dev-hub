<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer>
            <section class="sd-card sd-card-section p-6 md:p-7">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <Badge tone="primary">Gamificação</Badge>
                        <Badge v-if="isShowcase" tone="pdf" class="ml-2">Modo vitrine</Badge>
                        <h1 class="mt-4 sd-page-hero-title">Sua jornada de evolução</h1>
                        <p class="mt-3 text-muted max-w-3xl">
                            Complete episódios para ganhar XP e moedas, cumpra missões e colecione troféus por
                            atividade - a barra abaixo soma conquistas globais e troféus de episódios.
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
                    <div class="mt-3 text-xs text-muted max-w-3xl leading-relaxed">
                        Troféus mostram suas conquistas, pontos de evolução mostram seu progresso e moedas ajudam a liberar benefícios.
                        <router-link
                            v-if="auth.isAuthenticated"
                            to="/aluno/conta"
                            class="inline-flex ml-1 text-primary hover:underline"
                        >
                            Ver detalhes no perfil
                        </router-link>
                    </div>
                </div>

                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                    <div class="sd-card-item p-4 gamif-stat-card gamif-stat-streak">
                        <div class="text-muted text-sm gamif-stat-label">Streak</div>
                        <strong class="text-3xl font-extrabold gamif-stat-value-streak">{{ data.profile.streakDays }} dias</strong>
                        <div class="text-muted text-sm mt-1">Consistencia ativa</div>
                        <div class="text-xs mt-2" :class="data.profile.streakShieldCount > 0 ? 'text-info' : 'text-muted'">
                            Escudo de streak: {{ data.profile.streakShieldCount || 0 }}
                        </div>
                    </div>
                    <div class="sd-card-item p-4 gamif-stat-card gamif-stat-coins">
                        <div class="text-muted text-sm gamif-stat-label">Moedas</div>
                        <strong class="text-3xl font-extrabold gamif-stat-value-coins">{{ data.profile.coins }}</strong>
                        <div class="text-muted text-sm mt-1">Para trocar por recompensas</div>
                    </div>
                </div>

                <div class="mt-5 grid gap-4 sm:grid-cols-2">
                    <article class="sd-card-item p-4 community-summary-card gamif-summary-community">
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-muted text-sm">Comunidade</div>
                            <Badge tone="info">Social</Badge>
                        </div>
                        <strong class="text-2xl font-extrabold mt-1 block">{{ communityBadges.length }} selo(s)</strong>
                        <p class="text-xs text-muted mt-1">
                            Selos de participação em tópicos, respostas e contribuições úteis.
                        </p>
                        <div v-if="communityBadges.length" class="mt-3 flex flex-wrap gap-2">
                            <Badge
                                v-for="badge in communityBadges.slice(0, 4)"
                                :key="badge.key"
                                tone="success"
                                :title="badge.title"
                            >
                                {{ badge.title }}
                            </Badge>
                        </div>
                        <div v-else class="text-xs text-muted mt-3">
                            Interaja na comunidade para desbloquear seus primeiros selos sociais.
                        </div>
                    </article>
                    <article class="sd-card-item p-4 community-summary-card gamif-summary-collectibles">
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-muted text-sm">Colecionáveis</div>
                            <Badge tone="warning">Itens</Badge>
                        </div>
                        <strong class="text-2xl font-extrabold mt-1 block">{{ communityCollectiblesCount }}</strong>
                        <p class="text-xs text-muted mt-1">
                            Itens de eventos e marcos sociais já desbloqueados na sua jornada.
                        </p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <router-link class="sd-button sd-button-secondary !py-1.5 !px-3 !text-xs" to="/comunidade">
                                Ir para comunidade
                            </router-link>
                            <router-link class="sd-button sd-button-secondary !py-1.5 !px-3 !text-xs" to="/aluno/colecao">
                                Ver coleção
                            </router-link>
                        </div>
                    </article>
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
                        class="sd-card sd-card-item p-5 gamif-mission-card"
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
                <div v-if="auth.isAuthenticated" class="mt-4 grid gap-4 md:grid-cols-2">
                    <article class="sd-card-item p-4 sd-stat-tile">
                        <div class="text-muted text-sm">Atividades com nota</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.averageScore }}%</strong>
                    </article>
                    <article class="sd-card-item p-4 sd-stat-tile">
                        <div class="text-muted text-sm">Concluídas com sucesso</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.passRate }}%</strong>
                    </article>
                </div>
                <div v-if="auth.isAuthenticated" class="mt-3">
                    <router-link to="/aluno/conta" class="sd-button sd-button-secondary sd-button-tonal">
                        Ver análise completa no perfil
                    </router-link>
                </div>
                <div v-else class="sd-notice mt-4">
                    Entre como aluno para acompanhar suas métricas de desempenho em atividades.
                </div>
            </section>

            <section class="mt-8">
                <h2 class="sd-section-title">Conquistas</h2>
                <div class="sd-card sd-card-section mt-4 p-4 md:p-5">
                    <p class="text-sm text-muted">
                        Resumo rápido por trilha para acompanhar sua evolução.
                    </p>
                    <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <article
                            v-for="group in badgeGroups"
                            :key="group.key"
                            class="sd-card sd-card-section p-5 badge-group-card"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <h3 class="sd-card-title">{{ group.title }}</h3>
                                <span class="badge-group-counter">{{ group.unlockedCount }}/{{ group.totalCount }}</span>
                            </div>
                            <p class="text-xs text-muted mt-1">
                                {{ group.unlockedCount === group.totalCount ? 'Trilha concluida' : 'Conquistas desbloqueadas' }}
                            </p>
                            <div class="sd-progress mt-3">
                                <div
                                    class="sd-progress-fill sd-progress-fill-mission"
                                    :style="{ width: `${group.progressPercent}%` }"
                                ></div>
                            </div>
                        </article>
                    </div>
                    <div class="mt-4">
                        <router-link
                            v-if="auth.isAuthenticated"
                            to="/aluno/conta"
                            class="sd-button sd-button-secondary sd-button-tonal"
                        >
                            Ver trilhas e regras completas no perfil
                        </router-link>
                    </div>
                </div>
            </section>

            <section class="mt-8 ranking-section">
                <h2 class="sd-section-title">Ranking</h2>
                <div class="sd-card sd-card-section mt-4 p-4 ranking-shell">
                    <div class="ranking-toolbar mb-3">
                        <p class="text-sm text-muted">
                            Top 3 da semana
                        </p>
                        <p v-if="auth.isAuthenticated && myRank" class="text-xs text-muted">
                            Sua posição atual: <strong>#{{ myRank }}</strong>
                        </p>
                    </div>
                    <div v-if="topThree.length" class="ranking-podium">
                        <article
                            v-for="player in topThree"
                            :key="`top-${player.username}`"
                            class="ranking-podium-item"
                            :class="`ranking-podium-item-${player.rank}`"
                        >
                            <div class="ranking-podium-rank-chip">
                                <span
                                    class="ranking-podium-icon"
                                    :class="`ranking-podium-icon-${player.rank}`"
                                    aria-hidden="true"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                                        <path d="M8 4h8v2h2a2 2 0 0 1 2 2v2a5 5 0 0 1-5 5h-1.2A4.8 4.8 0 0 1 13 17.8V19h3v2H8v-2h3v-1.2A4.8 4.8 0 0 1 10.2 15H9a5 5 0 0 1-5-5V8a2 2 0 0 1 2-2h2V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                                    </svg>
                                </span>
                                <span>#{{ player.rank }}</span>
                            </div>
                            <strong class="ranking-podium-name">
                                {{ player.username }}
                            </strong>
                            <div class="ranking-podium-meta">
                                <span>N{{ player.level }}</span>
                                <span>{{ player.xpTotal }} XP</span>
                            </div>
                            <Badge v-if="player.profileProEnabled" tone="pro">PRO</Badge>
                        </article>
                    </div>
                    <div v-if="!topThree.length" class="sd-notice mt-3">
                        Nenhum participante encontrado para esse filtro.
                    </div>
                    <div class="mt-3">
                        <router-link
                            v-if="auth.isAuthenticated"
                            to="/aluno/conta"
                            class="sd-button sd-button-secondary sd-button-tonal"
                        >
                            Ver ranking completo no perfil
                        </router-link>
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
const communityCollectiblesCount = ref(0);
const isShowcase = computed(() => !auth.isAuthenticated);

const communityBadges = computed(() =>
    (Array.isArray(data.value.badges) ? data.value.badges : []).filter(
        (badge) => badge?.unlocked && String(badge?.key || '').startsWith('community_')
    )
);

const badgeGroups = computed(() => {
    const allBadges = Array.isArray(data.value.badges) ? data.value.badges : [];
    const groups = [
        { key: 'study', title: 'Estudos', badges: [] },
        { key: 'activity', title: 'Atividades', badges: [] },
        { key: 'community', title: 'Comunidade', badges: [] }
    ];

    allBadges.forEach((badge) => {
        const key = String(badge?.key || '').toLowerCase();
        if (key === 'community_mentor' || key.includes('mentor')) {
            groups[1].badges.push(badge);
            return;
        }
        if (key.startsWith('community_')) {
            groups[2].badges.push(badge);
            return;
        }
        groups[0].badges.push(badge);
    });

    return groups
        .map((group) => {
            const totalCount = group.badges.length;
            const unlockedCount = group.badges.filter((badge) => Boolean(badge?.unlocked)).length;
            const progressPercent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;
            return {
                ...group,
                totalCount,
                unlockedCount,
                progressPercent
            };
        });
});

const totalBadgeCount = computed(() => (
    (Array.isArray(data.value.badges) ? data.value.badges : []).length
));

const visibleBadgeCount = computed(() => (
    badgeGroups.value.reduce((sum, group) => sum + group.totalCount, 0)
));
const topThree = computed(() =>
    (leaderboard.value || []).slice(0, 3).map((player, index) => ({
        ...player,
        rank: index + 1
    }))
);
const myRank = computed(() => {
    if (!auth.isAuthenticated) return null;
    const username = String(auth.user?.username || '').toLowerCase();
    if (!username) return null;
    const index = (leaderboard.value || []).findIndex(
        (player) => String(player?.username || '').toLowerCase() === username
    );
    return index >= 0 ? index + 1 : null;
});

const levelPercent = computed(() => {
    const next = Number(data.value.profile.xpNextLevel || 0);
    if (!next) return 0;
    return Math.min(100, Math.round((Number(data.value.profile.xpCurrentLevel || 0) / next) * 100));
});

function missionPercent(mission) {
    if (!mission?.target) return 0;
    return Math.min(100, Math.round((mission.progress / mission.target) * 100));
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
        requests.push(api.get('/events/collectibles/me'));
    }
    const responses = await Promise.all(requests);
    const snapshot = responses[0].data;
    const ranking = responses[1].data;
    const historyData = auth.isAuthenticated ? responses[2].data : null;
    const collectiblesData = auth.isAuthenticated ? responses[3].data : null;

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
    communityCollectiblesCount.value = Array.isArray(collectiblesData?.items)
        ? collectiblesData.items.length
        : 0;
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

<style scoped>
.gamif-stat-card {
    position: relative;
    overflow: hidden;
    border-width: 1px;
    border-style: solid;
}

.gamif-stat-label {
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    font-size: 0.72rem;
}

.gamif-stat-streak {
    border-color: color-mix(in srgb, var(--info) 40%, var(--border));
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--info) 17%, var(--surface)),
        color-mix(in srgb, var(--surface) 90%, var(--info) 8%)
    );
    box-shadow:
        inset 0 3px 0 color-mix(in srgb, var(--info) 32%, transparent),
        0 6px 18px color-mix(in srgb, var(--info) 10%, transparent);
}

.gamif-stat-value-streak {
    color: color-mix(in srgb, var(--info) 28%, var(--text));
}

.gamif-stat-coins {
    border-color: color-mix(in srgb, var(--warning) 44%, var(--border));
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--warning) 18%, var(--surface)),
        color-mix(in srgb, var(--surface) 88%, var(--warning) 10%)
    );
    box-shadow:
        inset 0 3px 0 color-mix(in srgb, var(--warning) 36%, transparent),
        0 6px 18px color-mix(in srgb, var(--warning) 10%, transparent);
}

.gamif-stat-value-coins {
    color: color-mix(in srgb, var(--warning) 22%, var(--text));
}

.community-summary-card {
    border-width: 1px;
    border-style: solid;
}

.gamif-summary-community {
    border-color: color-mix(in srgb, var(--info) 38%, var(--border));
    background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--info) 15%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 91%, var(--info) 9%)
    );
    box-shadow: 0 6px 16px color-mix(in srgb, var(--info) 8%, transparent);
}

.gamif-summary-collectibles {
    border-color: color-mix(in srgb, var(--primary-2) 40%, var(--border));
    background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--primary-2) 16%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 90%, var(--primary-2) 10%)
    );
    box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-2) 9%, transparent);
}

.gamif-mission-card {
    border-color: color-mix(in srgb, var(--primary) 22%, var(--border));
    background: linear-gradient(
        98deg,
        color-mix(in srgb, var(--surface) 94%, var(--primary) 5%),
        color-mix(in srgb, var(--surface-2) 35%, var(--surface))
    );
    box-shadow: 0 6px 18px color-mix(in srgb, var(--primary) 5%, transparent);
}

.badge-group-card {
    border-color: color-mix(in srgb, var(--primary) 24%, var(--border));
    background:
        radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 36%),
        color-mix(in srgb, var(--surface) 96%, transparent);
}

.badge-group-counter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 3.1rem;
    border-radius: 999px;
    padding: 0.2rem 0.62rem;
    font-size: 0.78rem;
    font-weight: 800;
    border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border));
    background: color-mix(in srgb, var(--surface-2) 46%, var(--surface));
}

.badge-item {
    border: 1px solid color-mix(in srgb, var(--border) 90%, transparent);
    border-radius: 0.8rem;
    padding: 0.72rem 0.78rem;
    background: color-mix(in srgb, var(--surface-2) 38%, transparent);
}

.badge-item-unlocked {
    border-color: color-mix(in srgb, var(--success) 42%, var(--border));
    background: color-mix(in srgb, var(--success) 14%, transparent);
}

.badge-item-title {
    font-size: 0.98rem;
    font-weight: 800;
    line-height: 1.25;
}

.badge-item-meta {
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: var(--muted);
}

.badge-guide-toggle {
    border: 1px solid color-mix(in srgb, var(--primary) 35%, var(--border));
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--text);
    border-radius: 0.6rem;
    padding: 0.3rem 0.62rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
}

.badge-guide-toggle:hover {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
}

.badge-guide-box {
    margin-top: 0.55rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
    background: color-mix(in srgb, var(--surface-2) 34%, transparent);
    padding: 0.62rem 0.68rem;
}

.badge-guide-title {
    font-size: 0.78rem;
    font-weight: 800;
    margin: 0;
}

.badge-guide-list {
    margin: 0.4rem 0 0;
    padding-left: 1rem;
    display: grid;
    gap: 0.28rem;
    font-size: 0.76rem;
    color: var(--muted);
}

.badge-filter-chip {
    border: 1px solid transparent;
    border-radius: 0.6rem;
    padding: 0.34rem 0.7rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: color-mix(in srgb, var(--text) 74%, transparent);
    background: transparent;
    cursor: pointer;
}

.badge-filter-chip:hover {
    background: color-mix(in srgb, var(--surface-2) 62%, transparent);
    color: var(--text);
}

.badge-filter-chip-active {
    border-color: color-mix(in srgb, var(--primary) 42%, var(--border));
    background: color-mix(in srgb, var(--primary) 18%, transparent);
    color: var(--text);
}

.badge-filter-row {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
}

.badge-filter-summary {
    font-size: 0.8rem;
    color: var(--muted);
}

.ranking-section {
    position: relative;
}

.ranking-shell {
    background:
        radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--primary) 26%, transparent), transparent 38%),
        radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary-2) 22%, transparent), transparent 32%),
        radial-gradient(circle at 50% 120%, color-mix(in srgb, var(--warning) 14%, transparent), transparent 44%),
        linear-gradient(
            165deg,
            color-mix(in srgb, var(--surface-2) 40%, var(--surface)),
            color-mix(in srgb, var(--surface) 92%, var(--primary) 5%)
        );
    border-color: color-mix(in srgb, var(--primary) 32%, var(--border));
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 42%, transparent),
        inset 0 -1px 0 color-mix(in srgb, var(--warning) 14%, transparent),
        0 10px 32px color-mix(in srgb, var(--primary) 11%, transparent);
}

.ranking-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
    flex-wrap: wrap;
}

.ranking-search-input {
    width: min(100%, 20rem);
    border-color: color-mix(in srgb, var(--primary) 22%, var(--border));
    background: color-mix(in srgb, var(--surface-2) 40%, var(--surface));
}

@media (max-width: 767px) {
    .ranking-search-input {
        width: 100%;
    }
}

.ranking-podium {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 0.85rem;
}

@media (min-width: 768px) {
    .ranking-podium {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

.ranking-podium-item {
    border-radius: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border));
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--surface-2) 38%, var(--surface)),
        color-mix(in srgb, var(--surface) 91%, var(--primary) 5%)
    );
    padding: 0.82rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    box-shadow:
        0 1px 0 color-mix(in srgb, white 48%, transparent),
        0 5px 16px color-mix(in srgb, var(--primary) 8%, transparent);
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.ranking-podium-item:hover {
    border-color: color-mix(in srgb, var(--primary) 38%, var(--border));
    box-shadow:
        0 1px 0 color-mix(in srgb, white 52%, transparent),
        0 8px 22px color-mix(in srgb, var(--primary) 12%, transparent);
}

.ranking-podium-item-1 {
    border-color: color-mix(in srgb, var(--warning) 72%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--warning) 22%, var(--surface)),
        color-mix(in srgb, var(--surface-elevated) 82%, var(--warning) 10%)
    );
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 35%, transparent),
        0 0 0 1px color-mix(in srgb, var(--warning) 20%, transparent),
        0 8px 22px color-mix(in srgb, var(--warning) 16%, transparent);
}

.ranking-podium-item-2 {
    border-color: color-mix(in srgb, var(--primary) 62%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--primary) 22%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 86%, var(--primary) 8%)
    );
    box-shadow:
        0 1px 0 color-mix(in srgb, white 40%, transparent),
        0 6px 18px color-mix(in srgb, var(--primary) 12%, transparent);
}

.ranking-podium-item-3 {
    border-color: color-mix(in srgb, var(--primary-2) 58%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--primary-2) 20%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 86%, var(--primary-2) 9%)
    );
    box-shadow:
        0 1px 0 color-mix(in srgb, white 40%, transparent),
        0 6px 18px color-mix(in srgb, var(--primary-2) 11%, transparent);
}

.ranking-podium-item-1:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--warning) 80%, var(--border));
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 38%, transparent),
        0 0 0 1px color-mix(in srgb, var(--warning) 24%, transparent),
        0 10px 26px color-mix(in srgb, var(--warning) 20%, transparent);
}

.ranking-podium-item-2:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--primary) 72%, var(--border));
    box-shadow:
        0 1px 0 color-mix(in srgb, white 48%, transparent),
        0 9px 24px color-mix(in srgb, var(--primary) 16%, transparent);
}

.ranking-podium-item-3:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--primary-2) 68%, var(--border));
    box-shadow:
        0 1px 0 color-mix(in srgb, white 48%, transparent),
        0 9px 24px color-mix(in srgb, var(--primary-2) 15%, transparent);
}

.ranking-podium-rank-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    width: fit-content;
    border-radius: 999px;
    padding: 0.22rem 0.58rem;
    font-size: 0.8rem;
    color: var(--text);
    font-weight: 800;
    border: 1px solid color-mix(in srgb, var(--primary) 32%, var(--border));
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--surface) 75%, var(--primary) 8%),
        color-mix(in srgb, var(--surface-2) 55%, var(--surface))
    );
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 40%, transparent);
}

.ranking-podium-icon {
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.ranking-podium-icon-1 {
    color: color-mix(in srgb, var(--warning) 80%, white);
}

.ranking-podium-icon-2 {
    color: color-mix(in srgb, var(--info) 72%, white);
}

.ranking-podium-icon-3 {
    color: color-mix(in srgb, var(--primary-2) 72%, white);
}

.ranking-podium-name {
    font-size: 1.05rem;
}

.ranking-podium-meta {
    display: inline-flex;
    gap: 0.65rem;
    font-size: 0.84rem;
    color: var(--muted);
}

.ranking-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.6rem;
    border-color: color-mix(in srgb, var(--primary) 16%, var(--border));
    background: color-mix(in srgb, var(--surface-2) 30%, transparent);
}

.ranking-list-item-top {
    border-color: color-mix(in srgb, var(--warning) 58%, var(--border));
    background: linear-gradient(90deg, color-mix(in srgb, var(--warning) 11%, var(--surface-2)), color-mix(in srgb, var(--surface-2) 86%, transparent));
}

.ranking-position {
    min-width: 2.2rem;
    font-weight: 700;
    color: var(--text-soft);
    border-radius: 0.45rem;
    padding: 0.14rem 0.48rem;
    text-align: center;
    border: 1px solid color-mix(in srgb, var(--primary) 24%, var(--border));
    background: color-mix(in srgb, var(--surface) 55%, transparent);
}

.ranking-position-top {
    border-color: color-mix(in srgb, var(--warning) 60%, var(--border));
    color: color-mix(in srgb, var(--warning) 80%, white);
}

.ranking-inline-trophy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: color-mix(in srgb, var(--warning) 76%, white);
}
</style>
