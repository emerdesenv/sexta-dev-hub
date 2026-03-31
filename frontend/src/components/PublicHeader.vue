<template>
    <header
        :class="[
            'sticky top-0 z-50 backdrop-blur bg-bg/75 border-b border-border/40 md:fixed md:left-0 md:right-0',
            { 'header-community': variant === 'community' }
        ]"
    >
        <div class="sd-container header-inner flex items-center justify-between gap-4">
            <router-link to="/" class="brand-link text-lg font-extrabold tracking-tight min-w-0 flex items-center gap-2">
                <img
                    :src="brandLogoMark"
                    alt="Dev Hub"
                    class="brand-mark md:hidden"
                >
                <img
                    :src="brandLogoFull"
                    alt="Dev Hub"
                    class="brand-full hidden md:block"
                >
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
                    class="sd-button sd-button-secondary px-3 py-2 text-sm my-1"
                    to="/comunidade"
                >
                    Comunidade
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
                            class="user-menu-item"
                            to="/comunidade"
                            @click="closeMenu"
                        >
                            Comunidade
                        </router-link>
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
    <div class="hidden md:block header-desktop-spacer" aria-hidden="true"></div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import brandLogoMark from '../assets/dev-hub-logo-mark.svg';
import brandLogoFull from '../assets/dev-hub-logo-full.svg';

defineProps({
    variant: {
        type: String,
        default: 'default'
    }
});

const auth = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);
const menuRef = ref(null);

const userInitial = computed(() => {
    const username = auth.user?.username || 'U';
    return username.charAt(0).toUpperCase();
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

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header-inner {
    padding-top: 0.875rem;
    padding-bottom: 0.875rem;
}

.brand-link {
    color: var(--text);
}

.brand-mark {
    width: 1.85rem;
    height: 1.85rem;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 7px rgba(99, 102, 241, 0.34));
}

@media (min-width: 768px) {
    .brand-mark {
        width: 2.05rem;
        height: 2.05rem;
    }
}

.brand-full {
    width: 10.2rem;
    height: auto;
    max-width: 42vw;
    filter: drop-shadow(0 2px 7px rgba(99, 102, 241, 0.28));
}

.header-community {
    background:
        radial-gradient(circle at 16% 10%, color-mix(in srgb, var(--primary-2) 22%, transparent), transparent 36%),
        color-mix(in srgb, var(--bg) 82%, transparent);
    border-bottom-color: color-mix(in srgb, var(--primary-2) 24%, var(--border));
}

@media (min-width: 768px) {
    .header-inner {
        padding-top: 1.25rem;
        padding-bottom: 1.25rem;
    }

    .header-desktop-spacer {
        height: 84px;
    }
}

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
