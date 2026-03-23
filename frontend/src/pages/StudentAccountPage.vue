<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10 pb-12">
            <section class="sd-card p-6 md:p-7">
                <Badge tone="primary">Minha conta</Badge>
                <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Perfil do aluno</h1>
                <p class="mt-2 text-muted">Acompanhe seu histórico e mantenha seus dados seguros.</p>

                <div class="mt-5 grid gap-4 md:grid-cols-3">
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <div class="text-muted text-sm">Usuário</div>
                        <div class="inline-flex items-center gap-2">
                            <strong class="text-xl font-bold">{{ profile.username || '-' }}</strong>
                            <Badge v-if="profileStats.profileProEnabled" tone="pro">PRO</Badge>
                        </div>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
                        <div class="text-muted text-sm">Nível</div>
                        <strong class="text-xl font-bold">N{{ profileStats.level || 1 }}</strong>
                    </div>
                    <div class="rounded-xl border border-border/60 bg-surface/40 p-4">
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

            <section class="sd-card p-6 md:p-7 mt-6">
                <h2 class="text-2xl font-bold">Alterar senha</h2>
                <div v-if="notice" class="sd-notice mt-3">{{ notice }}</div>
                <div v-if="error" class="sd-error mt-3">{{ error }}</div>
                <form class="mt-4 grid gap-4 max-w-lg" @submit.prevent="updatePassword">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Senha atual</span>
                        <input class="sd-input" type="password" v-model="passwordForm.currentPassword" required />
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Nova senha</span>
                        <input class="sd-input" type="password" v-model="passwordForm.newPassword" required />
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Confirmar nova senha</span>
                        <input class="sd-input" type="password" v-model="passwordForm.confirmPassword" required />
                    </label>
                    <p class="text-xs text-muted">Use ao menos 8 caracteres com letras e números.</p>
                    <button class="sd-button sd-button-primary w-fit" type="submit" :disabled="loadingPassword">
                        {{ loadingPassword ? 'Salvando...' : 'Salvar nova senha' }}
                    </button>
                </form>
            </section>

            <section class="mt-6 grid gap-6 lg:grid-cols-2">
                <div class="sd-card p-6">
                    <h2 class="text-2xl font-bold">Histórico de eventos</h2>
                    <div class="space-y-2 mt-4" v-if="history.events.length">
                        <div
                            v-for="event in history.events"
                            :key="event.id"
                            class="rounded-lg border border-border/50 bg-surface/30 p-3"
                        >
                            <div class="font-semibold text-sm">{{ event.type }}</div>
                            <div class="text-xs text-muted mt-1">
                                XP {{ event.xpDelta >= 0 ? '+' : '' }}{{ event.xpDelta }} •
                                Moedas {{ event.coinsDelta >= 0 ? '+' : '' }}{{ event.coinsDelta }}
                            </div>
                        </div>
                    </div>
                    <div v-else class="sd-notice mt-4">Sem eventos registrados ainda.</div>
                </div>

                <div class="sd-card p-6">
                    <h2 class="text-2xl font-bold">Episódios concluídos</h2>
                    <div class="space-y-2 mt-4" v-if="history.completedEpisodes.length">
                        <router-link
                            v-for="episode in history.completedEpisodes"
                            :key="`${episode.episodeId}-${episode.completedAt}`"
                            :to="`/episodio/${episode.slug}`"
                            class="block rounded-lg border border-border/50 bg-surface/30 p-3 hover:bg-surface-2/40"
                        >
                            <div class="font-semibold text-sm">{{ episode.title }}</div>
                            <div class="text-xs text-muted mt-1">
                                Concluído em {{ formatDate(episode.completedAt) }}
                            </div>
                        </router-link>
                    </div>
                    <div v-else class="sd-notice mt-4">Nenhum episódio concluído ainda.</div>
                </div>
            </section>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';
import api from '../services/api';

const profile = ref({ username: '' });
const profileStats = ref({ level: 1, xpTotal: 0 });
const history = ref({ events: [], completedEpisodes: [] });
const loadingPassword = ref(false);
const notice = ref('');
const error = ref('');

const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

function formatDate(dateValue) {
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}

async function loadData() {
    const [{ data: me }, { data: snapshot }, { data: historyData }] = await Promise.all([
        api.get('/auth/me'),
        api.get('/gamification/me'),
        api.get('/gamification/history/me')
    ]);

    profile.value = me;
    profileStats.value = snapshot.profile;
    history.value = historyData;
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
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível atualizar a senha.';
    } finally {
        loadingPassword.value = false;
    }
}

onMounted(loadData);
</script>
