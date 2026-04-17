<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader variant="community" />
        <PageContainer>
            <section class="sd-card sd-card-section p-6 md:p-7 community-hero md:grid md:grid-cols-[minmax(0,1fr)_260px] md:items-center md:gap-6">
                <div class="min-w-0">
                    <Badge tone="primary">Comunidade ADS</Badge>
                    <h1 class="mt-4 sd-page-hero-title">Troca de conhecimento entre fases</h1>
                    <p class="mt-3 text-muted max-w-3xl">
                        Espaço para dúvidas, soluções e discussões com foco em aprendizado colaborativo.
                    </p>
                    <div class="mt-4 flex flex-wrap items-center gap-2 hero-safety-chips">
                        <Badge tone="success">Ambiente seguro</Badge>
                        <Badge tone="warning">Sem ofensas</Badge>
                        <Badge tone="info">Autoagressão não é incentivada</Badge>
                    </div>
                </div>
                <div class="community-hero-visual hidden md:flex items-center justify-end">
                    <img
                        src="/community-hero-illustration.svg"
                        alt="Ilustração de comunidade e colaboração"
                        class="community-hero-image"
                    >
                </div>
            </section>

            <section class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
                <div class="space-y-4 min-w-0">
                <article class="sd-card p-5 community-main-card">
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
                    <div v-if="topicScope !== 'reports'" class="mt-4">
                        <p class="sd-filter-legend">Buscar e ordenar</p>
                        <div class="sd-search-well sd-filter-stack">
                        <label class="sd-filter-field">
                            <span class="sd-filter-label">Busca</span>
                            <div class="sd-filter-search-row">
                                <input
                                    v-model.trim="filters.search"
                                    class="sd-input sd-input--search"
                                    placeholder="Buscar por título ou conteúdo"
                                    @keyup.enter="applyCommunityFilters"
                                >
                            </div>
                        </label>
                        <div class="sd-filter-grid-3">
                            <label class="sd-filter-field">
                                <span class="sd-filter-label">Categoria</span>
                                <select v-model="filters.category" class="sd-input sd-input--search">
                                    <option value="">Todas categorias</option>
                                    <option value="duvida">Dúvida</option>
                                    <option value="solucao">Solução</option>
                                    <option value="discussao">Discussão</option>
                                    <option value="showcase">Showcase</option>
                                </select>
                            </label>
                            <label class="sd-filter-field">
                                <span class="sd-filter-label">Fase</span>
                                <select v-model="filters.phase" class="sd-input sd-input--search">
                                    <option value="">Todas fases</option>
                                    <option value="1">Fase 1</option>
                                    <option value="2">Fase 2</option>
                                    <option value="3">Fase 3</option>
                                </select>
                            </label>
                            <label class="sd-filter-field">
                                <span class="sd-filter-label">Ordenação</span>
                                <select v-model="sortMode" class="sd-input sd-input--search">
                                    <option value="recent">Mais recentes</option>
                                    <option value="oldest">Mais antigos</option>
                                    <option value="mostReplies">Mais respostas</option>
                                    <option value="title">Título (A-Z)</option>
                                </select>
                            </label>
                        </div>
                        <div class="sd-filter-actions mt-1">
                            <button
                                type="button"
                                class="sd-button sd-button-primary"
                                :disabled="topicsFilterLoading"
                                @click="applyCommunityFilters"
                            >
                                {{ topicsFilterLoading ? 'Carregando...' : 'Aplicar filtros' }}
                            </button>
                            <button
                                type="button"
                                class="sd-button sd-button-secondary sd-filter-secondary-btn"
                                :disabled="topicsFilterLoading"
                                @click="clearCommunityFilters"
                            >
                                Limpar
                            </button>
                        </div>
                        </div>
                    </div>
                    <div v-if="auth.isAuthenticated" class="sd-scope-toolbar mt-3">
                        <div
                            class="sd-scope-segmented"
                            role="tablist"
                            aria-label="Escopo da lista de tópicos"
                        >
                            <button
                                type="button"
                                role="tab"
                                class="sd-scope-seg"
                                :class="{ 'sd-scope-seg--active': topicScope === 'all' }"
                                :aria-selected="topicScope === 'all'"
                                @click="topicScope = 'all'"
                            >
                                Todos os tópicos
                            </button>
                            <button
                                type="button"
                                role="tab"
                                class="sd-scope-seg"
                                :class="{ 'sd-scope-seg--active': topicScope === 'mine' }"
                                :aria-selected="topicScope === 'mine'"
                                @click="topicScope = 'mine'"
                            >
                                Meus tópicos
                            </button>
                            <button
                                v-if="isProfessorView"
                                type="button"
                                role="tab"
                                class="sd-scope-seg"
                                :class="{ 'sd-scope-seg--active': topicScope === 'removedAuthors' }"
                                :aria-selected="topicScope === 'removedAuthors'"
                                @click="topicScope = 'removedAuthors'"
                            >
                                Autores removidos
                            </button>
                            <button
                                v-if="isProfessorView"
                                type="button"
                                role="tab"
                                class="sd-scope-seg"
                                :class="{ 'sd-scope-seg--active': topicScope === 'reports' }"
                                :aria-selected="topicScope === 'reports'"
                                @click="topicScope = 'reports'"
                            >
                                Denúncias pendentes
                            </button>
                        </div>
                    </div>
                    <div class="mt-4 grid gap-3 sm:grid-cols-2 community-metrics-row">
                        <div class="sd-card-item p-3 community-metric-card community-metric-topics">
                            <div class="text-xs community-metric-label">Tópicos visíveis</div>
                            <strong class="text-2xl font-extrabold community-metric-value">{{ sortedTopics.length }}</strong>
                        </div>
                        <div class="sd-card-item p-3 community-metric-card community-metric-reports">
                            <div class="text-xs community-metric-label">Denúncias pendentes</div>
                            <strong class="text-2xl font-extrabold community-metric-value">{{ reports.length }}</strong>
                        </div>
                    </div>

                    <div v-if="topicScope !== 'reports'" class="mt-4 space-y-3">
                        <button
                            v-for="topic in paginatedTopics"
                            :key="topic.id"
                            class="w-full text-left sd-list-item p-4 community-topic-item"
                            :class="{
                                'community-topic-item--selected': selectedTopic?.topic?.id === topic.id
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
                        <div v-if="!sortedTopics.length" class="sd-notice">
                            {{ emptyTopicsMessage }}
                        </div>
                        <div v-else-if="canLoadMoreTopics" class="pt-1">
                            <button
                                class="sd-button sd-button-secondary w-full"
                                type="button"
                                @click="loadMoreTopics"
                            >
                                Carregar mais
                            </button>
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
                                por {{ report.reporter?.username || 'usuário' }} - {{ report.reason }}
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
                <aside class="space-y-4">
                    <article class="sd-card p-4 community-side-card">
                        <h3 class="sd-card-title">Atalhos</h3>
                        <div class="mt-3 space-y-2">
                            <button class="sd-list-item shortcut-item w-full text-left p-3" type="button" @click="sortMode = 'mostReplies'">
                                <span class="shortcut-content">
                                    <span class="shortcut-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                                            <path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                            <path d="M5 5h14v12H9l-4 3V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                    <span>Dúvidas respondidas</span>
                                </span>
                                <span class="shortcut-arrow" aria-hidden="true">›</span>
                            </button>
                            <button class="sd-list-item shortcut-item w-full text-left p-3" type="button" @click="rulesModalOpen = true">
                                <span class="shortcut-content">
                                    <span class="shortcut-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                                            <path d="M12 3l7 3v6c0 4.2-2.8 7.7-7 9-4.2-1.3-7-4.8-7-9V6l7-3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                                            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                    <span>Regras da comunidade</span>
                                </span>
                                <span class="shortcut-arrow" aria-hidden="true">›</span>
                            </button>
                        </div>
                    </article>
                    <article id="community-ranking" class="sd-card p-4 community-side-card community-ranking-card">
                        <div class="community-ranking-head flex items-center justify-between gap-2">
                            <h3 class="sd-card-title community-ranking-title">Ranking</h3>
                            <Badge tone="primary">Top 5</Badge>
                        </div>
                        <div class="mt-3 space-y-2.5">
                            <div
                                v-for="(player, index) in communityLeaderboard.slice(0, 5)"
                                :key="`${player.username}-${index}`"
                                class="sd-list-item p-3 flex items-center justify-between gap-2 community-ranking-row"
                                :class="{ 'community-ranking-row--first': index === 0 }"
                            >
                                <span class="text-sm min-w-0 truncate community-ranking-name">
                                    <span class="community-ranking-pos">#{{ index + 1 }}</span>
                                    {{ player.username }}
                                </span>
                                <span class="text-xs community-ranking-level">N{{ player.level }}</span>
                            </div>
                            <div v-if="!communityLeaderboard.length" class="sd-notice">
                                Ranking indisponível no momento.
                            </div>
                        </div>
                    </article>
                    <article class="sd-card p-4 community-side-card community-gamification-card">
                        <div class="flex items-center justify-between gap-2">
                            <h3 class="sd-card-title">Gamificação</h3>
                            <router-link to="/gamificacao" class="text-xs community-link">Ver perfil</router-link>
                        </div>
                        <div class="mt-3 community-xp-box">
                            <div class="text-xs text-muted">Nível estimado da comunidade</div>
                            <div class="mt-1 flex items-end justify-between gap-3">
                                <strong class="text-2xl font-extrabold">N{{ communityLevelEstimate }}</strong>
                                <span class="text-xs text-muted">{{ communityXpEstimate }} XP</span>
                            </div>
                        </div>
                        <div class="mt-3 grid grid-cols-2 gap-2">
                            <div class="sd-card-item p-3">
                                <div class="text-xs text-muted">Participantes</div>
                                <strong class="text-lg font-extrabold">{{ communityLeaderboard.length }}</strong>
                            </div>
                            <div class="sd-card-item p-3">
                                <div class="text-xs text-muted">Tópicos</div>
                                <strong class="text-lg font-extrabold">{{ sortedTopics.length }}</strong>
                            </div>
                        </div>
                        <div class="mt-3 grid grid-cols-2 gap-2">
                            <div class="sd-card-item p-3">
                                <div class="text-xs text-muted">Selos comunidade</div>
                                <strong class="text-lg font-extrabold">{{ communityBadgeCount }}</strong>
                            </div>
                            <div class="sd-card-item p-3">
                                <div class="text-xs text-muted">Colecionáveis</div>
                                <strong class="text-lg font-extrabold">{{ communityCollectiblesCount }}</strong>
                            </div>
                        </div>
                        <div v-if="communityBadges.length" class="mt-3">
                            <div class="text-xs text-muted mb-2">Seus selos recentes</div>
                            <div class="flex flex-wrap gap-2">
                                <Badge
                                    v-for="badge in communityBadges.slice(0, 3)"
                                    :key="badge.key"
                                    tone="success"
                                    :title="badge.title"
                                >
                                    {{ badge.title }}
                                </Badge>
                            </div>
                        </div>
                        <p v-else-if="auth.isAuthenticated" class="mt-3 text-xs text-muted">
                            Interaja na comunidade para desbloquear selos e itens colecionáveis.
                        </p>
                    </article>
                </aside>
            </section>

            <Transition name="topic-drawer">
                <div
                    v-if="topicDetailOpen && selectedTopic"
                    class="fixed inset-0 z-[95] community-overlay flex items-end md:items-stretch md:justify-end"
                    @click.self="closeTopicDetail"
                >
                    <section class="community-topic-drawer w-full md:w-[min(820px,94vw)] h-[100dvh] md:h-full border-t border-border md:border-l md:border-t-0 md:border-r-0 md:border-b-0 rounded-none md:rounded-none flex flex-col shadow-2xl">
                        <header class="p-4 md:p-5 community-topic-drawer-header sticky top-0 z-10">
                            <div class="flex items-center justify-between gap-3 flex-wrap">
                                <h2 class="sd-section-title community-drawer-title">{{ selectedTopic.topic.title }}</h2>
                                <div class="flex items-center gap-2 flex-wrap community-drawer-header-actions">
                                    <button
                                        v-if="canEditSelectedTopic"
                                        class="sd-button sd-button-secondary community-drawer-btn-edit"
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
                                    <button class="community-drawer-btn-dismiss" type="button" @click="closeTopicDetail">
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div class="flex-1 overflow-y-auto p-4 md:p-5 community-topic-drawer-body">
                            <div v-if="errorMessage" class="sd-error mb-3">{{ errorMessage }}</div>
                            <div v-if="notice" class="sd-notice mb-3">{{ notice }}</div>
                            <div
                                v-if="auth.user?.role === 'professor'"
                                class="flex flex-wrap items-center gap-2 community-drawer-mod-actions"
                            >
                                <button
                                    class="community-drawer-btn-ghost !py-1.5 !px-2.5 !text-xs"
                                    type="button"
                                    @click="moderate('topic', selectedTopic.topic.id, selectedTopic.topic.status === 'hidden' ? 'unhide' : 'hide')"
                                >
                                    {{ selectedTopic.topic.status === 'hidden' ? 'Reexibir tópico' : 'Ocultar tópico' }}
                                </button>
                            </div>
                            <div class="community-drawer-topic-card">
                                <p class="community-drawer-section-eyebrow">Pergunta</p>
                                <p class="community-drawer-topic-text whitespace-pre-wrap break-words">
                                    <template
                                        v-for="(part, index) in splitTextWithLinks(selectedTopic.topic.content)"
                                        :key="`topic-content-${index}`"
                                    >
                                        <a
                                            v-if="part.type === 'link'"
                                            :href="part.value"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="community-link inline-flex items-baseline gap-1 underline"
                                            title="Abrir link em nova aba"
                                        >
                                            <span class="break-all">{{ part.value }}</span>
                                            <IconExternalLink class="h-3.5 w-3.5 shrink-0 opacity-90" />
                                        </a>
                                        <span v-else>{{ part.value }}</span>
                                    </template>
                                </p>
                                <div class="mt-3 flex items-center gap-2 flex-wrap community-drawer-topic-badges">
                                    <Badge :tone="selectedTopic.topic.isAnonymous ? 'warning' : (selectedTopic.topic.author?.role === 'professor' ? 'pro' : 'info')">
                                        {{ selectedTopic.topic.isAnonymous ? 'Anônimo' : (selectedTopic.topic.author?.username || 'Usuário') }}
                                    </Badge>
                                    <Badge v-if="selectedTopic.topic.authorAccountRemoved" tone="warning">Autor removido</Badge>
                                    <Badge tone="neutral">{{ phaseLabel(selectedTopic.topic.phase) }}</Badge>
                                </div>
                            </div>
                            <p v-if="auth.isAuthenticated && !selectedTopic.topic.repliesOpen" class="text-sm community-drawer-hint">
                                <template v-if="selectedTopic.topic.authorAccountRemoved">
                                    Não é possível enviar novas respostas: o autor deste tópico removeu a conta.
                                </template>
                                <template v-else>Este tópico não aceita novas respostas.</template>
                            </p>
                            <div class="community-drawer-replies-section">
                                <p class="community-drawer-section-eyebrow community-drawer-replies-label">Respostas</p>
                                <div class="space-y-3 community-drawer-replies">
                                <article
                                    v-for="reply in selectedTopic.replies"
                                    :key="reply.id"
                                    class="community-drawer-reply"
                                    :class="{
                                        'community-drawer-reply--best': selectedTopic.topic.bestReplyId === reply.id
                                    }"
                                >
                                    <div class="flex items-center justify-between gap-3">
                                        <strong class="community-drawer-reply-author">{{ reply.author?.username || 'usuário' }}</strong>
                                        <div class="flex items-center gap-2">
                                            <Badge v-if="selectedTopic.topic.bestReplyId === reply.id" tone="success">Melhor resposta</Badge>
                                            <Badge v-else-if="reply.isOfficial" tone="success">Oficial</Badge>
                                        </div>
                                    </div>
                                    <p class="mt-2 text-sm community-drawer-reply-text whitespace-pre-wrap break-words">
                                        <template
                                            v-for="(part, index) in splitTextWithLinks(reply.content)"
                                            :key="`reply-content-${reply.id}-${index}`"
                                        >
                                            <a
                                                v-if="part.type === 'link'"
                                                :href="part.value"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="community-link inline-flex items-baseline gap-1 underline"
                                                title="Abrir link em nova aba"
                                            >
                                                <span class="break-all">{{ part.value }}</span>
                                                <IconExternalLink class="h-3.5 w-3.5 shrink-0 opacity-90" />
                                            </a>
                                            <span v-else>{{ part.value }}</span>
                                        </template>
                                    </p>
                                    <div class="mt-3 flex items-center gap-2 flex-wrap community-drawer-reply-actions">
                                        <button
                                            v-if="auth.isAuthenticated"
                                            class="community-drawer-btn-vote"
                                            type="button"
                                            :disabled="loadingAction"
                                            @click="toggleVote(reply.id)"
                                        >
                                            {{ reply.viewerVoted ? 'Remover voto' : 'Votar útil' }} ({{ reply.votesCount || 0 }})
                                        </button>
                                        <button
                                            v-if="auth.isAuthenticated"
                                            class="community-drawer-btn-ghost !py-1.5 !px-2.5 !text-xs"
                                            type="button"
                                            :disabled="loadingAction"
                                            @click="reportReply(reply.id)"
                                        >
                                            Denunciar
                                        </button>
                                        <button
                                            v-if="canSetBestReply(reply)"
                                            class="community-drawer-btn-ghost !py-1.5 !px-2.5 !text-xs"
                                            type="button"
                                            :disabled="loadingAction"
                                            @click="setBestReply(reply.id)"
                                        >
                                            Marcar melhor resposta
                                        </button>
                                        <button
                                            v-if="auth.user?.role === 'professor'"
                                            class="community-drawer-btn-ghost !py-1.5 !px-2.5 !text-xs"
                                            type="button"
                                            :disabled="loadingAction"
                                            @click="moderate('reply', reply.id, reply.isHidden ? 'unhide' : 'hide')"
                                        >
                                            {{ reply.isHidden ? 'Reexibir resposta' : 'Ocultar resposta' }}
                                        </button>
                                    </div>
                                </article>
                                <div v-if="!selectedTopic.replies.length" class="community-drawer-empty-replies">
                                    Sem respostas ainda.
                                </div>
                                </div>
                            </div>
                        </div>

                        <footer
                            v-if="auth.isAuthenticated && selectedTopic.topic.repliesOpen"
                            class="p-4 md:p-5 community-topic-drawer-footer"
                        >
                            <p class="community-drawer-compose-label">Sua resposta</p>
                            <form class="community-drawer-compose flex gap-2 flex-col sm:flex-row" @submit.prevent="submitReply">
                                <input
                                    v-model.trim="newReply"
                                    class="sd-input sd-input--search flex-1 min-w-0"
                                    placeholder="Escreva sua resposta"
                                    :disabled="loadingReply || loadingAction"
                                >
                                <button
                                    class="sd-button sd-button-primary shrink-0 community-drawer-btn-send"
                                    type="submit"
                                    :disabled="loadingReply || loadingAction || !newReply"
                                >
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

            <BaseModal
                v-model="rulesModalOpen"
                title="Regras da comunidade"
                aria-label="Regras da comunidade"
                max-width="2xl"
            >
                <div class="mt-4 space-y-3">
                    <p class="text-sm text-muted">
                        Este espaço é para aprendizado colaborativo. Respeito e segurança são inegociáveis.
                    </p>
                    <article class="sd-list-item p-3">
                        <h4 class="font-semibold">1) Respeite as pessoas</h4>
                        <p class="text-sm text-muted mt-1">
                            Não publique ofensas, ataques pessoais, assédio ou discriminação.
                        </p>
                    </article>
                    <article class="sd-list-item p-3">
                        <h4 class="font-semibold">2) Mantenha foco técnico</h4>
                        <p class="text-sm text-muted mt-1">
                            Dúvidas, soluções e discussões devem ter contexto e contribuir para o aprendizado.
                        </p>
                    </article>
                    <article class="sd-list-item p-3">
                        <h4 class="font-semibold">3) Sem conteúdo inadequado</h4>
                        <p class="text-sm text-muted mt-1">
                            Conteúdos ofensivos, de ódio, ameaça ou incentivo a autoagressão serão removidos.
                        </p>
                    </article>
                    <article class="sd-list-item p-3">
                        <h4 class="font-semibold">4) Denuncie com responsabilidade</h4>
                        <p class="text-sm text-muted mt-1">
                            Use denúncia quando necessário. A moderação revisa os casos com prioridade.
                        </p>
                    </article>
                </div>
            </BaseModal>
        </PageContainer>
        <Footer variant="community" />
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
import { useRewardToast } from '../composables/useRewardToast';
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
const rulesModalOpen = ref(false);
const isEditingTopic = ref(false);
const editingTopicId = ref(null);
const reports = ref([]);
const notice = ref('');
const errorMessage = ref('');
const newReply = ref('');
const topicScope = ref('all');
const sortMode = ref('recent');
const topicsPageSize = ref(6);
const topicsFilterLoading = ref(false);
const communityLeaderboard = ref([]);
const communityBadges = ref([]);
const communityCollectiblesCount = ref(0);
const { showRewardToast } = useRewardToast();

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

function resolveTopicDate(topic) {
    const raw = topic?.createdAt || topic?.created_at || topic?.updatedAt || topic?.updated_at;
    const d = raw ? new Date(raw) : null;
    return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
}

const sortedTopics = computed(() => {
    const list = [...visibleTopics.value];
    if (sortMode.value === 'title') {
        return list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    }
    if (sortMode.value === 'mostReplies') {
        return list.sort((a, b) => Number(b.repliesCount || 0) - Number(a.repliesCount || 0));
    }
    if (sortMode.value === 'oldest') {
        return list.sort((a, b) => resolveTopicDate(a) - resolveTopicDate(b));
    }
    return list.sort((a, b) => resolveTopicDate(b) - resolveTopicDate(a));
});

const communityXpEstimate = computed(() =>
    communityLeaderboard.value
        .slice(0, 5)
        .reduce((sum, player) => sum + Number(player?.xpTotal || 0), 0)
);

const communityBadgeCount = computed(() => communityBadges.value.length);

const communityLevelEstimate = computed(() => {
    const top = communityLeaderboard.value.slice(0, 5);
    if (!top.length) return 1;
    const total = top.reduce((sum, player) => sum + Number(player?.level || 1), 0);
    return Math.max(1, Math.round(total / top.length));
});

const paginatedTopics = computed(() => sortedTopics.value.slice(0, topicsPageSize.value));
const canLoadMoreTopics = computed(() => paginatedTopics.value.length < sortedTopics.value.length);

function loadMoreTopics() {
    topicsPageSize.value += 6;
}

function scrollToRanking() {
    const rankingEl = document.getElementById('community-ranking');
    if (!rankingEl) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
    }
    rankingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

async function refreshTopicsListAfterFilterChange() {
    await loadTopics();
    topicsPageSize.value = 6;
    if (selectedTopic.value) {
        const selectedId = selectedTopic.value.topic?.id;
        const stillVisible = sortedTopics.value.some((topic) => topic.id === selectedId);
        if (!stillVisible) {
            topicDetailOpen.value = false;
            selectedTopic.value = null;
        }
    }
}

async function applyCommunityFilters() {
    topicsFilterLoading.value = true;
    try {
        await refreshTopicsListAfterFilterChange();
    } finally {
        topicsFilterLoading.value = false;
    }
}

async function clearCommunityFilters() {
    filters.value = { search: '', category: '', phase: '' };
    sortMode.value = 'recent';
    topicsFilterLoading.value = true;
    try {
        await refreshTopicsListAfterFilterChange();
    } finally {
        topicsFilterLoading.value = false;
    }
}

async function loadReports() {
    if (auth.user?.role !== 'professor') return;
    const { data } = await api.get('/community/reports', {
        params: { status: 'pending' }
    });
    reports.value = data;
}

async function loadCommunitySidebar() {
    try {
        const [leaderboardRes, gamificationRes, collectiblesRes] = await Promise.all([
            api.get('/gamification/leaderboard'),
            auth.isAuthenticated ? api.get('/gamification/me') : Promise.resolve({ data: null }),
            auth.isAuthenticated ? api.get('/events/collectibles/me') : Promise.resolve({ data: null })
        ]);
        communityLeaderboard.value = Array.isArray(leaderboardRes?.data) ? leaderboardRes.data : [];
        const allBadges = Array.isArray(gamificationRes?.data?.badges) ? gamificationRes.data.badges : [];
        communityBadges.value = allBadges.filter(
            (badge) => badge?.unlocked && String(badge?.key || '').startsWith('community_')
        );
        const collectibleItems = Array.isArray(collectiblesRes?.data?.items) ? collectiblesRes.data.items : [];
        communityCollectiblesCount.value = collectibleItems.length;
    } catch {
        communityLeaderboard.value = [];
        communityBadges.value = [];
        communityCollectiblesCount.value = 0;
    }
}

function buildCommunityRewardNotice({ previousBadgeKeys, previousCollectiblesCount, actionLabel }) {
    const currentBadgeKeys = new Set(
        (communityBadges.value || []).map((badge) => String(badge?.key || '').trim()).filter(Boolean)
    );
    const unlockedNow = (communityBadges.value || []).filter(
        (badge) => badge?.key && !previousBadgeKeys.has(String(badge.key))
    );
    const collectibleDelta = Math.max(0, Number(communityCollectiblesCount.value || 0) - Number(previousCollectiblesCount || 0));

    if (unlockedNow.length === 0 && collectibleDelta === 0) return null;

    if (unlockedNow.length > 0) {
        const first = unlockedNow[0];
        const extra = unlockedNow.length > 1 ? ` +${unlockedNow.length - 1} novo(s)` : '';
        return {
            kind: 'badge',
            icon: '🏆',
            message: `Parabéns! ${actionLabel} Você acabou de desbloquear o selo "${first.title}"${extra}. Continue participando para ganhar novas conquistas.`
        };
    }

    if (collectibleDelta > 0) {
        return {
            kind: 'collectible',
            icon: '🎁',
            message: `Parabéns! ${actionLabel} Você desbloqueou ${collectibleDelta} item(ns) colecionável(is) da comunidade.`
        };
    }

    // Fallback defensivo.
    if (currentBadgeKeys.size > previousBadgeKeys.size) {
        return {
            kind: 'badge',
            icon: '🏆',
            message: `Parabéns! ${actionLabel} Você desbloqueou uma nova conquista da comunidade.`
        };
    }
    return null;
}

async function refreshCommunityProgressAndAnnounce(actionLabel) {
    if (!auth.isAuthenticated) return;
    const previousBadgeKeys = new Set(
        (communityBadges.value || []).map((badge) => String(badge?.key || '').trim()).filter(Boolean)
    );
    const previousCollectiblesCount = Number(communityCollectiblesCount.value || 0);
    await loadCommunitySidebar();
    const rewardNotice = buildCommunityRewardNotice({
        previousBadgeKeys,
        previousCollectiblesCount,
        actionLabel
    });
    if (rewardNotice?.message) {
        notice.value = rewardNotice.message;
        showRewardToast(rewardNotice);
    }
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
            await refreshCommunityProgressAndAnnounce('Ao criar este tópico,');
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
        await refreshCommunityProgressAndAnnounce('Com esta interação,');
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
    topicsPageSize.value = 6;
    if (scope === 'reports') {
        topicDetailOpen.value = false;
        selectedTopic.value = null;
        await loadReports();
        return;
    }
    await refreshTopicsListAfterFilterChange();
});

watch([sortMode, () => filters.value.search, () => filters.value.category, () => filters.value.phase], () => {
    topicsPageSize.value = 6;
});

watch(
    () => auth.isAuthenticated,
    async () => {
        await loadCommunitySidebar();
    }
);

onMounted(async () => {
    document.addEventListener('keydown', handleTopicDetailEscape);
    await loadTopics();
    await loadReports();
    await loadCommunitySidebar();
});

onBeforeUnmount(() => {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleTopicDetailEscape);
});
</script>

<style scoped>
.community-topic-drawer {
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--surface) 96%, var(--primary-2) 4%) 0%,
        color-mix(in srgb, var(--bg) 55%, var(--surface)) 28%,
        color-mix(in srgb, var(--surface-2) 12%, var(--surface)) 100%
    );
    border-color: color-mix(in srgb, var(--primary-2) 22%, var(--border)) !important;
    box-shadow:
        -12px 0 40px color-mix(in srgb, var(--primary) 8%, transparent),
        inset 4px 0 0 0 color-mix(in srgb, var(--primary-2) 45%, transparent);
}

.community-topic-drawer-header {
    background: linear-gradient(
        125deg,
        color-mix(in srgb, var(--surface) 90%, var(--primary) 8%),
        color-mix(in srgb, var(--surface) 94%, var(--primary-2) 6%)
    );
    border-bottom: 1px solid color-mix(in srgb, var(--primary-2) 18%, var(--border));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--primary) 5%, transparent);
}

.community-topic-drawer-body {
    background: transparent;
}

.community-topic-drawer-footer {
    background: linear-gradient(
        0deg,
        color-mix(in srgb, var(--primary) 10%, var(--surface-2)),
        color-mix(in srgb, var(--surface) 96%, var(--primary-2) 4%)
    );
    border-top: 1px solid color-mix(in srgb, var(--primary) 16%, var(--border));
    box-shadow: 0 -10px 28px color-mix(in srgb, var(--primary) 4%, transparent);
}

.community-drawer-title {
    font-size: clamp(1.15rem, 2.8vw, 1.45rem);
    color: color-mix(in srgb, var(--text) 94%, var(--primary-2) 6%);
    line-height: 1.25;
}

.community-drawer-btn-dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.25;
    border-radius: 0.65rem;
    cursor: pointer;
    border: 1px solid color-mix(in srgb, var(--text) 14%, var(--border));
    background: color-mix(in srgb, var(--surface) 72%, transparent);
    color: color-mix(in srgb, var(--text) 88%, transparent);
    transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease;
}

.community-drawer-btn-dismiss:hover {
    background: color-mix(in srgb, var(--surface-2) 55%, var(--surface));
    border-color: color-mix(in srgb, var(--text) 22%, var(--border));
    color: var(--text);
}

.community-drawer-btn-dismiss:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
}

.community-drawer-btn-edit {
    border-color: color-mix(in srgb, var(--primary) 24%, var(--border));
    background: color-mix(in srgb, var(--primary) 8%, var(--surface));
}

.community-drawer-btn-edit:hover {
    background: color-mix(in srgb, var(--primary) 14%, var(--surface-2));
}

.community-drawer-section-eyebrow {
    margin: 0 0 0.45rem;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--primary-2) 38%, var(--muted));
}

.community-drawer-mod-actions {
    margin-top: 0.35rem;
    margin-bottom: 0.15rem;
}

.community-drawer-topic-card {
    margin-top: 0.85rem;
    margin-bottom: 0.5rem;
    position: relative;
    border-radius: 0.95rem;
    border: 1px solid color-mix(in srgb, var(--info) 22%, var(--border));
    padding: 1rem 1.05rem 1.05rem 1.15rem;
    background: linear-gradient(
        105deg,
        color-mix(in srgb, var(--surface) 92%, var(--info) 7%),
        color-mix(in srgb, var(--surface-2) 20%, var(--surface))
    );
    box-shadow: 0 6px 20px color-mix(in srgb, var(--info) 7%, transparent);
}

.community-drawer-topic-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65rem;
    bottom: 0.65rem;
    width: 4px;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--info), var(--primary));
    opacity: 0.9;
}

.community-drawer-topic-text {
    margin: 0;
    font-size: 0.98rem;
    line-height: 1.6;
    color: color-mix(in srgb, var(--text) 96%, var(--info));
}

.community-drawer-topic-badges {
    padding-top: 0.15rem;
}

.community-drawer-hint {
    margin-top: 1.1rem;
    margin-bottom: 1.4rem;
    padding: 0.75rem 0.95rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--warning) 22%, var(--border));
    background: color-mix(in srgb, var(--warning) 8%, var(--surface));
    color: color-mix(in srgb, var(--text) 85%, var(--warning));
}

.community-drawer-replies-section {
    margin-top: 1.85rem;
    padding-top: 0.4rem;
}

.community-drawer-replies-label {
    margin-top: 0;
    margin-bottom: 0.75rem;
    color: color-mix(in srgb, var(--text) 55%, var(--muted));
}

.community-drawer-reply {
    border-radius: 0.9rem;
    border: 1px solid color-mix(in srgb, var(--border) 78%, var(--text) 8%);
    padding: 0.85rem 0.95rem 0.95rem;
    background: color-mix(in srgb, var(--surface) 97%, var(--surface-elevated) 3%);
    box-shadow: 0 2px 12px color-mix(in srgb, var(--text) 4%, transparent);
    transition: border-color 160ms ease, box-shadow 160ms ease;
}

.community-drawer-reply:hover {
    border-color: color-mix(in srgb, var(--primary-2) 20%, var(--border));
}

.community-drawer-reply--best {
    border-color: color-mix(in srgb, var(--success) 38%, var(--border));
    background: linear-gradient(
        98deg,
        color-mix(in srgb, var(--success) 9%, var(--surface)),
        color-mix(in srgb, var(--surface) 96%, var(--success) 4%)
    );
    box-shadow: 0 4px 18px color-mix(in srgb, var(--success) 10%, transparent);
}

.community-drawer-reply-author {
    font-size: 0.92rem;
    color: color-mix(in srgb, var(--text) 92%, var(--primary));
}

.community-drawer-reply-text {
    color: color-mix(in srgb, var(--text) 94%, transparent);
    line-height: 1.55;
}

.community-drawer-reply-actions {
    gap: 0.45rem;
}

.community-drawer-btn-vote {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.45rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 0.65rem;
    border: 0;
    cursor: pointer;
    color: #ffffff;
    background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary-2) 85%, var(--primary)));
    box-shadow: 0 4px 14px color-mix(in srgb, var(--primary) 28%, transparent);
    transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
}

.community-drawer-btn-vote:hover:not(:disabled) {
    transform: translateY(-1px);
    filter: brightness(1.03);
    box-shadow: 0 6px 18px color-mix(in srgb, var(--primary) 34%, transparent);
}

.community-drawer-btn-vote:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.community-drawer-btn-vote:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring), 0 4px 14px color-mix(in srgb, var(--primary) 28%, transparent);
}

.community-drawer-btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: 0.65rem;
    cursor: pointer;
    border: 1px solid color-mix(in srgb, var(--text) 10%, var(--border));
    background: color-mix(in srgb, var(--surface) 82%, transparent);
    color: color-mix(in srgb, var(--text) 88%, var(--muted));
    transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease;
}

.community-drawer-btn-ghost:hover:not(:disabled) {
    background: color-mix(in srgb, var(--surface-2) 50%, var(--surface));
    border-color: color-mix(in srgb, var(--primary-2) 22%, var(--border));
    color: var(--text);
}

.community-drawer-btn-ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.community-drawer-btn-ghost:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
}

.community-drawer-empty-replies {
    border-radius: 0.85rem;
    border: 1px dashed color-mix(in srgb, var(--primary-2) 24%, var(--border));
    padding: 0.9rem 1rem;
    font-size: 0.88rem;
    color: var(--muted);
    background: color-mix(in srgb, var(--surface) 94%, var(--primary-2) 4%);
}

.community-drawer-compose-label {
    margin: 0 0 0.5rem;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--primary) 32%, var(--muted));
}

.community-drawer-compose {
    align-items: stretch;
}

@media (max-width: 639px) {
    .community-drawer-btn-send {
        width: 100%;
        justify-content: center;
    }
}

/* Fundo sólido (sem gradiente): lavanda suave, coerente com o tema da comunidade */
.community-hero,
.community-main-card,
.community-side-card {
    background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--primary-2) 11%, var(--surface)),
        color-mix(in srgb, var(--surface) 96%, var(--primary) 4%)
    );
}

.community-metrics-row {
    align-items: stretch;
}

.community-metric-card {
    border-width: 1px;
    border-style: solid;
    background: var(--surface);
}

.community-metric-label {
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--muted);
}

.community-metric-value {
    display: block;
    margin-top: 0.2rem;
    letter-spacing: -0.02em;
}

.community-metric-topics {
    border-color: color-mix(in srgb, var(--info) 32%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--info) 9%, var(--surface)),
        color-mix(in srgb, var(--surface) 94%, var(--info) 4%)
    );
}

.community-metric-topics .community-metric-value {
    color: color-mix(in srgb, var(--info) 32%, var(--text));
}

.community-metric-reports {
    border-color: color-mix(in srgb, var(--warning) 38%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--warning) 10%, var(--surface)),
        color-mix(in srgb, var(--surface) 93%, var(--warning) 5%)
    );
}

.community-metric-reports .community-metric-value {
    color: color-mix(in srgb, var(--warning) 28%, var(--text));
}

.community-hero-visual {
    min-height: 150px;
}

.community-hero-image {
    width: 100%;
    max-width: 240px;
    height: auto;
    opacity: 0.95;
    filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.16));
}

.hero-safety-chips :deep(.sd-badge) {
    font-size: 0.75rem;
}

.community-topic-item {
    position: relative;
    padding-left: 1.35rem;
    border-color: color-mix(in srgb, var(--primary-2) 18%, var(--border));
    background: linear-gradient(
        98deg,
        color-mix(in srgb, var(--surface) 91%, var(--primary-2) 7%),
        color-mix(in srgb, var(--surface-2) 40%, var(--surface))
    );
    transition: transform 140ms ease, border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease;
}

.community-topic-item::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0.65rem;
    bottom: 0.65rem;
    width: 3px;
    border-radius: 999px;
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--primary-2) 82%, #fff) 0%,
        var(--primary) 45%,
        color-mix(in srgb, var(--primary-2) 65%, var(--primary)) 100%
    );
    box-shadow:
        0 0 0 0.5px color-mix(in srgb, var(--primary) 28%, transparent),
        2px 0 14px color-mix(in srgb, var(--primary) 18%, transparent);
    opacity: 0.9;
    transition: opacity 140ms ease, width 140ms ease, box-shadow 140ms ease, filter 140ms ease;
}

.community-topic-item:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--primary) 34%, var(--border));
    box-shadow: 0 8px 22px color-mix(in srgb, var(--primary-2) 12%, transparent);
}

.community-topic-item:hover::before {
    opacity: 1;
    filter: brightness(1.05);
    box-shadow:
        0 0 0 0.5px color-mix(in srgb, var(--primary) 38%, transparent),
        2px 0 18px color-mix(in srgb, var(--primary) 24%, transparent);
}

.community-topic-item--selected {
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border)) !important;
    background: linear-gradient(
        98deg,
        color-mix(in srgb, var(--primary) 9%, var(--surface)),
        color-mix(in srgb, var(--surface) 95%, var(--primary-2) 5%)
    ) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 22%, transparent);
}

.community-topic-item--selected::before {
    opacity: 1;
    width: 3.5px;
    left: 0.46rem;
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--primary-2) 70%, #fff) 0%,
        var(--primary) 38%,
        color-mix(in srgb, var(--primary-2) 45%, var(--primary)) 100%
    );
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--primary) 42%, transparent),
        2px 0 20px color-mix(in srgb, var(--primary) 30%, transparent);
    filter: none;
}

.community-ranking-card {
    border-color: color-mix(in srgb, var(--primary) 34%, var(--border));
    background: linear-gradient(
        168deg,
        color-mix(in srgb, var(--primary) 11%, var(--surface-2)),
        color-mix(in srgb, var(--surface) 90%, var(--primary-2) 7%) 48%,
        color-mix(in srgb, var(--surface-2) 50%, var(--surface))
    );
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 44%, transparent),
        0 8px 26px color-mix(in srgb, var(--primary) 11%, transparent);
}

.community-ranking-head {
    padding-bottom: 0.55rem;
    margin-bottom: 0.1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--primary) 26%, var(--border));
}

.community-ranking-title {
    color: color-mix(in srgb, var(--text) 88%, var(--primary));
}

.community-ranking-row {
    border-radius: 0.75rem;
    border-color: color-mix(in srgb, var(--primary) 22%, var(--border));
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--surface-2) 35%, var(--surface)),
        color-mix(in srgb, var(--surface) 90%, var(--primary) 4%)
    );
    box-shadow:
        0 1px 0 color-mix(in srgb, white 50%, transparent),
        0 4px 14px color-mix(in srgb, var(--primary) 7%, transparent);
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.community-ranking-row:hover {
    border-color: color-mix(in srgb, var(--primary) 34%, var(--border));
    box-shadow:
        0 1px 0 color-mix(in srgb, white 55%, transparent),
        0 6px 18px color-mix(in srgb, var(--primary) 10%, transparent);
}

/* 1º lugar: destaque na mesma família cromática do badge de nível (primary), sem laranja */
.community-ranking-row--first {
    border-color: color-mix(in srgb, var(--primary) 48%, var(--border));
    background: linear-gradient(
        125deg,
        color-mix(in srgb, var(--primary) 16%, var(--surface)),
        color-mix(in srgb, var(--surface) 84%, var(--primary-2) 11%)
    );
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--primary) 16%, transparent),
        0 6px 20px color-mix(in srgb, var(--primary) 15%, transparent);
}

.community-ranking-row--first:hover {
    border-color: color-mix(in srgb, var(--primary) 58%, var(--border));
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--primary) 22%, transparent),
        0 8px 24px color-mix(in srgb, var(--primary) 18%, transparent);
}

.community-ranking-pos {
    display: inline-block;
    min-width: 1.65rem;
    margin-right: 0.35rem;
    font-weight: 800;
    color: color-mix(in srgb, var(--primary) 42%, var(--text));
}

.community-ranking-row--first .community-ranking-pos {
    color: color-mix(in srgb, var(--primary) 55%, var(--text));
}

.community-ranking-level {
    flex-shrink: 0;
    font-weight: 700;
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    color: color-mix(in srgb, var(--primary-2) 55%, var(--text));
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--primary) 36%, var(--border));
    background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--primary) 16%, var(--surface)),
        color-mix(in srgb, var(--primary-2) 12%, var(--surface-2))
    );
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 35%, transparent),
        0 1px 3px color-mix(in srgb, var(--primary) 12%, transparent);
}

.community-gamification-card {
    border-color: color-mix(in srgb, var(--primary-2) 24%, var(--border));
}

.community-xp-box {
    border-radius: 0.85rem;
    border: 1px solid color-mix(in srgb, var(--primary-2) 26%, var(--border));
    padding: 0.7rem 0.75rem;
    background: color-mix(in srgb, var(--primary-2) 12%, var(--surface));
}

.shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.65rem;
    border-color: color-mix(in srgb, var(--primary) 20%, var(--border));
}

.shortcut-content {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
}

.shortcut-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 999px;
    color: color-mix(in srgb, var(--primary-2) 78%, white);
    background: color-mix(in srgb, var(--primary-2) 16%, transparent);
}

.shortcut-arrow {
    color: color-mix(in srgb, var(--text) 72%, transparent);
    font-size: 1.05rem;
    font-weight: 700;
}

.community-overlay {
    background: var(--modal-overlay);
}

.community-link {
    color: color-mix(in srgb, var(--primary-2) 76%, var(--text));
}

.community-link:hover {
    color: color-mix(in srgb, var(--primary-2) 92%, var(--text));
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
    .community-reward-toast {
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
        top: 0.75rem;
    }

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
