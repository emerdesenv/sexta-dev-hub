import { defineStore } from 'pinia';
import api from '../services/api';

function applyTheme(theme) {
    if (typeof document === 'undefined') return;
    document.body.dataset.theme = theme || 'default';
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('sexta_dev_token') || '',
        user: JSON.parse(localStorage.getItem('sexta_dev_user') || 'null'),
        theme: localStorage.getItem('sexta_dev_theme') || 'default'
    }),
    getters: { isAuthenticated: (state) => !!state.token },
    actions: {
        async login(payload) {
            const { data } = await api.post('/auth/login', payload);
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('sexta_dev_token', data.token);
            localStorage.setItem('sexta_dev_user', JSON.stringify(data.user));
            await this.refreshThemePreference();
        },
        async refreshThemePreference() {
            if (!this.token) {
                this.theme = 'default';
                localStorage.setItem('sexta_dev_theme', 'default');
                applyTheme('default');
                return;
            }

            try {
                const { data } = await api.get('/gamification/me');
                const activeTheme = data?.profile?.activeTheme || 'default';
                this.theme = activeTheme;
                localStorage.setItem('sexta_dev_theme', activeTheme);
                applyTheme(activeTheme);
            } catch {
                this.theme = 'default';
                localStorage.setItem('sexta_dev_theme', 'default');
                applyTheme('default');
            }
        },
        logout() {
            this.token = '';
            this.user = null;
            this.theme = 'default';
            localStorage.removeItem('sexta_dev_token');
            localStorage.removeItem('sexta_dev_user');
            localStorage.setItem('sexta_dev_theme', 'default');
            applyTheme('default');
        }
    }
});
