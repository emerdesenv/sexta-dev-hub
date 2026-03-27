import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

let refreshPromise = null;

async function refreshSession() {
    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh', null, { _skipAuthRefresh: true })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error?.config || {};
        const status = Number(error?.response?.status || 0);
        const isAuthEndpoint = String(original.url || '').includes('/auth/');
        if (
            status === 401 &&
            !original._retry &&
            !original._skipAuthRefresh &&
            !isAuthEndpoint
        ) {
            original._retry = true;
            try {
                await refreshSession();
                return api(original);
            } catch {
                // fall through and reject original error
            }
        }
        return Promise.reject(error);
    }
);

export default api;