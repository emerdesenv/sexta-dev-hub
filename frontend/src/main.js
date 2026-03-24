import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles.css';
import { initVLibras } from './plugins/vlibras';
import { useAuthStore } from './stores/auth';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia).use(router);

const auth = useAuthStore(pinia);
if (typeof document !== 'undefined') {
    auth.applyCurrentTheme();
}

app.mount('#app');
initVLibras();
