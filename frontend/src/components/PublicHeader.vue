<template>
    <header class="sticky top-0 z-50 backdrop-blur bg-bg/75 border-b border-border/40">
        <div class="sd-container py-4 md:py-5 flex items-center justify-between gap-5">
            <router-link to="/" class="text-lg font-extrabold tracking-tight">
                <span class="md:hidden inline-block mt-1 ml-4 mb-1">Sexta Dev Hub</span>
                <span class="hidden md:inline">
                    Sexta <span class="text-primary-2">Dev</span> Hub
                </span>
            </router-link>

            <nav class="hidden md:flex items-center gap-2">
                
                <a
                    class="sd-button sd-button-secondary px-3 py-2 text-sm my-1"
                    href="/#episodios"
                >
                    Conteúdos
                </a>
                <router-link
                    class="sd-button sd-button-secondary px-3 py-2 text-sm my-1"
                    to="/gamificacao"
                >
                    Gamificação
                </router-link>
                <router-link
                    v-if="!auth.isAuthenticated"
                    class="sd-button sd-button-secondary px-3 py-2 text-sm my-1"
                    to="/aluno"
                >
                    Aluno
                </router-link>
                <div v-if="auth.isAuthenticated" class="relative" ref="menuRef">
                    <button
                        type="button"
                        class="user-menu-button"
                        aria-label="Abrir menu do usuário"
                        @click.stop="toggleMenu"
                    >
                        <span class="user-menu-avatar">{{ userInitial }}</span>
                    </button>
                    <div v-if="menuOpen" class="user-menu-dropdown">
                        <router-link
                            v-if="auth.user?.role === 'student'"
                            class="user-menu-item"
                            to="/aluno/conta"
                            @click="closeMenu"
                        >
                            Minha conta
                        </router-link>
                        <router-link
                            v-if="auth.user?.role === 'student'"
                            class="user-menu-item"
                            to="/aluno/colecao"
                            @click="closeMenu"
                        >
                            Minha coleção
                        </router-link>
                        <router-link
                            v-else-if="auth.user?.role === 'professor'"
                            class="user-menu-item"
                            to="/professor/dashboard"
                            @click="closeMenu"
                        >
                            Minha conta
                        </router-link>
                        <button
                            class="user-menu-item user-menu-item-danger"
                            type="button"
                            @click="handleLogout"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </nav>

            <nav class="md:hidden flex items-center gap-2">
                <div v-if="auth.isAuthenticated" class="relative" ref="menuRef">
                    <button
                        type="button"
                        class="user-menu-button"
                        aria-label="Abrir menu do usuário"
                        @click.stop="toggleMenu"
                    >
                        <span class="user-menu-avatar">{{ userInitial }}</span>
                    </button>
                    <div v-if="menuOpen" class="user-menu-dropdown right-0">
                        <router-link
                            v-if="auth.user?.role === 'student'"
                            class="user-menu-item"
                            to="/aluno/conta"
                            @click="closeMenu"
                        >
                            Minha conta
                        </router-link>
                        <router-link
                            v-if="auth.user?.role === 'student'"
                            class="user-menu-item"
                            to="/aluno/colecao"
                            @click="closeMenu"
                        >
                            Minha coleção
                        </router-link>
                        <router-link
                            v-else-if="auth.user?.role === 'professor'"
                            class="user-menu-item"
                            to="/professor/dashboard"
                            @click="closeMenu"
                        >
                            Minha conta
                        </router-link>
                        <button
                            class="user-menu-item user-menu-item-danger"
                            type="button"
                            @click="handleLogout"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);
const menuRef = ref(null);
const themeOrder = ['system', 'light', 'dark'];

const userInitial = computed(() => {
    const username = auth.user?.username || 'U';
    return username.charAt(0).toUpperCase();
});

const themeButtonLabel = computed(() => {
    if (auth.uiTheme === 'light') return 'Tema: Claro';
    if (auth.uiTheme === 'dark') return 'Tema: Escuro';
    return 'Tema: Sistema';
});

function closeMenu() {
    menuOpen.value = false;
}

function toggleMenu() {
    menuOpen.value = !menuOpen.value;
}

function handleClickOutside(event) {
    if (!menuOpen.value) return;
    if (menuRef.value && !menuRef.value.contains(event.target)) {
        closeMenu();
    }
}

function handleLogout() {
    closeMenu();
    auth.logout();
    router.push('/');
}

function toggleTheme() {
    const currentIndex = themeOrder.indexOf(auth.uiTheme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    auth.setUiTheme(nextTheme);
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-menu-button {
    border: 1px solid color-mix(in srgb, var(--border) 90%, transparent);
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    border-radius: 999px;
    padding: 2px;
    cursor: pointer;
}

.user-menu-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--primary), var(--primary-2));
    color: #fff;
    font-weight: 700;
    font-size: 0.875rem;
}

.user-menu-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 180px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--border) 90%, transparent);
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.28);
    overflow: hidden;
    z-index: 70;
}

.user-menu-item {
    display: block;
    width: 100%;
    padding: 10px 12px;
    font-size: 0.875rem;
    color: var(--text);
    background: transparent;
    border: 0;
    text-align: left;
    cursor: pointer;
}

.user-menu-item:hover {
    background: color-mix(in srgb, var(--surface-2) 65%, transparent);
}

.user-menu-item-danger {
    color: color-mix(in srgb, var(--danger) 70%, white);
}
</style>
