import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('sexta_dev_token') || '', user: JSON.parse(localStorage.getItem('sexta_dev_user') || 'null') }),
  getters: { isAuthenticated: (state) => !!state.token },
  actions: {
    async login(payload) {
      const { data } = await api.post('/auth/login', payload);
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('sexta_dev_token', data.token);
      localStorage.setItem('sexta_dev_user', JSON.stringify(data.user));
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('sexta_dev_token');
      localStorage.removeItem('sexta_dev_user');
    }
  }
});
