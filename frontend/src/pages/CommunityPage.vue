<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10 pb-12">
            <section class="sd-card sd-card-section p-6 md:p-7">
                <Badge tone="primary">Comunidade ADS</Badge>
                <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Troca de conhecimento entre fases</h1>
                <p class="mt-3 text-muted max-w-3xl">
                    Espaço para dúvidas, soluções e discussões com foco em aprendizado colaborativo.
                </p>
                <p class="mt-2 text-xs text-muted max-w-3xl">
                    Para manter um ambiente seguro, conteúdos ofensivos, de ódio, assédio ou incentivo a autoagressão são bloqueados.
                </p>
            </section>

            <section class="mt-6 grid gap-4 md:grid-cols-1">
                <div class="space-y-4">
                <article class="sd-card p-5">
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                        <h2 class="sd-section-title">Tópicos recentes</h2>
                        <button
                            v-if="auth.isAuthenticated"
                            class="sd-button sd-button-primary"
                            type="button"
                            @click="openCreateTopicModal"
                        >
                            Novo tópico
                        </button>
                    </div>
                    <div v-if="topicScope !== 'reports'" class="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                        <input v-model.trim="filters.search" class="sd-input" placeholder="Buscar por título ou conteúdo" />
                        <button class="sd-button sd-button-secondary" type="button" @click="loadTopics">Buscar</button>
                    </div>
                    <div v-if="topicScope !== 'reports'" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select v-model="filters.category" class="sd-input">
                            <option value="">Todas categorias</option>
                            <option value="duvida">Dúvida</option>
                            <option value="solucao">Solução</option>
                            <option value="discussao">Discussão</option>
                            <option value="showcase">Showcase</option>
                        </select>
                        <select v-model="filters.phase" class="sd-input">
                            <option value="">Todas fases</option>
                            <option value="1">Fase 1</option>
                            <option value="2">Fase 2</option>
                            <option value="3">Fase 3</option>
                        </select>
                    </div>
                    <div v-if="auth.isAuthenticated" class="mt-3 flex items-center gap-2 flex-wrap">
                        <button
                            class="sd-button px-3 py-2 text-sm"
                            type="button"
                            :class="topicScope === 'all' ? 'sd-button-primary' : 'sd-button-secondary'"
                            @click="topicScope = 'all'"
                        >
                            Todos os tópicos
                        </button>
                        <button
                            class="sd-button px-3 py-2 text-sm"
                            type="button"
                            :class="topicScope === 'mine' ? 'sd-button-primary' : 'sd-button-secondary'"
                            @click="topicScope = 'mine'"
                        >
                            Meus tópicos
                        </button>
                        <button
                            v-if="isProfessorView"
                            class="sd-button px-3 py-2 text-sm"
                            type="button"
                            :class="topicScope === 'removedAuthors' ? 'sd-button-primary' : 'sd-button-secondary'"
                            @click="topicScope = 'removedAuthors'"
                        >
                            Autores removidos
                        </button>
                        <button
                            v-if="isProfessorView"
                            class="sd-button px-3 py-2 text-sm"
                            type="button"
                            :class="topicScope === 'reports' ? 'sd-button-primary' : 'sd-button-secondary'"
                            @click="topicScope = 'reports'"
                        >
                            Denúncias pendentes
                        </button>
                    </div>

                    <div v-if="topicScope !== 'reports'" class="mt-4 space-y-3">
                        <button
                            v-for="topic in visibleTopics"
                            :key="topic.id"
                            class="w-full text-left sd-list-item p-4"
                            :class="{
                                'ring-2 ring-blue-400/60 border-blue-400/60 bg-blue-500/5': selectedTopic?.topic?.id === topic.id
                            }"
                            type="button"
                            @click="openTopic(topic.id)"
                        >
                            <div class="flex items-center justify-between gap-3">
                                <h3 class="font-bold min-w-0 break-words">{{ topic.title }}</h3>
                                <Badge tone="neutral">{{ categoryLabel(topic.category) }}</Badge>
                            </div>
                            <p class="mt-2 text-sm text-muted line-clamp-2">{{ topic.content }}</p>
                            <div class="mt-3 text-xs text-muted flex items-center gap-2 flex-wrap">
                                <Badge :tone="topic.isAnonymous ? 'warning' : (topic.author?.role === 'professor' ? 'pro' : 'info')">
                                    {{ topic.isAnonymous ? 'Anônimo' : (topic.author?.username || 'Usuário') }}
                                </Badge>
                                <Badge v-if="topic.authorAccountRemoved" tone="warning">Autor removido</Badge>
                                <Badge v-if="topic.isMine" tone="info">Meu tópico</Badge>
                                <Badge tone="neutral">{{ phaseLabel(topic.phase) }}</Badge>
                                <Badge tone="neutral">{{ topic.repliesCount || 0 }} respostas</Badge>
                            </div>
                        </button>
                        <div v-if="!visibleTopics.length" class="sd-notice">
                            {{ emptyTopicsMessage }}
                        </div>
                    </div>

                    <div v-else class="mt-4 space-y-2">
                        <div v-for="report in reports" :key="report.id" class="sd-list-item p-3">
                            <div class="text-sm font-semibold">
                                #{{ report.id }} • {{ report.targetType === 'topic' ? 'Tópico' : 'Resposta' }}
                            </div>
                            <div class="text-sm mt-1">
                                <strong>{{ report.target?.title || 'Sem título disponível' }}</strong>
                            </div>
                            <div v-if="report.target?.replyPreview" class="text-xs text-muted mt-1">
                                {{ report.target.replyPreview }}
                            </div>
                            <div class="text-xs text-muted mt-1">
                                por {{ report.reporter?.username || 'usuário' }} — {{ report.reason }}
                            </div>
                            <div class="mt-2 flex items-center gap-2">
                                <button class="sd-button sd-button-secondary !py-1 !px-2 !text-xs" :disabled="loadingAction" @click="reviewReport(report.id, 'actioned')">
                                    Aprovar denúncia
                                </button>
                                <button class="sd-button sd-button-secondary !py-1 !px-2 !text-xs" :disabled="loadingAction" @click="reviewReport(report.id, 'dismissed')">
                                    Descartar denúncia
                                </button>
                            </div>
                        </div>
                        <div v-if="!reports.length" class="sd-notice">Sem denúncias pendentes.</div>
                    </div>
                </article>
                </div>
            </section>

            <Transition name="topic-drawer">
                <div
                    v-if="topicDetailOpen && selectedTopic"
                    class="fixed inset-0 z-[95] bg-black/70 flex items-end md:items-stretch md:justify-end"
                    @click.self="closeTopicDetail"
                >
                    <section class="community-topic-drawer w-full md:w-[min(820px,94vw)] h-[100dvh] md:h-full border-t border-border md:border-l md:border-t-0 md:border-r-0 md:border-b-0 rounded-none md:rounded-none flex flex-col shadow-2xl">
                        <header class="p-4 md:p-5 border-b border-border community-topic-drawer-header sticky top-0 z-10">
                        <div class="flex items-center justify-between gap-3 flex-wrap">
                            <h2 class="sd-section-title">{{ selectedTopic.topic.title }}</h2>
                            <div class="flex items-center gap-2 flex-wrap">
                                <button
                                    v-if="canEditSelectedTopic"
                                    class="sd-button sd-button-secondary"
                                    type="button"
                                    :disabled="loadingAction"
                                    @click="openEditTopicModal"
                                >
                                    Editar tópico
                                </button>
                                <button
                                    v-if="isProfessorView && selectedTopic.topic.authorAccountRemoved"
                                    class="sd-button sd-button-danger"
                                    type="button"
                                    :disabled="loadingAction"
                                    @click="deleteRemovedAuthorTopic"
                                >
                                    Excluir tópico
                                </button>
                                <button class="sd-button sd-button-secondary" type="button" @click="closeTopicDetail">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </header>

                    <div class="flex-1 overflow-y-auto p-4 md:p-5 community-topic-drawer-body">
                        <div v-if="errorMessage" class="sd-error mb-3">{{ errorMessage }}</div>
                        <div v-if="notice" class="sd-notice mb-3">{{ notice }}</div>
                        <div class="flex items-center gap-2 flex-wrap" v-if="auth.user?.role === 'professor'">
                            <button class="sd-button sd-button-secondary !py-1 !px-2 !text-xs" type="button" @click="moderate('topic', selectedTopic.topic.id, selectedTopic.topic.status === 'hidden' ? 'unhide' : 'hide')">
                                {{ selectedTopic.topic.status === 'hidden' ? 'Reexibir tópico' : 'Ocultar tópico' }}
                            </button>
                        </div>
                        <p class="mt-3 text-muted whitespace-pre-wrap break-words">
                            <template
                                v-for="(part, index) in splitTextWithLinks(selectedTopic.topic.content)"
                                :key="`topic-content-${index}`"
                            >
                                <a
                                    v-if="part.type === 'link'"
                                    :href="part.value"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-baseline gap-1 underline text-blue-300 hover:text-blue-200"
                                    title="Abrir link em nova aba"
                                >
                                    <span class="break-all">{{ part.value }}</span>
                                    <IconExternalLink class="h-3.5 w-3.5 shrink-0 opacity-90" />
                                </a>
                                <span v-else>{{ part.value }}</span>
                            </template>
                        </p>
                        <div class="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge :tone="selectedTopic.topic.isAnonymous ? 'warning' : (selectedTopic.topic.author?.role === 'professor' ? 'pro' : 'info')">
                                {{ selectedTopic.topic.isAnonymous ? 'Anônimo' : (selectedTopic.topic.author?.username || 'Usuário') }}
                            </Badge>
                            <Badge v-if="selectedTopic.topic.authorAccountRemoved" tone="warning">Autor removido</Badge>
                            <Badge tone="neutral">{{ phaseLabel(selectedTopic.topic.phase) }}</Badge>
                        </div>
                        <p v-if="auth.isAuthenticated && !selectedTopic.topic.repliesOpen" class="mt-3 text-sm text-muted">
                            <template v-if="selectedTopic.topic.authorAccountRemoved">
                                Não é possível enviar novas respostas: o autor deste tópico removeu a conta.
                            </template>
                            <template v-else>Este tópico não aceita novas respostas.</template>
                        </p>
                        <div class="mt-4 space-y-3">
                            <article v-for="reply in selectedTopic.replies" :key="reply.id" class="sd-list-item p-3">
                                <div class="flex items-center justify-between gap-3">
                                    <strong>{{ reply.author?.username || 'usuário' }}</strong>
                                    <div class="flex items-center gap-2">
                                        <Badge v-if="selectedTopic.topic.bestReplyId === reply.id" tone="success">Melhor resposta</Badge>
                                        <Badge v-else-if="reply.isOfficial" tone="success">Oficial</Badge>
                                    </div>
                                </div>
                                <p class="mt-1 text-sm whitespace-pre-wrap break-words">
                                    <template
                                        v-for="(part, index) in splitTextWithLinks(reply.content)"
                                        :key="`reply-content-${reply.id}-${index}`"
                                    >
                                        <a
                                            v-if="part.type === 'link'"
                                            :href="part.value"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="inline-flex items-baseline gap-1 underline text-blue-300 hover:text-blue-200"
                                            title="Abrir link em nova aba"
                                        >
                                            <span class="break-all">{{ part.value }}</span>
                                            <IconExternalLink class="h-3.5 w-3.5 shrink-0 opacity-90" />
                                        </a>
                                        <span v-else>{{ part.value }}</span>
                                    </template>
                                </p>
                                <div class="mt-2 flex items-center gap-2 flex-wrap">
                                    <button
                                        v-if="auth.isAuthenticated"
                                        class="sd-button sd-button-secondary !py-1 !px-2 !text-xs"
                                        type="button"
                                        :disabled="loadingAction"
                                        @click="toggleVote(reply.id)"
                                    >
                                        {{ reply.viewerVoted ? 'Remover voto' : 'Votar útil' }} ({{ reply.votesCount || 0 }})
                                    </button>
                                    <button
                                        v-if="auth.isAuthenticated"
                                        class="sd-button sd-button-secondary !py-1 !px-2 !text-xs"
                                        type="button"
                                        :disabled="loadingAction"
                                        @click="reportReply(reply.id)"
                                    >
                                        Denunciar
                                    </button>
                                    <button
                                        v-if="canSetBestReply(reply)"
                                        class="sd-button sd-button-secondary !py-1 !px-2 !text-xs"
                                        type="button"
                                        :disabled="loadingAction"
                                        @click="setBestReply(reply.id)"
                                    >
                                        Marcar melhor resposta
                                    </button>
                                    <button
                                        v-if="auth.user?.role === 'professor'"
                                        class="sd-button sd-button-secondary !py-1 !px-2 !text-xs"
                                        type="button"
                                        :disabled="loadingAction"
                                        @click="moderate('reply', reply.id, reply.isHidden ? 'unhide' : 'hide')"
                                    >
                                        {{ reply.isHidden ? 'Reexibir resposta' : 'Ocultar resposta' }}
                                    </button>
                                </div>
                            </article>
                            <div v-if="!selectedTopic.replies.length" class="sd-notice">Sem respostas ainda.</div>
                        </div>
                    </div>

                    <footer
                        v-if="auth.isAuthenticated && selectedTopic.topic.repliesOpen"
                        class="border-t border-border p-4 md:p-5 community-topic-drawer-footer"
                    >
                        <form class="flex gap-2" @submit.prevent="submitReply">
                            <input v-model.trim="newReply" class="sd-input" placeholder="Escreva sua resposta" :disabled="loadingReply || loadingAction" />
                            <button class="sd-button sd-button-secondary shrink-0" type="submit" :disabled="loadingReply || loadingAction || !newReply">
                                {{ loadingReply ? 'Enviando...' : 'Responder' }}
                            </button>
                        </form>
                    </footer>
                </section>
                </div>
            </Transition>

            <BaseModal
                v-model="topicModalOpen"
                :title="isEditingTopic ? 'Editar tópico' : 'Novo tópico'"
                aria-label="Formulário de tópico"
                max-width="2xl"
                :disable-close="loading"
                @close="closeTopicModal"
            >
                <form class="mt-4 space-y-3" @submit.prevent="submitTopic">
                    <div v-if="errorMessage" class="sd-error">{{ errorMessage }}</div>
                    <input v-model.trim="newTopic.title" class="sd-input" placeholder="Título do tópico" :disabled="loading" />
                    <textarea
                        v-model.trim="newTopic.content"
                        class="sd-input min-h-[140px]"
                        placeholder="Explique seu contexto, o que tentou e em que parte travou."
                        :disabled="loading"
                    />
                    <select v-model="newTopic.category" class="sd-input" :disabled="loading">
                        <option value="duvida">Dúvida</option>
                        <option value="solucao">Solução</option>
                        <option value="discussao">Discussão</option>
                        <option value="showcase">Showcase</option>
                    </select>
                    <select v-model="newTopic.phase" class="sd-input" :disabled="loading">
                        <option value="">Sem fase</option>
                        <option value="1">Fase 1</option>
                        <option value="2">Fase 2</option>
                        <option value="3">Fase 3</option>
                    </select>
                    <label class="flex items-center gap-2 text-sm text-muted">
                        <input v-model="newTopic.isAnonymous" type="checkbox" :disabled="loading" />
                        Publicar de forma anônima para outros alunos
                    </label>
                    <div class="flex items-center justify-end gap-2">
                        <button class="sd-button sd-button-secondary" type="button" :disabled="loading" @click="closeTopicModal">
                            Cancelar
                        </button>
                        <button class="sd-button sd-button-primary" type="submit" :disabled="loading">
                            {{ loading ? 'Salvando...' : (isEditingTopic ? 'Salvar alterações' : 'Publicar tópico') }}
                        </button>
                    </div>
                </form>
            </BaseModal>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import IconExternalLink from '../components/icons/IconExternalLink.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const topics = ref([]);
const selectedTopic = ref(null);
const loading = ref(false);
const loadingReply = ref(false);
const loadingAction = ref(false);
const topicDetailOpen = ref(false);
const topicModalOpen = ref(false);
const isEditingTopic = ref(false);
const editingTopicId = ref(null);
const reports = ref([]);
const notice = ref('');
const errorMessage = ref('');
const newReply = ref('');
const topicScope = ref('all');

const filters = ref({
    search: '',
    category: '',
    phase: ''
});

const newTopic = ref({
    title: '',
    content: '',
    category: 'duvida',
    phase: '',
    isAnonymous: false
});
const defaultTopicForm = () => ({
    title: '',
    content: '',
    category: 'duvida',
    phase: '',
    isAnonymous: false
});

function moderationFeedbackFromError(error, fallbackMessage) {
    const data = error?.response?.data || {};
    const status = Number(error?.response?.status || 0);

    if (status === 422 && data?.severity === 'high') {
        return 'Seu texto violou regras de segurança e respeito da comunidade. Ajuste o conteúdo para continuar.';
    }

    if (status === 422 && data?.severity === 'medium') {
        return 'Seu texto pode ser interpretado como ofensivo. Revise a linguagem e tente novamente.';
    }

    return data?.message || fallbackMessage;
}

function categoryLabel(category) {
    if (category === 'duvida') return 'Dúvida';
    if (category === 'solucao') return 'Solução';
    if (category === 'discussao') return 'Discussão';
    if (category === 'showcase') return 'Showcase';
    return category;
}

function phaseLabel(phase) {
    if (!phase) return 'Fase não informada';
    return `Fase ${phase}`;
}

function splitTextWithLinks(input) {
    const text = String(input || '');
    if (!text) return [{ type: 'text', value: '' }];

    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    const parts = [];
    let lastIndex = 0;
    let match = urlRegex.exec(text);

    while (match) {
        const url = match[0];
        const start = match.index;
        if (start > lastIndex) {
            parts.push({ type: 'text', value: text.slice(lastIndex, start) });
        }
        parts.push({ type: 'link', value: url });
        lastIndex = start + url.length;
        match = urlRegex.exec(text);
    }

    if (lastIndex < text.length) {
        parts.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return parts.length ? parts : [{ type: 'text', value: text }];
}

function canSetBestReply(reply) {
    if (!auth.isAuthenticated || !selectedTopic.value) return false;
    if (selectedTopic.value.topic.bestReplyId === reply.id) return false;
    const isProfessor = auth.user?.role === 'professor';
    const isAuthor = Boolean(selectedTopic.value.topic.isMine);
    return isProfessor || isAuthor;
}

const canEditSelectedTopic = computed(() => {
    if (!auth.isAuthenticated || !selectedTopic.value) return false;
    return auth.user?.role === 'professor' || Boolean(selectedTopic.value.topic.isMine);
});

const isProfessorView = computed(() => auth.user?.role === 'professor');

const emptyTopicsMessage = computed(() => {
    if (topicScope.value === 'mine') return 'Você ainda não criou tópicos.';
    if (topicScope.value === 'removedAuthors') return 'Nenhum tópico de autor removido.';
    return 'Nenhum tópico encontrado.';
});

const visibleTopics = computed(() => {
    if (topicScope.value === 'mine') return topics.value.filter((topic) => Boolean(topic.isMine));
    return topics.value;
});

function openCreateTopicModal() {
    notice.value = '';
    errorMessage.value = '';
    newTopic.value = defaultTopicForm();
    isEditingTopic.value = false;
    editingTopicId.value = null;
    topicModalOpen.value = true;
}

function openEditTopicModal() {
    if (!selectedTopic.value || !canEditSelectedTopic.value) return;
    notice.value = '';
    errorMessage.value = '';
    // Close the topic drawer first, then open edit modal.
    topicDetailOpen.value = false;
    const topic = selectedTopic.value.topic;
    newTopic.value = {
        title: topic.title || '',
        content: topic.content || '',
        category: topic.category || 'duvida',
        phase: topic.phase ? String(topic.phase) : '',
        isAnonymous: Boolean(topic.isAnonymous)
    };
    isEditingTopic.value = true;
    editingTopicId.value = topic.id;
    topicModalOpen.value = true;
}

function closeTopicModal() {
    if (loading.value) return;
    topicModalOpen.value = false;
    errorMessage.value = '';
}

async function loadTopics() {
    const params = {};
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.phase) params.phase = Number(filters.value.phase);
    if (topicScope.value === 'removedAuthors' && auth.user?.role === 'professor') {
        params.removedAuthorsOnly = '1';
    }
    const { data } = await api.get('/community/topics', { params });
    topics.value = data;
}

async function loadReports() {
    if (auth.user?.role !== 'professor') return;
    const { data } = await api.get('/community/reports', {
        params: { status: 'pending' }
    });
    reports.value = data;
}

async function submitTopic() {
    if (!auth.isAuthenticated) return;
    loading.value = true;
    notice.value = '';
    errorMessage.value = '';
    try {
        const payload = {
            title: newTopic.value.title,
            content: newTopic.value.content,
            category: newTopic.value.category,
            phase: newTopic.value.phase ? Number(newTopic.value.phase) : null,
            isAnonymous: Boolean(newTopic.value.isAnonymous)
        };
        if (isEditingTopic.value && editingTopicId.value) {
            await api.patch(`/community/topics/${editingTopicId.value}`, payload);
            notice.value = 'Tópico atualizado com sucesso.';
        } else {
            await api.post('/community/topics', payload);
            notice.value = 'Tópico publicado com sucesso.';
        }
        newTopic.value = defaultTopicForm();
        topicModalOpen.value = false;
        isEditingTopic.value = false;
        editingTopicId.value = null;
        await loadTopics();
        await loadReports();
    } catch (error) {
        errorMessage.value = moderationFeedbackFromError(
            error,
            isEditingTopic.value ? 'Não foi possível atualizar o tópico.' : 'Não foi possível publicar o tópico.'
        );
    } finally {
        loading.value = false;
    }
}

async function openTopic(topicId) {
    try {
        notice.value = '';
        errorMessage.value = '';
        const { data } = await api.get(`/community/topics/${topicId}`);
        selectedTopic.value = data;
        topicDetailOpen.value = true;
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível carregar o tópico.';
    }
}

function closeTopicDetail() {
    if (loadingAction.value || loadingReply.value) return;
    topicDetailOpen.value = false;
    errorMessage.value = '';
    notice.value = '';
}

function handleTopicDetailEscape(event) {
    if (event.key === 'Escape') {
        closeTopicDetail();
    }
}

async function submitReply() {
    if (!selectedTopic.value || !newReply.value) return;
    loadingReply.value = true;
    errorMessage.value = '';
    try {
        await api.post(`/community/topics/${selectedTopic.value.topic.id}/replies`, {
            content: newReply.value
        });
        newReply.value = '';
        await openTopic(selectedTopic.value.topic.id);
        await loadTopics();
        await loadReports();
    } catch (error) {
        errorMessage.value = moderationFeedbackFromError(error, 'Não foi possível enviar resposta.');
    } finally {
        loadingReply.value = false;
    }
}

async function toggleVote(replyId) {
    if (!selectedTopic.value) return;
    errorMessage.value = '';
    notice.value = '';
    loadingAction.value = true;
    try {
        const { data } = await api.post(`/community/replies/${replyId}/vote`);
        notice.value = data?.voted ? 'Resposta marcada como útil.' : 'Voto removido.';
        await openTopic(selectedTopic.value.topic.id);
        await loadTopics();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível votar nesta resposta.';
    } finally {
        loadingAction.value = false;
    }
}

async function setBestReply(replyId) {
    if (!selectedTopic.value) return;
    errorMessage.value = '';
    notice.value = '';
    loadingAction.value = true;
    try {
        await api.patch(`/community/topics/${selectedTopic.value.topic.id}/best-reply`, { replyId });
        notice.value = 'Melhor resposta definida com sucesso.';
        await openTopic(selectedTopic.value.topic.id);
        await loadTopics();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível definir melhor resposta.';
    } finally {
        loadingAction.value = false;
    }
}

async function reportReply(replyId) {
    errorMessage.value = '';
    notice.value = '';
    loadingAction.value = true;
    try {
        await api.post('/community/reports', {
            targetType: 'reply',
            targetId: replyId,
            reason: 'Conteúdo inadequado para a comunidade'
        });
        notice.value = 'Denúncia enviada para moderação.';
        await loadReports();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível registrar denúncia.';
    } finally {
        loadingAction.value = false;
    }
}

async function reportTopic(topicId) {
    errorMessage.value = '';
    notice.value = '';
    loadingAction.value = true;
    try {
        await api.post('/community/reports', {
            targetType: 'topic',
            targetId: topicId,
            reason: 'Conteúdo inadequado para a comunidade'
        });
        notice.value = 'Denúncia do tópico enviada para moderação.';
        await loadReports();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível registrar denúncia do tópico.';
    } finally {
        loadingAction.value = false;
    }
}

async function deleteRemovedAuthorTopic() {
    if (!selectedTopic.value?.topic?.authorAccountRemoved || auth.user?.role !== 'professor') return;
    if (!window.confirm('Excluir este tópico e todas as respostas? Esta ação não pode ser desfeita.')) return;
    errorMessage.value = '';
    notice.value = '';
    loadingAction.value = true;
    try {
        await api.delete(`/community/topics/${selectedTopic.value.topic.id}`);
        notice.value = 'Tópico excluído.';
        topicDetailOpen.value = false;
        selectedTopic.value = null;
        await loadTopics();
        await loadReports();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível excluir o tópico.';
    } finally {
        loadingAction.value = false;
    }
}

async function moderate(targetType, targetId, action) {
    if (auth.user?.role !== 'professor') return;
    errorMessage.value = '';
    notice.value = '';
    loadingAction.value = true;
    try {
        await api.patch(`/community/moderation/${targetType}/${targetId}`, {
            action,
            reason: 'Ação de moderação administrativa'
        });
        notice.value = 'Ação de moderação aplicada.';
        if (selectedTopic.value) {
            await openTopic(selectedTopic.value.topic.id);
        }
        await loadTopics();
        await loadReports();
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível moderar este conteúdo.';
    } finally {
        loadingAction.value = false;
    }
}

async function reviewReport(reportId, status) {
    if (auth.user?.role !== 'professor') return;
    loadingAction.value = true;
    errorMessage.value = '';
    notice.value = '';
    try {
        const { data } = await api.patch(`/community/reports/${reportId}/review`, {
            status,
            reason: status === 'actioned' ? 'Conteúdo moderado via fluxo de denúncias.' : 'Denúncia sem procedência.'
        });
        notice.value = data?.message || 'Denúncia atualizada.';
        await loadReports();
        await loadTopics();
        if (selectedTopic.value) {
            await openTopic(selectedTopic.value.topic.id);
        }
    } catch (error) {
        errorMessage.value = error?.response?.data?.message || 'Não foi possível revisar denúncia.';
    } finally {
        loadingAction.value = false;
    }
}

watch(topicDetailOpen, (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

watch(topicScope, async (scope) => {
    if (scope === 'reports') {
        topicDetailOpen.value = false;
        selectedTopic.value = null;
        await loadReports();
        return;
    }
    await loadTopics();
    if (selectedTopic.value) {
        const selectedId = selectedTopic.value.topic?.id;
        const stillVisible = visibleTopics.value.some((topic) => topic.id === selectedId);
        if (!stillVisible) {
            topicDetailOpen.value = false;
            selectedTopic.value = null;
        }
    }
});

onMounted(async () => {
    document.addEventListener('keydown', handleTopicDetailEscape);
    await loadTopics();
    await loadReports();
});

onBeforeUnmount(() => {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleTopicDetailEscape);
});
</script>

<style scoped>
.community-topic-drawer,
.community-topic-drawer-header,
.community-topic-drawer-body,
.community-topic-drawer-footer {
    background: var(--surface);
}

.topic-drawer-enter-active,
.topic-drawer-leave-active {
    transition: opacity 220ms ease;
}

.topic-drawer-enter-active .community-topic-drawer,
.topic-drawer-leave-active .community-topic-drawer {
    transition: transform 240ms ease, opacity 240ms ease;
}

.topic-drawer-enter-from,
.topic-drawer-leave-to {
    opacity: 0;
}

@media (max-width: 767px) {
    .topic-drawer-enter-from .community-topic-drawer,
    .topic-drawer-leave-to .community-topic-drawer {
        transform: translateY(24px);
        opacity: 0;
    }
}

@media (min-width: 768px) {
    .topic-drawer-enter-from .community-topic-drawer,
    .topic-drawer-leave-to .community-topic-drawer {
        transform: translateX(28px);
        opacity: 0;
    }
}
</style>
