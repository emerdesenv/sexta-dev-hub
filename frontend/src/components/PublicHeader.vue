<template>
    <header class="sticky top-0 z-50 backdrop-blur bg-bg/70 border-b border-border/40">
        <div class="sd-container py-4 flex items-center justify-between gap-4">
            <router-link to="/" class="text-lg font-extrabold tracking-tight">
                Sexta <span class="text-primary-2">Dev</span> Hub
            </router-link>

            <nav class="hidden md:flex items-center gap-3">
                <router-link
                    v-if="auth.isAuthenticated"
                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                    to="/professor/dashboard"
                >
                    Dashboard
                </router-link>

                <button
                    v-if="auth.isAuthenticated"
                    class="sd-button sd-button-danger px-3 py-2 text-sm"
                    type="button"
                    @click="handleLogout"
                >
                    Sair
                </button>
            </nav>

            <nav class="md:hidden flex items-center gap-2">
                <router-link
                    v-if="auth.isAuthenticated"
                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                    to="/professor/dashboard"
                >
                    Dashboard
                </router-link>
                <button
                    v-if="auth.isAuthenticated"
                    class="sd-button sd-button-danger px-3 py-2 text-sm"
                    type="button"
                    @click="handleLogout"
                >
                    Sair
                </button>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
    auth.logout();
    router.push('/');
}
</script>
