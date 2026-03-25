<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <main class="sd-container pt-6 pb-10">
            <div class="max-w-md mx-auto">
                <form class="sd-card p-6 md:p-8 flex flex-col gap-5" @submit.prevent="handleLogin">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-extrabold">
                            Área do professor
                        </h1>
                        <p class="mt-2 text-muted leading-relaxed">
                            Acesse para gerenciar episódios e manter a área pública atualizada.
                        </p>
                    </div>

                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Usuário</span>
                        <input class="sd-input" v-model="form.username" required />
                    </label>

                    <PasswordInput
                        v-model="form.password"
                        label="Senha"
                        required
                        autocomplete="current-password"
                    />

                    <div class="pt-2">
                        <Button
                            variant="primary"
                            type="submit"
                            :disabled="loading"
                            class="w-full justify-center"
                        >
                            {{ loading ? 'Entrando...' : 'Entrar' }}
                        </Button>
                    </div>

                    <div
                        v-if="error"
                        class="text-danger text-sm font-semibold leading-relaxed break-words"
                        role="alert"
                    >
                        {{ error }}
                    </div>
                </form>
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import { useAuthStore } from '../stores/auth';
import Button from '../components/ui/Button.vue';
import PasswordInput from '../components/ui/PasswordInput.vue';
import Footer from '../components/layout/Footer.vue';

const router = useRouter();
const auth = useAuthStore();

const error = ref('');
const loading = ref(false);

const form = reactive({
    username: '',
    password: ''
});

async function handleLogin() {
    error.value = ''
    loading.value = true

    try {
        await auth.login(form)
        router.push('/professor/dashboard')
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível autenticar.'
    } finally {
        loading.value = false
    }
}
</script>