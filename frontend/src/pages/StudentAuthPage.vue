<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <main class="sd-container sd-page-body">
            <div class="max-w-md mx-auto sd-card p-6 md:p-8">
                <div class="flex items-start justify-between gap-3">
                    <h1 class="text-2xl md:text-3xl font-extrabold">Área do aluno</h1>
                    <button
                        class="sd-button sd-button-secondary !py-1 !px-2 !text-xs"
                        type="button"
                        title="Regras e segurança"
                        aria-label="Abrir regras e segurança"
                        @click="policyModalOpen = true"
                    >
                        Regras
                    </button>
                </div>
                <p class="mt-2 text-muted leading-relaxed">
                    Entre para registrar progresso, resgatar missões e acumular recompensas.
                </p>

                <div class="mt-6 sd-auth-tabs" role="tablist" aria-label="Alternar entre entrar e criar conta">
                    <button
                        type="button"
                        role="tab"
                        :aria-selected="tab === 'login'"
                        class="sd-auth-tab-button"
                        :class="{ 'is-active': tab === 'login' }"
                        @click="tab = 'login'"
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        role="tab"
                        :aria-selected="tab === 'register'"
                        class="sd-auth-tab-button"
                        :class="{ 'is-active': tab === 'register' }"
                        @click="tab = 'register'"
                    >
                        Criar conta
                    </button>
                </div>

                <div
                    v-if="registerSuccess"
                    class="register-success-panel mt-5"
                    role="status"
                    aria-live="polite"
                >
                    <div class="register-success-panel__icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8">
                            <path
                                fill-rule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h2 class="text-lg font-extrabold leading-snug">
                            {{ registerSuccess.mode === 'pending' ? 'Cadastro recebido' : 'Conta criada com sucesso' }}
                        </h2>
                        <p class="mt-2 text-sm text-muted leading-relaxed">
                            {{ registerSuccess.message }}
                        </p>
                        <p v-if="registerSuccess.username" class="mt-2 text-sm font-semibold text-[color-mix(in_srgb,var(--text)_88%,transparent)]">
                            Usuário: <span class="font-mono tracking-tight">{{ registerSuccess.username }}</span>
                        </p>
                        <p
                            v-if="registerSuccess.mode === 'active'"
                            class="mt-3 text-sm text-muted leading-relaxed"
                        >
                            Você já pode entrar com seu usuário e senha na aba <strong>Entrar</strong>.
                        </p>
                    </div>
                </div>

                <form class="mt-5 flex flex-col gap-4" @submit.prevent="handleSubmit">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Usuário</span>
                        <input class="sd-input" v-model="form.username" placeholder="ex.: aluno.teste" required />
                    </label>

                    <PasswordInput
                        v-model="form.password"
                        label="Senha"
                        required
                        :autocomplete="tab === 'login' ? 'current-password' : 'new-password'"
                    />

                    <PasswordInput
                        v-if="tab === 'register'"
                        v-model="form.confirmPassword"
                        label="Confirmar senha"
                        required
                        autocomplete="new-password"
                    />

                    <label v-if="tab === 'register'" class="flex flex-col gap-2">
                        <span class="sd-label">Código de convite (se aplicável)</span>
                        <input class="sd-input" v-model="form.inviteCode" />
                    </label>

                    <p v-if="tab === 'register'" class="text-xs text-muted">
                        Use ao menos 8 caracteres com letras e números.
                        <br />Usuário deve seguir o formato nome.sobrenome (ex.: aluno.teste).
                    </p>
                    
                    <button class="sd-button sd-button-primary justify-center" type="submit" :disabled="loading">
                        {{ loading ? 'Processando...' : tab === 'login' ? 'Entrar' : 'Criar conta' }}
                    </button>
                </form>

                <div v-if="notice" class="sd-notice mt-4">{{ notice }}</div>
                <div v-if="error" class="sd-error mt-4">{{ error }}</div>
            </div>
        </main>
        <BaseModal
            v-model="policyModalOpen"
            title="Regras e segurança da comunidade"
            aria-label="Regras e segurança"
            max-width="2xl"
        >
            <div class="mt-2 space-y-3 text-sm text-muted">
                <p>Este e um ambiente educacional. O objetivo e manter uma comunidade segura e respeitosa.</p>
                <ul class="list-disc pl-5 space-y-1">
                    <li>Conteudos ofensivos, discurso de odio, assedio e incentivo a autoagressao sao bloqueados.</li>
                    <li>O cadastro pode exigir codigo de convite e aprovacao de professor.</li>
                    <li>Mensagens denunciadas podem ser moderadas pela equipe docente.</li>
                </ul>
            </div>
        </BaseModal>
        <Footer />
    </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import Footer from '../components/layout/Footer.vue';
import PasswordInput from '../components/ui/PasswordInput.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const tab = ref('login');
const loading = ref(false);
const notice = ref('');
const error = ref('');
const registerSuccess = ref(null);
const policyModalOpen = ref(false);
const form = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
});

watch(tab, (next) => {
    if (next === 'register') {
        registerSuccess.value = null;
    }
});

async function handleSubmit() {
    loading.value = true;
    notice.value = '';
    error.value = '';
    try {
        if (tab.value === 'register') {
            if (form.password !== form.confirmPassword) {
                error.value = 'Senha e confirmação de senha devem ser iguais.';
                return;
            }
            const { data } = await api.post('/auth/register-student', form);
            const usernameSaved = String(form.username || '').trim().toLowerCase();
            const pending = Boolean(data?.requiresApproval);
            registerSuccess.value = {
                mode: pending ? 'pending' : 'active',
                message:
                    data?.message
                    || (pending
                        ? 'Seu cadastro foi registrado. Aguarde a liberação do professor.'
                        : 'Sua conta está pronta para uso.'),
                username: usernameSaved
            };
            tab.value = 'login';
            form.username = usernameSaved;
            form.password = '';
            form.confirmPassword = '';
            form.inviteCode = '';
            notice.value = '';
            return;
        }

        await auth.login(form);
        if (auth.user?.role === 'professor') {
            router.push('/professor/dashboard');
            return;
        }
        router.push('/gamificacao');
    } catch (e) {
        const apiData = e?.response?.data || {};
        error.value = apiData?.message
            || apiData?.errors?.[0]?.message
            || 'Não foi possível concluir a operação.';
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.sd-auth-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    width: 100%;
    border: 1px solid color-mix(in srgb, var(--border) 92%, transparent);
    border-radius: 0.95rem;
    padding: 0.35rem;
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--surface-2) 68%, var(--surface)),
        color-mix(in srgb, var(--surface) 96%, transparent)
    );
}

.sd-auth-tab-button {
    border: 1px solid transparent;
    border-radius: 0.7rem;
    padding: 0.62rem 0.85rem;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: var(--muted);
    background: transparent;
    cursor: pointer;
    transition: all 160ms ease;
}

.sd-auth-tab-button:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--surface-2) 68%, transparent);
}

.sd-auth-tab-button:focus-visible {
    outline: none;
    border-color: color-mix(in srgb, var(--primary) 60%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 28%, transparent);
}

.sd-auth-tab-button.is-active {
    color: #ffffff;
    border-color: color-mix(in srgb, var(--primary) 62%, transparent);
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--primary) 95%, #0f172a),
        color-mix(in srgb, var(--primary-2) 90%, #1f2937)
    );
    box-shadow: 0 8px 18px color-mix(in srgb, var(--primary) 30%, transparent);
}

.register-success-panel {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1.15rem 1.25rem;
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--primary) 45%, var(--border));
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--primary) 14%, var(--surface-elevated)) 0%,
        color-mix(in srgb, var(--success) 10%, var(--surface-elevated)) 100%
    );
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.register-success-panel__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--success) 22%, transparent);
    color: color-mix(in srgb, var(--success) 72%, var(--text));
}
</style>
