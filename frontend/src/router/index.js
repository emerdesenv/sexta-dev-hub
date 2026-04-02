import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const PublicHomePage = () => import('../pages/PublicHomePage.vue');
const EpisodeDetailPage = () => import('../pages/EpisodeDetailPage.vue');
const ProfessorLoginPage = () => import('../pages/ProfessorLoginPage.vue');
const ProfessorDashboardPage = () => import('../pages/ProfessorDashboardPage.vue');
const GamificationPage = () => import('../pages/GamificationPage.vue');
const StudentAuthPage = () => import('../pages/StudentAuthPage.vue');
const StudentAccountPage = () => import('../pages/StudentAccountPage.vue');
const StudentCollectionPage = () => import('../pages/StudentCollectionPage.vue');
const CommunityPage = () => import('../pages/CommunityPage.vue');
const JobsRadarPage = () => import('../pages/JobsRadarPage.vue');

const routes = [
    { path: '/', name: 'home', component: PublicHomePage },
    { path: '/gamificacao', name: 'gamification', component: GamificationPage },
    { path: '/aluno', name: 'student-auth', component: StudentAuthPage },
    { path: '/comunidade', name: 'community', component: CommunityPage },
    { path: '/vagas', name: 'jobs-radar', component: JobsRadarPage },
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
