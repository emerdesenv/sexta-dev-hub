import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PublicHomePage from '../pages/PublicHomePage.vue';
import EpisodeDetailPage from '../pages/EpisodeDetailPage.vue';
import ProfessorLoginPage from '../pages/ProfessorLoginPage.vue';
import ProfessorDashboardPage from '../pages/ProfessorDashboardPage.vue';
import GamificationPage from '../pages/GamificationPage.vue';
import StudentAuthPage from '../pages/StudentAuthPage.vue';
import StudentAccountPage from '../pages/StudentAccountPage.vue';
import StudentCollectionPage from '../pages/StudentCollectionPage.vue';
import CommunityPage from '../pages/CommunityPage.vue';

const routes = [
    { path: '/', name: 'home', component: PublicHomePage },
    { path: '/gamificacao', name: 'gamification', component: GamificationPage },
    { path: '/aluno', name: 'student-auth', component: StudentAuthPage },
    { path: '/comunidade', name: 'community', component: CommunityPage },
    { path: '/aluno/conta', name: 'student-account', component: StudentAccountPage, meta: { requiresAuth: true, requiresRole: 'student' } },
    { path: '/aluno/colecao', name: 'student-collection', component: StudentCollectionPage, meta: { requiresAuth: true, requiresRole: 'student' } },
    { path: '/episodio/:slug', name: 'episode-detail', component: EpisodeDetailPage },
    { path: '/professor', name: 'professor-login', component: ProfessorLoginPage },
    { path: '/professor/dashboard', name: 'professor-dashboard', component: ProfessorDashboardPage, meta: { requiresAuth: true, requiresRole: 'professor' } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: to.meta.requiresRole === 'professor' ? 'professor-login' : 'student-auth' };
    }

    if (to.meta.requiresRole && auth.user?.role !== to.meta.requiresRole) {
        return { name: 'gamification' };
    }
    
    if (to.name === 'professor-login' && auth.isAuthenticated && auth.user?.role === 'professor') {
        return { name: 'professor-dashboard' };
    }

    if (to.name === 'student-auth' && auth.isAuthenticated && auth.user?.role === 'student') {
        return { name: 'gamification' };
    }
});

export default router;
