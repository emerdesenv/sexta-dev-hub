<template>
    <nav
        class="mobile-footer-nav"
        role="navigation"
        aria-label="Menu principal"
    >
        <a class="mf-item" href="/#episodios" :class="{ 'mf-item--active': isHome }">
            <span class="mf-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6">
                    <path d="M3 10.5 12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21V10.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M9.5 22.5V14h5v8.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                </svg>
            </span>
            <span class="mf-label">Conteúdos</span>
        </a>

        <router-link class="mf-item" to="/gamificacao" :class="{ 'mf-item--active': isGamification }">
            <span class="mf-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6">
                    <path d="M12 2l2.2 4.5L19 7l-3.5 3.1L16.2 14 12 11.9 7.8 14 8.5 10.1 5 7l4.8-.5L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M8 16h8v2H8v-2zm-1 4h10v2H7v-2z" fill="currentColor" opacity="0.9"/>
                </svg>
            </span>
            <span class="mf-label">Gamificação</span>
        </router-link>

        <router-link
            v-if="auth.isAuthenticated && auth.user?.role === 'student'"
            class="mf-item"
            to="/aluno/colecao"
            :class="{ 'mf-item--active': isCollection }"
        >
            <span class="mf-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6">
                    <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 7h20v5H2V7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 22V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C14.6 2 13 4 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C9.4 2 11 4 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span class="mf-label">Coleção</span>
        </router-link>

        <router-link
            v-else
            class="mf-item"
            to="/aluno"
            :class="{ 'mf-item--active': isStudentAuth }"
        >
            <span class="mf-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6">
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <span class="mf-label">{{ auth.isAuthenticated ? 'Conta' : 'Aluno' }}</span>
        </router-link>
    </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const auth = useAuthStore();

const isHome = computed(() => route.name === 'home');
const isGamification = computed(() => route.name === 'gamification');
const isCollection = computed(() => route.name === 'student-collection');
const isStudentAuth = computed(() => route.name === 'student-auth' || route.name === 'student-account');
</script>

<style scoped>
.mobile-footer-nav {
    position: fixed;
    left: 0;
    right: 0;
    max-width: 100vw;
    bottom: 0;
    z-index: 60;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
    background: color-mix(in srgb, var(--bg) 86%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    backdrop-filter: blur(12px);
    overflow-x: hidden;
}

@media (min-width: 768px) {
    .mobile-footer-nav {
        display: none;
    }
}

.mf-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 6px;
    border-radius: 14px;
    color: color-mix(in srgb, var(--text) 70%, transparent);
    text-decoration: none;
    transition:
        background-color 140ms ease,
        border-color 140ms ease,
        color 140ms ease;
}

.mf-item:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary) 52%, transparent);
    outline-offset: 2px;
}

.mf-item--active {
    color: var(--text);
    background: color-mix(in srgb, var(--primary) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
}

.mf-label {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.02em;
}
</style>

