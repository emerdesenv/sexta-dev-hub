<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10 pb-12">
            <section class="sd-card p-6 md:p-7">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <Badge tone="primary">Gamificacao</Badge>
                        <Badge v-if="isShowcase" tone="pdf" class="ml-2">Modo vitrine</Badge>
                        <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Sua jornada de evolução</h1>
                        <p class="mt-3 text-muted max-w-3xl">
                            Complete episódios, cumpra missões e acumule XP para subir de nível.
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

                <div class="mt-6 grid gap-4 sm:grid-cols-3">
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <div class="text-muted text-sm">Nivel atual</div>
                        <strong class="text-3xl font-extrabold">{{ data.profile.level }}</strong>
                        <div class="text-muted text-sm mt-1">{{ data.profile.xpTotal }} XP total</div>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <div class="text-muted text-sm">Streak</div>
                        <strong class="text-3xl font-extrabold">{{ data.profile.streakDays }} dias</strong>
                        <div class="text-muted text-sm mt-1">Consistencia ativa</div>
                        <div class="text-xs mt-2" :class="data.profile.streakShieldCount > 0 ? 'text-cyan-300' : 'text-muted'">
                            Escudo de streak: {{ data.profile.streakShieldCount || 0 }}
                        </div>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <div class="text-muted text-sm">Moedas</div>
                        <strong class="text-3xl font-extrabold">{{ data.profile.coins }}</strong>
                        <div class="text-muted text-sm mt-1">Para trocar por recompensas</div>
                    </div>
                </div>

                <div class="mt-5">
                    <div class="text-sm text-muted">Progresso do nível</div>
                    <div class="h-2 rounded-full bg-surface-2/70 mt-2 overflow-hidden">
                        <div class="h-full bg-blue-500" :style="{ width: levelPercent + '%' }"></div>
                    </div>
                    <div class="text-xs text-muted mt-2">
                        {{ data.profile.xpCurrentLevel }} / {{ data.profile.xpNextLevel }} XP para o próximo nível
                    </div>
                    <div
                        v-if="(data.profile.streakShieldCount || 0) > 0"
                        class="text-xs text-cyan-300 mt-1"
                    >
                        Você possui proteção ativa para manter sua sequência.
                    </div>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="text-2xl font-bold">Missoes</h2>
                <div v-if="notice" class="sd-notice mt-3">{{ notice }}</div>
                <div v-if="errorMessage" class="sd-error mt-3">{{ errorMessage }}</div>
                <div class="mt-4 grid gap-4 md:grid-cols-3">
                    <article
                        v-for="mission in data.missions"
                        :key="mission.key"
                        class="sd-card p-5"
                    >
                        <h3 class="font-bold text-lg">{{ mission.title }}</h3>
                        <div class="text-muted text-sm mt-2">Progresso {{ mission.progress }}/{{ mission.target }}</div>
                        <div class="h-2 rounded-full bg-surface-2/70 mt-2 overflow-hidden">
                            <div
                                class="h-full bg-cyan-500"
                                :style="{ width: missionPercent(mission) + '%' }"
                            ></div>
                        </div>
                        <div class="text-sm mt-3 text-muted">
                            Recompensa: +{{ mission.rewardXp }} XP • +{{ mission.rewardCoins }} moedas
                        </div>
                        <div class="mt-3">
                            <Badge :tone="mission.status === 'completed' ? 'audio' : 'neutral'">
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
                <h2 class="text-2xl font-bold">Conquistas</h2>
                <div class="mt-4 grid gap-4 md:grid-cols-3">
                    <article
                        v-for="badge in data.badges"
                        :key="badge.key"
                        class="sd-card p-5"
                    >
                        <h3 class="font-bold">{{ badge.title }}</h3>
                        <p class="text-sm text-muted mt-2" v-if="badge.target">
                            {{ badge.progress || 0 }}/{{ badge.target }}
                        </p>
                        <p class="text-sm mt-2" :class="badge.unlocked ? 'text-emerald-300' : 'text-muted'">
                            {{ badge.unlocked ? 'Desbloqueada' : 'Bloqueada' }}
                        </p>
                    </article>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="text-2xl font-bold">Ranking</h2>
                <div class="sd-card mt-4 p-4">
                    <div class="space-y-2">
                        <div
                            v-for="(player, index) in leaderboard"
                            :key="`${player.username}-${index}`"
                            class="flex justify-between items-center rounded-lg border border-border/50 p-3 bg-surface/30"
                        >
                            <span class="inline-flex items-center gap-2">
                                <span>#{{ index + 1 }} • {{ player.username }}</span>
                                <Badge v-if="player.profileProEnabled" tone="pro">PRO</Badge>
                            </span>
                            <span class="text-sm text-muted">N{{ player.level }} • {{ player.xpTotal }} XP</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mt-8">
                <h2 class="text-2xl font-bold">Recompensas</h2>
                <div class="mt-4 grid gap-4 md:grid-cols-4">
                    <article
                        v-for="reward in data.rewards"
                        :key="reward.key"
                        class="sd-card p-4"
                    >
                        <h3 class="font-bold">{{ reward.title }}</h3>
                        <p class="text-sm text-muted mt-1">{{ reward.costCoins }} moedas</p>
                        <p class="text-xs text-muted mt-2">Categoria: {{ reward.category }}</p>
                        <p class="text-sm mt-3">{{ rewardHelpText(reward.key).whatItDoes }}</p>
                        <p class="text-xs text-muted mt-1">Quando usar: {{ rewardHelpText(reward.key).whenToUse }}</p>
                        <p v-if="reward.owned" class="text-xs text-emerald-300 mt-2">Resgatada</p>
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
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
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
    rewards: []
});
const leaderboard = ref([]);
const loadingAction = ref(false);
const notice = ref('');
const errorMessage = ref('');
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
    const [{ data: snapshot }, { data: ranking }] = await Promise.all([
        api.get(endpoint),
        api.get('/gamification/leaderboard')
    ]);

    data.value = {
        profile: snapshot.profile,
        missions: snapshot.missions || [],
        badges: snapshot.badges || [],
        rewards: snapshot.rewards || []
    };
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
