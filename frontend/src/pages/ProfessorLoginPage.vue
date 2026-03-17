<template>
    <div>
        <PublicHeader />
        <main class="container" style="max-width:520px; padding-top:48px;">
            <form class="card" style="padding:24px; display:grid; gap:16px;" @submit.prevent="handleLogin">
                
                <div><h1><span>Área do professor</span></h1></div>

                <label>
                    Usuário
                    <input v-model="form.username" required />
                </label>

                <label>
                    Senha
                    <input type="password" v-model="form.password" required />
                </label>

                <button class="button">Entrar</button>

                <div v-if="error" style="color:var(--danger);">
                    {{ error }}
                </div>

            </form>
        </main>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicHeader from '../components/PublicHeader.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const error = ref('')

const form = reactive({
    username: '',
    password: ''
})

async function handleLogin() {
    error.value = ''

    try {
        await auth.login(form)
        router.push('/professor/dashboard')
    } catch (e) {
        error.value = e?.response?.data?.message || 'Não foi possível autenticar.'
    }
}
</script>