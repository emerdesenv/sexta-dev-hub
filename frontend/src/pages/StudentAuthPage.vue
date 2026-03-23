<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <main class="sd-container pt-6 pb-10">
            <div class="max-w-md mx-auto sd-card p-6 md:p-8">
                <h1 class="text-2xl md:text-3xl font-extrabold">Área do aluno</h1>
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

                <form class="mt-5 flex flex-col gap-4" @submit.prevent="handleSubmit">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Usuário</span>
                        <input class="sd-input" v-model="form.username" required />
                    </label>

                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Senha</span>
                        <input class="sd-input" type="password" v-model="form.password" required />
                    </label>

                    <label v-if="tab === 'register'" class="flex flex-col gap-2">
                        <span class="sd-label">Confirmar senha</span>
                        <input class="sd-input" type="password" v-model="form.confirmPassword" required />
                    </label>

                    <p v-if="tab === 'register'" class="text-xs text-muted">
                        Use ao menos 8 caracteres com letras e números.
                    </p>

                    <button class="sd-button sd-button-primary justify-center" type="submit" :disabled="loading">
                        {{ loading ? 'Processando...' : tab === 'login' ? 'Entrar' : 'Criar conta' }}
                    </button>
                </form>

                <div v-if="notice" class="sd-notice mt-4">{{ notice }}</div>
                <div v-if="error" class="sd-error mt-4">{{ error }}</div>
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import Footer from '../components/layout/Footer.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const tab = ref('login');
const loading = ref(false);
const notice = ref('');
const error = ref('');
const form = reactive({
    username: '',
    password: '',
    confirmPassword: ''
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
            await api.post('/auth/register-student', form);
            notice.value = 'Conta criada com sucesso. Faça login para continuar.';
            tab.value = 'login';
            form.password = '';
            form.confirmPassword = '';
            return;
        }

        await auth.login(form);
        if (auth.user?.role === 'professor') {
            router.push('/professor/dashboard');
            return;
        }
        router.push('/gamificacao');
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível concluir a operação.';
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
    border: 1px solid rgba(47, 61, 102, 0.75);
    border-radius: 0.95rem;
    padding: 0.35rem;
    background: linear-gradient(180deg, rgba(26, 36, 64, 0.5), rgba(11, 19, 38, 0.5));
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
    background: rgba(26, 36, 64, 0.58);
}

.sd-auth-tab-button:focus-visible {
    outline: none;
    border-color: rgba(37, 99, 235, 0.65);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}

.sd-auth-tab-button.is-active {
    color: #fff;
    border-color: rgba(37, 99, 235, 0.72);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(6, 182, 212, 0.9));
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.32);
}
</style>
