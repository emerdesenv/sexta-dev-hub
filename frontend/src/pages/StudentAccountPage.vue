<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10 pb-12">
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

            <section class="mt-6 grid gap-6 lg:grid-cols-2">
                <div class="sd-card sd-card-section p-6">
                    <h2 class="sd-section-title">Histórico de eventos</h2>
                    <div class="space-y-2 mt-4" v-if="history.events.length">
                        <div
                            v-for="event in history.events"
                            :key="event.id"
                            class="sd-list-item p-3"
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

                <div class="sd-card sd-card-section p-6">
                    <h2 class="sd-section-title">Episódios concluídos</h2>
                    <div class="space-y-2 mt-4" v-if="history.completedEpisodes.length">
                        <router-link
                            v-for="episode in history.completedEpisodes"
                            :key="`${episode.episodeId}-${episode.completedAt}`"
                            :to="`/episodio/${episode.slug}`"
                            class="sd-list-item block p-3"
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
import { onMounted, reactive, ref } from 'vue';
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
