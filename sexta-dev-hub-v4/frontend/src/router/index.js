import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PublicHomePage from '../pages/PublicHomePage.vue';
import EpisodeDetailPage from '../pages/EpisodeDetailPage.vue';
import ProfessorLoginPage from '../pages/ProfessorLoginPage.vue';
import ProfessorDashboardPage from '../pages/ProfessorDashboardPage.vue';

const routes = [
  { path: '/', name: 'home', component: PublicHomePage },
  { path: '/episodio/:slug', name: 'episode-detail', component: EpisodeDetailPage },
  { path: '/professor', name: 'professor-login', component: ProfessorLoginPage },
  { path: '/professor/dashboard', name: 'professor-dashboard', component: ProfessorDashboardPage, meta: { requiresAuth: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'professor-login' };
  }
  if (to.name === 'professor-login' && auth.isAuthenticated) {
    return { name: 'professor-dashboard' };
  }
});

export default router;
