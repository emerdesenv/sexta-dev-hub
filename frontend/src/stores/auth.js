import { defineStore } from 'pinia';
import api from '../services/api';

function resolveTheme(gameTheme, uiTheme) {
    if (uiTheme === 'light') return 'light';
    if (uiTheme === 'dark') return 'default';
    return gameTheme || 'default';
}

function applyTheme(gameTheme, uiTheme) {
    if (typeof document === 'undefined') return;
    document.body.dataset.theme = resolveTheme(gameTheme, uiTheme);
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('sexta_dev_user') || 'null'),
        theme: localStorage.getItem('sexta_dev_theme') || 'default',
        uiTheme: localStorage.getItem('sexta_dev_ui_theme') || 'system',
    }),
    getters: { isAuthenticated: (state) => !!state.user },
    actions: {
        applyCurrentTheme() {
            applyTheme(this.theme, this.uiTheme);
        },
        setUiTheme(themePreference) {
            this.uiTheme = themePreference;
            localStorage.setItem('sexta_dev_ui_theme', themePreference);
            this.applyCurrentTheme();
        },
        async login(payload) {
            const { data } = await api.post('/auth/login', payload);
            this.user = data.user;
            localStorage.setItem('sexta_dev_user', JSON.stringify(data.user));
            await this.refreshThemePreference();
        },
        async refreshThemePreference() {
            if (!this.user) {
                this.theme = 'default';
                localStorage.setItem('sexta_dev_theme', 'default');
                this.applyCurrentTheme();
                return;
            }

            try {
                const { data } = await api.get('/gamification/me');
                const activeTheme = data?.profile?.activeTheme || 'default';
                this.theme = activeTheme;
                localStorage.setItem('sexta_dev_theme', activeTheme);
                this.applyCurrentTheme();
            } catch {
                this.theme = 'default';
                localStorage.setItem('sexta_dev_theme', 'default');
                this.applyCurrentTheme();
            }
        },
        async logout() {
            try {
                await api.post('/auth/logout');
            } catch {
                // Ignore network/logout endpoint failures and clear local state anyway.
            }
            this.user = null;
            this.theme = 'default';
            localStorage.removeItem('sexta_dev_user');
            localStorage.setItem('sexta_dev_theme', 'default');
            this.applyCurrentTheme();
        }
    }
});
