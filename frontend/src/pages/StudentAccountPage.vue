<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer>
            <section class="sd-card sd-card-section p-6 md:p-7">
                <Badge tone="primary">Minha conta</Badge>
                <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Perfil do aluno</h1>
                <p class="mt-2 text-muted">Acompanhe seu histórico e mantenha seus dados seguros.</p>

                <div class="mt-5 grid gap-4 md:grid-cols-3">
                    <div class="sd-card-item p-4">
                        <div class="text-muted text-sm">Usuário</div>
                        <div class="inline-flex items-center gap-2">
                            <strong class="text-xl font-bold">{{ profile.username || '-' }}</strong>
                            <Badge v-if="profileStats.profileProEnabled" tone="pro">PRO</Badge>
                        </div>
                    </div>
                    <div class="sd-card-item p-4">
                        <div class="text-muted text-sm">Nível</div>
                        <strong class="text-xl font-bold">N{{ profileStats.level || 1 }}</strong>
                    </div>
                    <div class="sd-card-item p-4">
                        <div class="text-muted text-sm">XP total</div>
                        <strong class="text-xl font-bold">{{ profileStats.xpTotal || 0 }}</strong>
                    </div>
                </div>
                <div class="mt-4 text-sm text-muted">
                    Tema: <b>{{ profileStats.activeTheme || 'default' }}</b> •
                    Selo Pro: <b>{{ profileStats.profileProEnabled ? 'ativo' : 'inativo' }}</b> •
                    Escudo de streak: <b>{{ profileStats.streakShieldCount || 0 }}</b> •
                    Acesso antecipado: <b>{{ profileStats.earlyAccessEnabled ? 'ativo' : 'inativo' }}</b>
                </div>
            </section>

            <section class="sd-card sd-card-section p-6 md:p-7 mt-6">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 class="sd-section-title">Alterar senha</h2>
                    <button class="sd-button sd-button-primary" type="button" @click="openPasswordModal">
                        Alterar senha
                    </button>
                </div>
                <div v-if="notice" class="sd-notice mt-3">{{ notice }}</div>
                <div v-if="error" class="sd-error mt-3">{{ error }}</div>
                <p class="mt-3 text-sm text-muted">
                    Abra o modal para atualizar sua senha com segurança.
                </p>
            </section>

            <section class="sd-card sd-card-section p-6 md:p-7 mt-6">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 class="sd-section-title">Zona de risco</h2>
                    <button class="sd-button sd-button-danger" type="button" @click="openDeleteModal">
                        Excluir conta
                    </button>
                </div>
                <p class="mt-3 text-sm text-muted">
                    Ao excluir a conta, seu progresso ficará indisponível imediatamente e será removido permanentemente após o prazo de retenção.
                </p>
                <div v-if="deleteError" class="sd-error mt-3">{{ deleteError }}</div>
            </section>

            <section class="sd-card sd-card-section p-6 md:p-7 mt-6">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 class="sd-section-title">Conquistas detalhadas</h2>
                    <div class="inline-flex rounded-xl border border-border/60 bg-surface/40 p-1 gap-1">
                        <button
                            v-for="option in badgeFilterOptions"
                            :key="option.value"
                            type="button"
                            class="account-filter-chip"
                            :class="{ 'account-filter-chip-active': badgeFilter === option.value }"
                            @click="badgeFilter = option.value"
                        >
                            {{ option.label }}
                        </button>
                    </div>
                </div>
                <p class="mt-2 text-sm text-muted">
                    Mostrando <strong>{{ visibleBadgeCount }}</strong> de <strong>{{ totalBadgeCount }}</strong> conquistas.
                </p>
                <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <article
                        v-for="group in badgeGroups"
                        :key="group.key"
                        class="sd-card sd-card-section p-5"
                    >
                        <div class="flex items-center justify-between gap-3">
                            <h3 class="sd-card-title">{{ group.title }}</h3>
                            <span class="text-xs font-bold text-muted">{{ group.unlockedCount }}/{{ group.totalCount }}</span>
                        </div>
                        <div class="sd-progress mt-3">
                            <div
                                class="sd-progress-fill sd-progress-fill-mission"
                                :style="{ width: `${group.progressPercent}%` }"
                            ></div>
                        </div>
                        <div class="mt-4 space-y-2">
                            <article
                                v-for="badge in group.badges"
                                :key="badge.key"
                                class="sd-list-item p-3"
                            >
                                <div class="flex flex-wrap items-center gap-2">
                                    <strong class="text-sm">{{ badge.title }}</strong>
                                    <Badge v-if="badgeTierLabel(badge)" tone="neutral" class="!text-xs !py-0.5">
                                        {{ badgeTierLabel(badge) }}
                                    </Badge>
                                </div>
                                <p v-if="badge.target" class="text-xs text-muted mt-1">
                                    {{ badge.progress || 0 }}/{{ badge.target }}
                                </p>
                                <p class="text-xs mt-1" :class="badge.unlocked ? 'text-success' : 'text-muted'">
                                    {{ badgeStatusText(badge) }}
                                </p>
                            </article>
                        </div>
                    </article>
                </div>
            </section>

            <section class="sd-card sd-card-section p-6 md:p-7 mt-6">
                <h2 class="sd-section-title">Desempenho em atividades</h2>
                <div class="mt-4 grid gap-4 md:grid-cols-4">
                    <article class="sd-card-item p-4 sd-stat-tile">
                        <div class="text-muted text-sm">Média de nota</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.averageScore }}%</strong>
                    </article>
                    <article class="sd-card-item p-4 sd-stat-tile">
                        <div class="text-muted text-sm">Taxa de aprovação</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.passRate }}%</strong>
                    </article>
                    <article class="sd-card-item p-4 sd-stat-tile">
                        <div class="text-muted text-sm">Tentativas totais</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.totalAttempts }}</strong>
                    </article>
                    <article class="sd-card-item p-4 sd-stat-tile">
                        <div class="text-muted text-sm">Atividades avaliativas</div>
                        <strong class="text-2xl font-extrabold">{{ assessmentStats.distinctActivities }}</strong>
                    </article>
                </div>
                <div class="mt-4">
                    <h3 class="sd-card-title">Últimas tentativas</h3>
                    <div v-if="assessmentAttempts.length" class="space-y-2 mt-3">
                        <router-link
                            v-for="attempt in assessmentAttempts.slice(0, 10)"
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
            </section>

            <section class="sd-card sd-card-section p-6 md:p-7 mt-6">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 class="sd-section-title">Ranking completo</h2>
                    <input
                        v-model.trim="rankingSearch"
                        type="search"
                        class="sd-input account-ranking-search"
                        placeholder="Buscar participante"
                        aria-label="Buscar participante no ranking"
                    >
                </div>
                <div class="space-y-2 mt-4">
                    <div
                        v-for="player in rankedRows"
                        :key="`${player.username}-${player.rank}`"
                        class="sd-list-item flex justify-between items-center p-3"
                    >
                        <span class="inline-flex items-center gap-2 min-w-0">
                            <span class="text-xs text-muted">#{{ player.rank }}</span>
                            <span class="truncate">{{ player.username }}</span>
                            <Badge v-if="player.profileProEnabled" tone="pro">PRO</Badge>
                        </span>
                        <span class="text-sm text-muted">N{{ player.level }} • {{ player.xpTotal }} XP</span>
                    </div>
                </div>
                <div v-if="!rankedRows.length" class="sd-notice mt-3">
                    Nenhum participante encontrado para esse filtro.
                </div>
            </section>

            <section class="sd-card sd-card-section p-6 mt-6">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h2 class="sd-section-title">Histórico</h2>
                    <div class="inline-flex rounded-xl border border-border/60 bg-surface/40 p-1 gap-1">
                        <button
                            type="button"
                            class="account-filter-chip"
                            :class="{ 'account-filter-chip-active': historyTab === 'events' }"
                            @click="historyTab = 'events'"
                        >
                            Eventos ({{ history.events.length }})
                        </button>
                        <button
                            type="button"
                            class="account-filter-chip"
                            :class="{ 'account-filter-chip-active': historyTab === 'episodes' }"
                            @click="historyTab = 'episodes'"
                        >
                            Episódios ({{ history.completedEpisodes.length }})
                        </button>
                    </div>
                </div>

                <div v-if="historyTab === 'events'" class="mt-4">
                    <div v-if="history.events.length" class="history-scroll-shell">
                        <div class="space-y-2">
                            <div
                                v-for="event in history.events"
                                :key="event.id"
                                class="sd-list-item p-3 history-item"
                            >
                                <div class="font-semibold text-sm">{{ event.type }}</div>
                                <div class="text-xs text-muted mt-1">
                                    XP {{ event.xpDelta >= 0 ? '+' : '' }}{{ event.xpDelta }} •
                                    Moedas {{ event.coinsDelta >= 0 ? '+' : '' }}{{ event.coinsDelta }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="sd-notice mt-4">Sem eventos registrados ainda.</div>
                </div>

                <div v-else class="mt-4">
                    <div v-if="history.completedEpisodes.length" class="history-scroll-shell">
                        <div class="space-y-2">
                            <router-link
                                v-for="episode in history.completedEpisodes"
                                :key="`${episode.episodeId}-${episode.completedAt}`"
                                :to="`/episodio/${episode.slug}`"
                                class="sd-list-item block p-3 history-item"
                            >
                                <div class="font-semibold text-sm">{{ episode.title }}</div>
                                <div class="text-xs text-muted mt-1">
                                    Concluído em {{ formatDate(episode.completedAt) }}
                                </div>
                            </router-link>
                        </div>
                    </div>
                    <div v-else class="sd-notice mt-4">Nenhum episódio concluído ainda.</div>
                </div>
            </section>
        </PageContainer>
        <BaseModal
            v-model="passwordModalOpen"
            title="Alterar senha"
            aria-label="Alterar senha"
            max-width="xl"
            :disable-close="loadingPassword"
            @close="closePasswordModal"
        >
            <form class="mt-4 grid gap-4" @submit.prevent="updatePassword">
                <PasswordInput
                    v-model="passwordForm.currentPassword"
                    label="Senha atual"
                    required
                    autocomplete="current-password"
                />
                <PasswordInput
                    v-model="passwordForm.newPassword"
                    label="Nova senha"
                    required
                    autocomplete="new-password"
                />
                <PasswordInput
                    v-model="passwordForm.confirmPassword"
                    label="Confirmar nova senha"
                    required
                    autocomplete="new-password"
                />
                <p class="text-xs text-muted">Use ao menos 8 caracteres com letras e números.</p>
                <div class="flex items-center justify-end gap-2">
                    <button class="sd-button sd-button-secondary" type="button" :disabled="loadingPassword" @click="closePasswordModal">
                        Cancelar
                    </button>
                    <button class="sd-button sd-button-primary" type="submit" :disabled="loadingPassword">
                        {{ loadingPassword ? 'Salvando...' : 'Salvar senha' }}
                    </button>
                </div>
            </form>
        </BaseModal>
        <BaseModal
            v-model="deleteModalOpen"
            title="Confirmar exclusão da conta"
            aria-label="Confirmar exclusão da conta"
            max-width="xl"
            :disable-close="loadingDelete"
            @close="closeDeleteModal"
        >
            <div class="mt-3 space-y-3">
                <p class="text-sm text-muted">
                    Ao confirmar, sua conta será desativada agora e seu progresso será removido permanentemente após o prazo de retenção:
                </p>
                <ul class="list-disc pl-5 text-sm text-muted space-y-1">
                    <li>nível, XP e moedas acumuladas;</li>
                    <li>histórico de eventos e episódios concluídos;</li>
                    <li>colecionáveis e demais progressos da plataforma.</li>
                </ul>
                <label class="flex items-center gap-2 text-sm text-muted">
                    <input v-model="deleteConfirmation" type="checkbox" :disabled="loadingDelete" />
                    Eu entendo que perderei todo o meu progresso.
                </label>
                <div class="flex items-center justify-end gap-2 pt-2">
                    <button class="sd-button sd-button-secondary" type="button" :disabled="loadingDelete" @click="closeDeleteModal">
                        Cancelar
                    </button>
                    <button class="sd-button sd-button-danger" type="button" :disabled="loadingDelete || !deleteConfirmation" @click="deleteAccount">
                        {{ loadingDelete ? 'Excluindo...' : 'Excluir minha conta' }}
                    </button>
                </div>
            </div>
        </BaseModal>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';
import PasswordInput from '../components/ui/PasswordInput.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const profile = ref({ username: '' });
const profileStats = ref({ level: 1, xpTotal: 0 });
const history = ref({ events: [], completedEpisodes: [] });
const historyTab = ref('events');
const badges = ref([]);
const leaderboard = ref([]);
const assessmentAttempts = ref([]);
const rankingSearch = ref('');
const badgeFilter = ref('all');
const loadingPassword = ref(false);
const passwordModalOpen = ref(false);
const deleteModalOpen = ref(false);
const notice = ref('');
const error = ref('');
const deleteError = ref('');
const loadingDelete = ref(false);
const deleteConfirmation = ref(false);

const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const badgeFilterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'in_progress', label: 'Em progresso' },
    { value: 'unlocked', label: 'Conquistadas' }
];

const TIER_LABELS = {
    platinum: 'Platina',
    gold: 'Ouro',
    silver: 'Prata',
    bronze: 'Bronze'
};

const filteredLeaderboard = computed(() => {
    const term = rankingSearch.value.trim().toLowerCase();
    if (!term) return leaderboard.value;
    return leaderboard.value.filter((player) =>
        String(player?.username || '').toLowerCase().includes(term)
    );
});

const rankedRows = computed(() =>
    filteredLeaderboard.value.map((player, index) => ({
        ...player,
        rank: index + 1
    }))
);

const badgeGroups = computed(() => {
    const groups = [
        { key: 'study', title: 'Estudos', badges: [] },
        { key: 'activity', title: 'Atividades', badges: [] },
        { key: 'community', title: 'Comunidade', badges: [] }
    ];

    (Array.isArray(badges.value) ? badges.value : []).forEach((badge) => {
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

    const matchesFilter = (badge) => {
        if (badgeFilter.value === 'unlocked') return Boolean(badge?.unlocked);
        if (badgeFilter.value === 'in_progress') return !badge?.unlocked;
        return true;
    };

    return groups.map((group) => {
        const totalCount = group.badges.length;
        const unlockedCount = group.badges.filter((badge) => Boolean(badge?.unlocked)).length;
        const progressPercent = totalCount ? Math.round((unlockedCount / totalCount) * 100) : 0;
        return {
            ...group,
            badges: group.badges.filter(matchesFilter),
            totalCount,
            unlockedCount,
            progressPercent
        };
    });
});

const totalBadgeCount = computed(() => (Array.isArray(badges.value) ? badges.value.length : 0));
const visibleBadgeCount = computed(() => badgeGroups.value.reduce((sum, group) => sum + group.badges.length, 0));

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

function formatDate(dateValue) {
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}

async function loadData() {
    const [{ data: me }, { data: snapshot }, { data: historyData }, { data: leaderboardData }] = await Promise.all([
        api.get('/auth/me'),
        api.get('/gamification/me'),
        api.get('/gamification/history/me'),
        api.get('/gamification/leaderboard')
    ]);

    profile.value = me;
    profileStats.value = snapshot.profile;
    history.value = historyData;
    badges.value = snapshot.badges || [];
    assessmentAttempts.value = Array.isArray(historyData?.assessmentAttempts) ? historyData.assessmentAttempts : [];
    leaderboard.value = Array.isArray(leaderboardData) ? leaderboardData : [];
}

function badgeTierLabel(badge) {
    const t = typeof badge?.tier === 'string' ? badge.tier.toLowerCase() : '';
    return TIER_LABELS[t] || '';
}

function badgeStatusText(badge) {
    if (badge?.unlocked) return 'Conquistada';
    const target = Number(badge?.target || 0);
    const progress = Number(badge?.progress || 0);
    if (target > 0) {
        const remaining = Math.max(target - progress, 0);
        return remaining <= 1 ? 'Falta 1 ação' : `Faltam ${remaining} ações`;
    }
    return 'Em progresso';
}

async function updatePassword() {
    loadingPassword.value = true;
    notice.value = '';
    error.value = '';
    try {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            error.value = 'Nova senha e confirmação devem ser iguais.';
            return;
        }
        const { data } = await api.patch('/auth/me/password', passwordForm);
        notice.value = data.message;
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        passwordModalOpen.value = false;
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível atualizar a senha.';
    } finally {
        loadingPassword.value = false;
    }
}

function openPasswordModal() {
    error.value = '';
    notice.value = '';
    passwordModalOpen.value = true;
}

function closePasswordModal() {
    if (loadingPassword.value) return;
    passwordModalOpen.value = false;
}

function openDeleteModal() {
    deleteError.value = '';
    deleteConfirmation.value = false;
    deleteModalOpen.value = true;
}

function closeDeleteModal() {
    if (loadingDelete.value) return;
    deleteModalOpen.value = false;
}

async function deleteAccount() {
    if (!deleteConfirmation.value) return;
    loadingDelete.value = true;
    deleteError.value = '';
    try {
        await api.delete('/auth/me');
        auth.logout();
        router.push('/aluno');
    } catch (e) {
        deleteError.value = e?.response?.data?.message || 'Não foi possível excluir sua conta.';
    } finally {
        loadingDelete.value = false;
    }
}

onMounted(loadData);
</script>

<style scoped>
.account-filter-chip {
    border: 1px solid transparent;
    border-radius: 0.6rem;
    padding: 0.32rem 0.68rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: color-mix(in srgb, var(--text) 74%, transparent);
    background: transparent;
    cursor: pointer;
}

.account-filter-chip-active {
    border-color: color-mix(in srgb, var(--primary) 42%, var(--border));
    background: color-mix(in srgb, var(--primary) 18%, transparent);
    color: var(--text);
}

.account-ranking-search {
    width: min(100%, 20rem);
}

.history-scroll-shell {
    max-height: 28rem;
    overflow: auto;
    padding-right: 0.2rem;
}

.history-item {
    border-color: color-mix(in srgb, var(--border) 90%, transparent);
    background: color-mix(in srgb, var(--surface-2) 28%, transparent);
}
</style>
