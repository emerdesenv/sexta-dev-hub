<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer>
            <main class="py-8">
                <div class="grid gap-6">
                    <section class="professor-hero sd-card sd-card-section p-5 md:p-6 relative overflow-hidden">
                        <div class="professor-hero-accent" aria-hidden="true" />
                        <div class="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                            <div class="professor-hero-intro flex min-w-0 flex-1 gap-4 lg:min-w-0 lg:flex-1 lg:basis-0">
                                <div
                                    class="professor-hero-avatar shrink-0"
                                    role="img"
                                    :aria-label="`Iniciais do usuário ${auth.user?.username || ''}`"
                                    :title="`Iniciais de «${auth.user?.username || ''}»`"
                                >
                                    {{ heroInitials }}
                                </div>
                                <div class="min-w-0 flex-1 pt-0.5">
                                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                        <span class="sd-badge sd-badge-primary">Painel do professor</span>
                                    </div>
                                    <p class="mt-2.5 text-sm text-muted leading-snug sm:max-w-xl">
                                        Conteúdo, turma e campanhas.
                                    </p>
                                </div>
                            </div>
                            <div
                                class="professor-hero-stats grid w-full shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:w-auto lg:flex-none lg:grid-cols-5 lg:self-start"
                            >
                                <button
                                    v-for="tile in heroQuickStats"
                                    :key="tile.section"
                                    type="button"
                                    class="professor-hero-stat"
                                    :class="{ 'professor-hero-stat--active': activeSection === tile.section }"
                                    @click="activeSection = tile.section"
                                >
                                    <span class="professor-hero-stat-label">{{ tile.label }}</span>
                                    <span class="professor-hero-stat-value tabular-nums">{{ tile.value }}</span>
                                    <span class="professor-hero-stat-hint">{{ tile.hint }}</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section class="grid gap-6 min-w-0">
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 min-w-0">
                            <button
                                type="button"
                                class="sd-button px-3 py-2 text-[0.8rem] sm:text-sm min-h-[44px] w-full lg:w-auto text-center leading-tight whitespace-normal"
                                :class="activeSection === 'metrics' ? 'sd-button-primary' : 'sd-button-secondary'"
                                @click="activeSection = 'metrics'"
                            >
                                <span class="sm:hidden">Métricas</span>
                                <span class="hidden sm:inline">Métricas de gamificação</span>
                            </button>
                            <button
                                type="button"
                                class="sd-button px-3 py-2 text-[0.8rem] sm:text-sm min-h-[44px] w-full lg:w-auto text-center leading-tight whitespace-normal"
                                :class="activeSection === 'events' ? 'sd-button-primary' : 'sd-button-secondary'"
                                @click="activeSection = 'events'"
                            >
                                <span class="sm:hidden">Eventos</span>
                                <span class="hidden sm:inline">Eventos recentes</span>
                            </button>
                            <button
                                type="button"
                                class="sd-button px-3 py-2 text-[0.8rem] sm:text-sm min-h-[44px] w-full lg:w-auto text-center leading-tight whitespace-normal"
                                :class="activeSection === 'episodes' ? 'sd-button-primary' : 'sd-button-secondary'"
                                @click="activeSection = 'episodes'"
                            >
                                <span class="sm:hidden">Episódios</span>
                                <span class="hidden sm:inline">Episódios cadastrados</span>
                            </button>
                            <button
                                type="button"
                                class="sd-button px-3 py-2 text-[0.8rem] sm:text-sm min-h-[44px] w-full lg:w-auto text-center leading-tight whitespace-normal"
                                :class="activeSection === 'limited-events' ? 'sd-button-primary' : 'sd-button-secondary'"
                                @click="activeSection = 'limited-events'"
                            >
                                <span class="sm:hidden">Relâmpago</span>
                                <span class="hidden sm:inline">Eventos relâmpago</span>
                            </button>
                            <button
                                type="button"
                                class="sd-button px-3 py-2 text-[0.8rem] sm:text-sm min-h-[44px] w-full lg:w-auto text-center leading-tight whitespace-normal"
                                :class="activeSection === 'students' ? 'sd-button-primary' : 'sd-button-secondary'"
                                @click="activeSection = 'students'"
                            >
                                Alunos
                            </button>
                        </div>

                        <div v-if="activeSection === 'metrics'" class="sd-card p-4 md:p-6 min-w-0">
                            <div class="flex justify-between items-center gap-3 flex-wrap mb-4">
                                <h2 class="sd-section-title">Métricas de gamificação</h2>
                                <button
                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                    type="button"
                                    :disabled="loadingMetrics"
                                    @click="loadMetrics"
                                >
                                    {{ loadingMetrics ? 'Atualizando...' : 'Atualizar métricas' }}
                                </button>
                            </div>

                            <div v-if="metricsError" class="sd-error">
                                {{ metricsError }}
                            </div>

                            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Usuários ativos</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.usersWithProfile }}</strong>
                                </div>
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Episódios concluídos</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.completedEpisodes }}</strong>
                                </div>
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Missões resgatadas</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.missionClaims }}</strong>
                                </div>
                                <div class="sd-card-item p-4">
                                    <div class="text-sm text-muted">Recomp. trocadas</div>
                                    <strong class="text-2xl font-bold">{{ metrics.totals.rewardsRedeemed }}</strong>
                                </div>
                            </div>

                            <div class="mt-6">
                                <h3 class="sd-card-title">Desempenho em atividades avaliativas</h3>
                                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-3">
                                    <div class="sd-card-item p-4">
                                        <div class="text-sm text-muted">Atividades avaliativas</div>
                                        <strong class="text-2xl font-bold">{{ metrics.assessmentSummary.totalAssessmentEpisodes }}</strong>
                                    </div>
                                    <div class="sd-card-item p-4">
                                        <div class="text-sm text-muted">Média de aprovação</div>
                                        <strong class="text-2xl font-bold">{{ metrics.assessmentSummary.averagePassRate }}%</strong>
                                    </div>
                                    <div class="sd-card-item p-4">
                                        <div class="text-sm text-muted">Média de nota</div>
                                        <strong class="text-2xl font-bold">{{ metrics.assessmentSummary.averageScore }}%</strong>
                                    </div>
                                    <div class="sd-card-item p-4">
                                        <div class="text-sm text-muted">Tentativas por aluno</div>
                                        <strong class="text-2xl font-bold">{{ metrics.assessmentSummary.averageAttemptsPerStudent }}</strong>
                                    </div>
                                </div>
                                <div class="mt-4" v-if="metrics.assessmentEpisodes.length">
                                    <DataTable
                                        :columns="assessmentColumns"
                                        :rows="assessmentRows"
                                        row-key="episodeId"
                                        :search-keys="['title', 'modeLabel']"
                                        search-placeholder="Buscar atividade..."
                                        @row-click="openAssessmentDetails"
                                    />
                                </div>
                                <div v-else class="sd-notice mt-4">
                                    Nenhuma atividade encontrada com os filtros selecionados.
                                </div>
                            </div>

                        </div>

                        <div v-if="activeSection === 'events'" class="sd-card p-4 md:p-6 min-w-0">
                            <div class="flex justify-between items-center gap-3 flex-wrap mb-4">
                                <h2 class="sd-section-title">
                                    Eventos recentes
                                    <span class="text-sm text-muted">({{ metrics.recentEvents.length }})</span>
                                </h2>
                                <button
                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                    type="button"
                                    :disabled="loadingMetrics"
                                    @click="loadMetrics"
                                >
                                    {{ loadingMetrics ? 'Atualizando...' : 'Atualizar eventos' }}
                                </button>
                            </div>
                            <div v-if="metricsError" class="sd-error">
                                {{ metricsError }}
                            </div>
                            <div class="max-h-80 overflow-y-auto overscroll-contain pr-1">
                                <div class="space-y-2" v-if="metrics.recentEvents.length">
                                    <div
                                        v-for="(event, index) in metrics.recentEvents"
                                        :key="event.id || `${event.username}-${event.type}-${index}`"
                                        class="sd-list-item p-3 flex justify-between gap-4 flex-wrap"
                                    >
                                        <span class="text-sm break-words">
                                            <b>{{ event.username }}</b> • {{ event.type }}
                                        </span>
                                        <span class="text-xs text-muted">
                                            XP {{ event.xpDelta >= 0 ? '+' : '' }}{{ event.xpDelta }} • Moedas {{ event.coinsDelta >= 0 ? '+' : '' }}{{ event.coinsDelta }}
                                        </span>
                                    </div>
                                </div>
                                <div v-else class="sd-notice">
                                    Sem eventos de gamificação ainda.
                                </div>
                            </div>
                        </div>

                        <div v-if="activeSection === 'limited-events'" class="sd-card p-4 md:p-6 min-w-0">
                            <div class="flex justify-between items-center gap-3 flex-wrap mb-4">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h2 class="sd-section-title">Eventos relâmpago</h2>
                                    <span class="sd-badge">{{ limitedEvents.length }} evento(s)</span>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="loadingLimited"
                                        @click="loadLimitedData"
                                    >
                                        {{ loadingLimited ? 'Atualizando...' : 'Atualizar' }}
                                    </button>
                                    <button
                                        class="sd-button sd-button-primary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="loadingLimited || savingLimited"
                                        @click="openLimitedFormModal"
                                    >
                                        Novo cadastro
                                    </button>
                                </div>
                            </div>

                            <div v-if="limitedError" class="sd-error">{{ limitedError }}</div>
                            <div v-if="limitedNotice" class="sd-notice">{{ limitedNotice }}</div>

                            <section>
                                <h3 class="sd-card-title">Eventos cadastrados</h3>
                                <div v-if="limitedEvents.length" class="mt-3">
                                    <DataTable
                                        :columns="eventsColumns"
                                        :rows="limitedEventRows"
                                        row-key="id"
                                        :search-keys="['title', 'statusLabel', 'rewardLabel']"
                                        search-placeholder="Buscar evento..."
                                        :initial-page-size="5"
                                    >
                                        <template #cell-statusLabel="{ row }">
                                            <span class="sd-badge" :class="row.isActive ? 'sd-badge-published' : 'sd-badge-draft'">
                                                {{ row.statusLabel }}
                                            </span>
                                        </template>
                                        <template #cell-rewardLabel="{ row }">
                                            <span class="inline-flex items-center gap-2 text-sm">
                                                <img
                                                    v-if="isImageIcon(row.reward?.icon)"
                                                    :src="row.reward?.icon"
                                                    alt=""
                                                    class="h-5 w-5 rounded object-contain"
                                                >
                                                <span v-else>{{ row.reward?.icon || '🎁' }}</span>
                                                <span>{{ row.reward?.title || '-' }}</span>
                                            </span>
                                        </template>
                                    </DataTable>
                                </div>
                                <div v-else class="sd-notice mt-3">Nenhum evento cadastrado ainda.</div>
                            </section>
                        </div>

                        <div v-if="activeSection === 'students'" class="sd-card p-4 md:p-6 min-w-0">
                            <div class="flex justify-between items-center gap-3 flex-wrap mb-4">
                                <h2 class="sd-section-title">Gerenciar alunos</h2>
                                <button
                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                    type="button"
                                    :disabled="loadingStudents"
                                    @click="loadStudents"
                                >
                                    {{ loadingStudents ? 'Atualizando...' : 'Atualizar' }}
                                </button>
                            </div>

                            <div v-if="studentsError" class="sd-error">
                                {{ studentsError }}
                            </div>

                            <div v-else-if="loadingStudents" class="sd-notice">
                                Carregando alunos...
                            </div>

                            <div v-else-if="students.length" class="space-y-3 md:hidden">
                                <article v-for="student in paginatedStudents" :key="student.id" class="sd-list-item p-3">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="font-medium break-words">{{ student.username }}</div>
                                        <span class="sd-badge" :class="student.isActive ? 'sd-badge-published' : 'sd-badge-draft'">
                                            {{ student.isActive ? 'Ativo' : 'Inativo' }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-muted mt-2">Criado em {{ formatDateTime(student.createdAt) }}</div>
                                    <div class="mt-3 flex flex-col gap-2">
                                        <button
                                            class="sd-button sd-button-secondary px-3 py-2 text-sm w-full"
                                            type="button"
                                            :disabled="mutatingStudentId === student.id || resettingStudentId === student.id"
                                            @click="resetStudentPassword(student)"
                                        >
                                            {{
                                                resettingStudentId === student.id
                                                    ? 'Gerando...'
                                                    : 'Nova senha'
                                            }}
                                        </button>
                                        <button
                                            class="sd-button px-3 py-2 text-sm w-full"
                                            type="button"
                                            :class="student.isActive ? 'sd-button-secondary' : 'sd-button-primary'"
                                            :disabled="mutatingStudentId === student.id || resettingStudentId === student.id"
                                            @click="toggleStudentStatus(student)"
                                        >
                                            {{ mutatingStudentId === student.id ? 'Salvando...' : (student.isActive ? 'Inativar' : 'Ativar') }}
                                        </button>
                                    </div>
                                </article>
                            </div>

                            <div v-if="students.length" class="hidden md:block">
                                <DataTable
                                    class="students-list-table"
                                    :columns="studentsColumns"
                                    :rows="studentRows"
                                    row-key="id"
                                    :search-keys="['username', 'statusLabel']"
                                    search-placeholder="Buscar aluno..."
                                    density="compact"
                                >
                                    <template #cell-statusLabel="{ row }">
                                        <span class="sd-badge" :class="row.isActive ? 'sd-badge-published' : 'sd-badge-draft'">
                                            {{ row.statusLabel }}
                                        </span>
                                    </template>
                                    <template #cell-createdLabel="{ row }">
                                        <span class="text-sm text-muted">{{ row.createdLabel }}</span>
                                    </template>
                                    <template #cell-passwordAction="{ row }">
                                        <button
                                            class="sd-button sd-button-secondary px-3 py-1.5 text-sm students-table-btn"
                                            type="button"
                                            :disabled="mutatingStudentId === row.id || resettingStudentId === row.id"
                                            @click.stop="resetStudentPassword(row)"
                                        >
                                            {{
                                                resettingStudentId === row.id
                                                    ? 'Gerando...'
                                                    : 'Nova senha'
                                            }}
                                        </button>
                                    </template>
                                    <template #cell-statusAction="{ row }">
                                        <button
                                            class="sd-button px-3 py-1.5 text-sm students-table-btn"
                                            type="button"
                                            :class="row.isActive ? 'sd-button-secondary' : 'sd-button-primary'"
                                            :disabled="mutatingStudentId === row.id || resettingStudentId === row.id"
                                            @click.stop="toggleStudentStatus(row)"
                                        >
                                            {{ mutatingStudentId === row.id ? 'Salvando...' : (row.isActive ? 'Inativar' : 'Ativar') }}
                                        </button>
                                    </template>
                                </DataTable>
                            </div>

                            <div
                                v-if="students.length > 0"
                                class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:hidden"
                            >
                                <span class="text-sm text-muted">
                                    Mostrando {{ studentsPageFrom }}-{{ studentsPageTo }} de {{ totalStudentsItems }} aluno(s)
                                </span>
                                <div class="flex flex-wrap items-center gap-2">
                                    <label class="text-xs text-muted" for="students-per-page-select">Itens por página</label>
                                    <select
                                        id="students-per-page-select"
                                        v-model.number="studentsItemsPerPage"
                                        class="sd-input !w-auto !py-2 !px-3 text-sm"
                                    >
                                        <option v-for="option in perPageOptions" :key="`students-${option}`" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="loadingStudents || studentsIsFirstPage"
                                        @click="goToPrevStudentsPage"
                                    >
                                        Anterior
                                    </button>
                                    <span class="text-sm text-muted">
                                        Página {{ studentsCurrentPage }} de {{ studentsTotalPages }}
                                    </span>
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="loadingStudents || studentsIsLastPage"
                                        @click="goToNextStudentsPage"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>

                            <div v-else class="sd-notice">
                                Nenhum aluno cadastrado até o momento.
                            </div>
                        </div>

                        <div v-if="activeSection === 'episodes'" class="sd-card sd-card-section p-4 md:p-6 overflow-auto min-w-0">
                            <div v-if="actionError" class="sd-error mb-4">
                                {{ actionError }}
                            </div>

                            <div v-if="episodesError" class="sd-error mb-4">
                                {{ episodesError }}
                            </div>
                            <div v-else-if="loadingEpisodes" class="sd-notice">
                                Carregando episódios...
                            </div>

                            <template v-else>
                            <div class="flex justify-between items-center gap-3 flex-wrap mb-4">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h2 class="sd-section-title">Episódios cadastrados</h2>
                                    <span class="sd-badge">{{ episodes.length }} registro(s)</span>
                                </div>
                                <button
                                    class="sd-button sd-button-primary px-3 py-2 text-sm"
                                    type="button"
                                    :disabled="isMutating || loadingEpisodes"
                                    @click="openCreate"
                                >
                                    Novo episódio
                                </button>
                            </div>

                            <div class="space-y-3 md:hidden">
                                <article v-for="episode in paginatedEpisodes" :key="episode.id" class="sd-list-item p-3">
                                    <div class="font-semibold break-words">{{ episode.title }}</div>
                                    <div class="mt-2 text-xs text-muted flex flex-wrap gap-2">
                                        <span class="sd-badge">
                                            {{ episode.episode_type === 'assessment' ? 'Avaliativo' : 'Estudo' }}
                                        </span>
                                        <span class="sd-badge">{{ episode.year_target }}º ano</span>
                                        <span class="sd-badge" :class="episode.is_published ? 'sd-badge-published' : 'sd-badge-draft'">
                                            {{ episode.is_published ? 'Publicado' : 'Rascunho' }}
                                        </span>
                                    </div>
                                    <div class="mt-2 text-xs text-muted">Categoria: {{ episode.category }}</div>
                                    <div class="mt-3 flex items-center gap-2">
                                        <button
                                            class="sd-button sd-button-secondary px-3 py-2 text-sm w-full"
                                            type="button"
                                            :disabled="isMutating || loadingEpisodes"
                                            @click="editEpisode(episode)"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            class="sd-button sd-button-secondary px-3 py-2 text-sm w-full"
                                            type="button"
                                            :disabled="isMutating || loadingEpisodes"
                                            @click="removeEpisode(episode.id)"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </article>
                                <div v-if="episodes.length === 0" class="sd-notice">Nenhum episódio cadastrado.</div>
                            </div>

                            <div class="hidden md:block">
                                <DataTable
                                    :columns="episodesColumns"
                                    :rows="episodeRows"
                                    row-key="id"
                                    :search-keys="['title', 'typeLabel', 'statusLabel']"
                                    search-placeholder="Buscar episódio..."
                                >
                                    <template #cell-title="{ row }">
                                        <span class="font-medium episodes-title-cell" :title="row.title">{{ row.title }}</span>
                                    </template>
                                    <template #cell-typeLabel="{ row }">
                                        <span class="sd-badge">{{ row.typeLabel }}</span>
                                    </template>
                                    <template #cell-statusLabel="{ row }">
                                        <span class="sd-badge" :class="row.is_published ? 'sd-badge-published' : 'sd-badge-draft'">
                                            {{ row.statusLabel }}
                                        </span>
                                    </template>
                                    <template #cell-actions="{ row }">
                                        <div class="relative inline-flex justify-end">
                                            <button
                                                class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                                type="button"
                                                aria-label="Abrir ações do episódio"
                                                :disabled="isMutating || loadingEpisodes"
                                                @click.stop="toggleActionMenu(row.id)"
                                            >
                                                Ações
                                            </button>
                                            <div
                                                v-if="openActionMenuId === row.id"
                                                class="row-actions-menu"
                                                @click.stop
                                            >
                                                <button
                                                    class="row-actions-item"
                                                    type="button"
                                                    :disabled="isMutating || loadingEpisodes"
                                                    @click="handleEditAction(row)"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    class="row-actions-item row-actions-item-danger"
                                                    type="button"
                                                    :disabled="isMutating || loadingEpisodes"
                                                    @click="handleDeleteAction(row.id)"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </DataTable>
                            </div>
                            <div
                                v-if="episodes.length > 0"
                                class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:hidden"
                            >
                                <span class="text-sm text-muted">
                                    Mostrando {{ pageFrom }}-{{ pageTo }} de {{ totalItems }} episódio(s)
                                </span>
                                <div class="flex flex-wrap items-center gap-2">
                                    <label class="text-xs text-muted" for="per-page-select">Itens por página</label>
                                    <select
                                        id="per-page-select"
                                        v-model.number="itemsPerPage"
                                        class="sd-input !w-auto !py-2 !px-3 text-sm"
                                    >
                                        <option v-for="option in perPageOptions" :key="option" :value="option">
                                            {{ option }}
                                        </option>
                                    </select>
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="isMutating || loadingEpisodes || isFirstPage"
                                        @click="goToPrevPage"
                                    >
                                        Anterior
                                    </button>
                                    <span class="text-sm text-muted">
                                        Página {{ currentPage }} de {{ totalPages }}
                                    </span>
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="isMutating || loadingEpisodes || isLastPage"
                                        @click="goToNextPage"
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                            </template>
                        </div>
                    </section>
                </div>
            </main>
        </PageContainer>
        <BaseModal
            v-model="showForm"
            :title="editing ? 'Editar episódio' : 'Novo episódio'"
            aria-label="Formulário de episódio"
            max-width="5xl"
            :disable-close="isMutating"
            @close="resetForm"
        >
            <EpisodeForm
                :editing="editing"
                :model-value="selectedEpisode"
                @submit="handleSubmit"
                @cancel="resetForm"
            />
        </BaseModal>
        <BaseModal
            v-model="showLimitedFormModal"
            title="Novo cadastro - eventos relâmpago"
            aria-label="Formulário de item colecionável e evento relâmpago"
            max-width="3xl"
            :disable-close="savingLimited"
            @close="resetLimitedFormModal"
        >
            <div class="limited-form-modal-scroll px-4 pb-4 md:px-6 md:pb-6 max-h-[min(78vh,720px)] overflow-y-auto overscroll-contain">
                <div class="limited-form-tabs" role="tablist" aria-label="Tipo de cadastro">
                    <button
                        type="button"
                        class="limited-form-tab"
                        :class="{ 'limited-form-tab--active': limitedFormTab === 'item' }"
                        role="tab"
                        :aria-selected="limitedFormTab === 'item'"
                        @click="limitedFormTab = 'item'"
                    >
                        Item colecionável
                    </button>
                    <button
                        type="button"
                        class="limited-form-tab"
                        :class="{ 'limited-form-tab--active': limitedFormTab === 'event' }"
                        role="tab"
                        :aria-selected="limitedFormTab === 'event'"
                        @click="limitedFormTab = 'event'"
                    >
                        Evento relâmpago
                    </button>
                </div>

                <section v-if="limitedFormTab === 'item'" class="sd-card sd-card-item p-4 md:p-5 mt-4">
                    <h4 class="text-base font-semibold text-[var(--text)]">Criar item colecionável</h4>
                    <p class="text-sm text-muted mt-1 leading-relaxed">
                        Cadastre primeiro a recompensa que poderá ser vinculada a um evento na outra aba.
                    </p>
                    <form class="mt-4 grid gap-3" @submit.prevent="createItem">
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Key</span>
                            <input class="sd-input" v-model="itemForm.key" placeholder="bone_sextadev" required />
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Título</span>
                            <input class="sd-input" v-model="itemForm.title" placeholder="Boné SextaDev" required />
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label class="flex flex-col gap-2">
                                <span class="sd-label">Tipo</span>
                                <select class="sd-input" v-model="itemForm.type">
                                    <option value="badge">Badge</option>
                                    <option value="avatar_item">Item de avatar</option>
                                </select>
                            </label>
                            <label class="flex flex-col gap-2">
                                <span class="sd-label">Raridade</span>
                                <select class="sd-input" v-model="itemForm.rarity">
                                    <option value="common">Comum</option>
                                    <option value="rare">Raro</option>
                                    <option value="epic">Épico</option>
                                    <option value="legendary">Lendário</option>
                                </select>
                            </label>
                        </div>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Ícone do catálogo</span>
                            <select class="sd-input" v-model="itemForm.icon">
                                <option value="">Sem ícone</option>
                                <option
                                    v-for="opt in iconCatalog"
                                    :key="opt.value"
                                    :value="opt.value"
                                >
                                    {{ opt.label }}
                                </option>
                            </select>
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Ou informe emoji/texto curto (opcional)</span>
                            <input class="sd-input" v-model="itemForm.icon" placeholder="/assets/collectibles/cap.svg ou 🧢" />
                        </label>
                        <div v-if="itemForm.icon" class="flex items-center gap-2 text-sm text-muted">
                            <img
                                v-if="isImageIcon(itemForm.icon)"
                                :src="itemForm.icon"
                                alt="Prévia do ícone"
                                class="h-7 w-7 rounded object-contain"
                            />
                            <span v-else class="text-xl leading-none">{{ itemForm.icon }}</span>
                            <span>Prévia do item</span>
                        </div>
                        <button class="sd-button sd-button-primary w-fit" type="submit" :disabled="savingLimited">
                            {{ savingLimited ? 'Salvando...' : 'Criar item' }}
                        </button>
                    </form>
                </section>

                <section v-else class="sd-card sd-card-item p-4 md:p-5 mt-4">
                    <h4 class="text-base font-semibold text-[var(--text)]">Criar evento</h4>
                    <p class="text-sm text-muted mt-1 leading-relaxed">
                        Defina a janela de tempo e associe uma recompensa já cadastrada.
                    </p>
                    <form class="mt-4 grid gap-3" @submit.prevent="createEvent">
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Key</span>
                            <input class="sd-input" v-model="eventForm.key" placeholder="evento_bone_marco" required />
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Título</span>
                            <input class="sd-input" v-model="eventForm.title" placeholder="Drop: Boné do mês" required />
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Descrição (opcional)</span>
                            <input class="sd-input" v-model="eventForm.description" placeholder="Disponível por tempo limitado." />
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label class="flex flex-col gap-2">
                                <span class="sd-label">Início</span>
                                <input class="sd-input" type="datetime-local" v-model="eventForm.startAt" required />
                            </label>
                            <label class="flex flex-col gap-2">
                                <span class="sd-label">Fim</span>
                                <input class="sd-input" type="datetime-local" v-model="eventForm.endAt" required />
                            </label>
                        </div>
                        <label class="flex items-center gap-2 text-sm text-muted">
                            <input type="checkbox" v-model="eventForm.isActive" />
                            Ativo
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Episódio (opcional)</span>
                            <SearchableSelect
                                v-model="eventForm.episodeId"
                                :options="episodeSelectOptions"
                                placeholder="Sem episódio"
                                search-placeholder="Pesquisar por título ou número..."
                                :disabled="savingLimited"
                            />
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Recompensa</span>
                            <SearchableSelect
                                v-model="eventForm.rewardItemId"
                                :options="rewardSelectOptions"
                                placeholder="Selecione um item"
                                search-placeholder="Pesquisar recompensa..."
                                :disabled="savingLimited"
                            />
                        </label>
                        <button class="sd-button sd-button-primary w-fit" type="submit" :disabled="savingLimited">
                            {{ savingLimited ? 'Salvando...' : 'Criar evento' }}
                        </button>
                    </form>
                </section>
            </div>
        </BaseModal>
        <BaseModal
            :model-value="Boolean(selectedAssessment)"
            title="Desempenho por aluno"
            aria-label="Detalhes da atividade avaliativa"
            max-width="4xl"
            @update:model-value="(value) => { if (!value) selectedAssessment = null; }"
            @close="selectedAssessment = null"
        >
            <p v-if="selectedAssessment" class="text-sm text-muted mt-1">{{ selectedAssessment.title }} • {{ formatAssessmentMode(selectedAssessment.mode) }}</p>
            <div v-if="selectedAssessment" class="mt-4 max-h-[60vh] overflow-auto">
                <DataTable
                    :columns="assessmentStudentsColumns"
                    :rows="assessmentStudentRows"
                    row-key="userId"
                    :search-keys="['username', 'statusLabel']"
                    search-placeholder="Buscar aluno..."
                    empty-text="Sem dados de alunos para esta atividade."
                    :initial-page-size="5"
                >
                    <template #cell-statusLabel="{ row }">
                        <span class="sd-badge" :class="row.passed ? 'sd-badge-published' : 'sd-badge-draft'">
                            {{ row.statusLabel }}
                        </span>
                    </template>
                </DataTable>
            </div>
        </BaseModal>
        <BaseModal
            :model-value="Boolean(passwordResetResult)"
            title="Nova senha do aluno"
            aria-label="Senha temporária gerada"
            max-width="lg"
            @update:model-value="(open) => { if (!open) closePasswordResetModal(); }"
            @close="closePasswordResetModal"
        >
            <template v-if="passwordResetResult">
                <p class="text-sm text-muted leading-relaxed">{{ passwordResetResult.message }}</p>
                <p class="mt-3 text-sm">
                    Aluno:
                    <strong class="font-mono">{{ passwordResetResult.username }}</strong>
                </p>
                <label class="mt-4 block text-xs text-muted">Senha temporária</label>
                <div class="mt-1 flex flex-col sm:flex-row gap-2 items-stretch">
                    <input
                        class="sd-input flex-1 font-mono text-sm"
                        type="text"
                        readonly
                        :value="passwordResetResult.temporaryPassword"
                    />
                    <button
                        class="sd-button sd-button-secondary shrink-0 px-4"
                        type="button"
                        @click="copyTemporaryPassword"
                    >
                        Copiar
                    </button>
                </div>
                <p
                    v-if="passwordCopyNotice"
                    class="text-xs mt-2"
                    :class="passwordCopyNotice === 'Copiado!' ? 'text-emerald-400' : 'text-muted'"
                >
                    {{ passwordCopyNotice }}
                </p>
                <p class="text-xs text-muted mt-4 leading-relaxed">
                    Guarde ou copie agora: esta senha não fica armazenada para consulta depois.
                </p>
            </template>
        </BaseModal>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeForm from '../components/EpisodeForm.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import DataTable from '../components/ui/DataTable.vue';
import SearchableSelect from '../components/ui/SearchableSelect.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import { collectibleIconCatalog, isImageIcon } from '../constants/collectibleIcons';
const auth = useAuthStore();
const episodes = ref([]);
const showForm = ref(false);
const editing = ref(false);
const selectedEpisode = ref(null);
const loadingEpisodes = ref(false);
const episodesError = ref('');
const actionError = ref('');
const isMutating = ref(false);
const loadingMetrics = ref(false);
const metricsError = ref('');
const metrics = ref({
    totals: {
        usersWithProfile: 0,
        completedEpisodes: 0,
        missionClaims: 0,
        rewardsRedeemed: 0
    },
    assessmentSummary: {
        totalAssessmentEpisodes: 0,
        totalAssessmentAttempts: 0,
        averagePassRate: 0,
        averageScore: 0,
        averageAttemptsPerStudent: 0
    },
    assessmentEpisodes: [],
    recentEvents: []
});
const activeSection = ref('metrics');
const selectedAssessment = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const perPageOptions = [5, 10, 20, 50];
const loadingLimited = ref(false);
const savingLimited = ref(false);
const limitedError = ref('');
const limitedNotice = ref('');
const showLimitedFormModal = ref(false);
const limitedFormTab = ref('item');
const collectibleItems = ref([]);
const limitedEvents = ref([]);
const students = ref([]);

const heroInitials = computed(() => {
    const raw = String(auth.user?.username || '?').trim();
    if (!raw) return '?';
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase().slice(0, 2);
    }
    return raw.slice(0, 2).toUpperCase();
});

const heroQuickStats = computed(() => {
    const profiles = metrics.value?.totals?.usersWithProfile;
    const recentLen = Array.isArray(metrics.value?.recentEvents) ? metrics.value.recentEvents.length : 0;
    return [
        {
            label: 'Engajamento',
            value: typeof profiles === 'number' ? profiles : 0,
            hint: 'Perfis ativos na gamificação',
            section: 'metrics'
        },
        {
            label: 'Atividade',
            value: recentLen,
            hint: 'Últimos eventos no feed',
            section: 'events'
        },
        {
            label: 'Episódios',
            value: episodes.value.length,
            hint: 'Materiais no catálogo',
            section: 'episodes'
        },
        {
            label: 'Relâmpago',
            value: limitedEvents.value.length,
            hint: 'Campanhas cadastradas',
            section: 'limited-events'
        },
        {
            label: 'Alunos',
            value: students.value.length,
            hint: 'Contas cadastradas',
            section: 'students'
        }
    ];
});

const loadingStudents = ref(false);
const studentsError = ref('');
const mutatingStudentId = ref(null);
const resettingStudentId = ref(null);
const passwordResetResult = ref(null);
const passwordCopyNotice = ref('');
const studentsCurrentPage = ref(1);
const studentsItemsPerPage = ref(10);
const iconCatalog = collectibleIconCatalog;

function defaultItemForm() {
    return {
        key: '',
        title: '',
        type: 'badge',
        rarity: 'rare',
        icon: collectibleIconCatalog[0]?.value || ''
    };
}

function defaultEventForm() {
    return {
        key: '',
        title: '',
        description: '',
        startAt: '',
        endAt: '',
        isActive: true,
        episodeId: '',
        rewardItemId: ''
    };
}

const itemForm = ref(defaultItemForm());

const eventForm = ref(defaultEventForm());

function openLimitedFormModal() {
    if (loadingLimited.value || savingLimited.value) return;
    limitedError.value = '';
    limitedFormTab.value = 'item';
    itemForm.value = defaultItemForm();
    eventForm.value = defaultEventForm();
    showLimitedFormModal.value = true;
}

function resetLimitedFormModal() {
    showLimitedFormModal.value = false;
    limitedFormTab.value = 'item';
    itemForm.value = defaultItemForm();
    eventForm.value = defaultEventForm();
}

const totalItems = computed(() => episodes.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const paginatedEpisodes = computed(() => episodes.value.slice(startIndex.value, endIndex.value));
const pageFrom = computed(() => (totalItems.value ? startIndex.value + 1 : 0));
const pageTo = computed(() => Math.min(endIndex.value, totalItems.value));
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);
/** Inativos primeiro; depois ordem alfabética por usuário (aba Alunos). */
const studentsSortedForDisplay = computed(() => {
    const list = [...(students.value || [])];
    list.sort((a, b) => {
        const activeRank = (u) => (u?.isActive ? 1 : 0);
        const byStatus = activeRank(a) - activeRank(b);
        if (byStatus !== 0) return byStatus;
        return String(a?.username ?? '').localeCompare(String(b?.username ?? ''), 'pt-BR', { sensitivity: 'base' });
    });
    return list;
});

const totalStudentsItems = computed(() => students.value.length);
const studentsTotalPages = computed(() => Math.max(1, Math.ceil(totalStudentsItems.value / studentsItemsPerPage.value)));
const studentsStartIndex = computed(() => (studentsCurrentPage.value - 1) * studentsItemsPerPage.value);
const studentsEndIndex = computed(() => studentsStartIndex.value + studentsItemsPerPage.value);
const paginatedStudents = computed(() => studentsSortedForDisplay.value.slice(studentsStartIndex.value, studentsEndIndex.value));
const studentsPageFrom = computed(() => (totalStudentsItems.value ? studentsStartIndex.value + 1 : 0));
const studentsPageTo = computed(() => Math.min(studentsEndIndex.value, totalStudentsItems.value));
const studentsIsFirstPage = computed(() => studentsCurrentPage.value <= 1);
const studentsIsLastPage = computed(() => studentsCurrentPage.value >= studentsTotalPages.value);
const openActionMenuId = ref(null);

const assessmentColumns = [
    { key: 'title', label: 'Atividade', sortable: true },
    { key: 'modeLabel', label: 'Modo', sortable: true, width: '140px' },
    { key: 'studentsTried', label: 'Alunos', sortable: true, align: 'right', width: '90px' },
    { key: 'passRate', label: 'Aprovação', sortable: true, align: 'right', width: '110px' },
    { key: 'averageScore', label: 'Nota média', sortable: true, align: 'right', width: '110px' },
    { key: 'attemptsPerStudent', label: 'Tentativas/aluno', sortable: true, align: 'right', width: '140px' }
];
const eventsColumns = [
    { key: 'title', label: 'Evento', sortable: true },
    {
        key: 'windowLabel',
        label: 'Janela',
        sortable: true,
        width: '440px',
        cellClass: 'whitespace-nowrap'
    },
    { key: 'statusLabel', label: 'Status', sortable: true, width: '110px' },
    { key: 'rewardLabel', label: 'Recompensa', sortable: true }
];
const studentsColumns = [
    { key: 'username', label: 'Usuário', sortable: true },
    { key: 'statusLabel', label: 'Status', sortable: true, width: '120px' },
    { key: 'createdLabel', label: 'Criado em', sortable: true, align: 'right', width: '180px' },
    { key: 'passwordAction', label: 'Senha', sortable: false, align: 'center', width: '140px' },
    { key: 'statusAction', label: 'Ações', sortable: false, align: 'center', width: '130px' }
];
const episodesColumns = [
    { key: 'title', label: 'Título', sortable: true },
    { key: 'typeLabel', label: 'Tipo', sortable: true, width: '120px' },
    { key: 'yearLabel', label: 'Ano', sortable: true, align: 'right', width: '90px' },
    { key: 'statusLabel', label: 'Status', sortable: true, align: 'center', width: '120px' },
    { key: 'actions', label: 'Ações', sortable: false, align: 'center', width: '130px' }
];
const assessmentStudentsColumns = [
    { key: 'username', label: 'Aluno', sortable: true },
    { key: 'attemptsUsed', label: 'Tentativas', sortable: true, align: 'right', width: '120px' },
    { key: 'bestScore', label: 'Melhor nota', sortable: true, align: 'right', width: '130px' },
    { key: 'statusLabel', label: 'Status', sortable: true, align: 'center', width: '120px' }
];

const assessmentRows = computed(() => {
    const sorted = [...(metrics.value.assessmentEpisodes || [])].sort(compareAssessmentEpisodesByEngagement);
    return sorted.map((item) => ({
        ...item,
        modeLabel: formatAssessmentMode(item.mode),
        passRate: `${item.passRate}%`,
        averageScore: `${item.averageScore}%`
    }));
});
const limitedEventRows = computed(() => (
    (limitedEvents.value || []).map((event) => ({
        ...event,
        windowLabel: `${formatDateTime(event.startAt)} → ${formatDateTime(event.endAt)}`,
        statusLabel: event.isActive ? 'Ativo' : 'Inativo',
        rewardLabel: event.reward?.title || '-'
    }))
));

const episodeSelectOptions = computed(() => [
    { value: '', label: 'Sem episódio' },
    ...(episodes.value || []).map((ep) => ({
        value: String(ep.id),
        label: `#${ep.id} • ${ep.title}`
    }))
]);

const rewardSelectOptions = computed(() => [
    { value: '', label: 'Selecione um item', disabled: true },
    ...(collectibleItems.value || []).map((item) => ({
        value: String(item.id),
        label: `${item.title} (${item.rarity})`
    }))
]);
const studentRows = computed(() => (
    studentsSortedForDisplay.value.map((student) => ({
        ...student,
        statusLabel: student.isActive ? 'Ativo' : 'Inativo',
        createdLabel: formatDateTime(student.createdAt)
    }))
));
const episodeRows = computed(() => (
    (episodes.value || []).map((episode) => ({
        ...episode,
        typeLabel: episode.episode_type === 'assessment' ? 'Avaliativo' : 'Estudo',
        yearLabel: `${episode.year_target}º ano`,
        statusLabel: episode.is_published ? 'Publicado' : 'Rascunho'
    }))
));
const assessmentStudentRows = computed(() => (
    (selectedAssessment.value?.students || []).map((student) => ({
        ...student,
        bestScore: `${student.bestScore}%`,
        statusLabel: student.passed ? 'Aprovado' : 'Reprovado'
    }))
));

watch(itemsPerPage, () => {
    currentPage.value = 1;
});

watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
        currentPage.value = pages;
    }
});

watch(studentsItemsPerPage, () => {
    studentsCurrentPage.value = 1;
});

watch(studentsTotalPages, (pages) => {
    if (studentsCurrentPage.value > pages) {
        studentsCurrentPage.value = pages;
    }
});

async function loadEpisodes() {
    loadingEpisodes.value = true;
    episodesError.value = '';

    try {
        const { data } = await api.get('/episodes');
        episodes.value = data;
    } catch (e) {
        episodes.value = [];
        episodesError.value = e?.response?.data?.message || 'Não foi possível carregar os episódios.';
    } finally {
        loadingEpisodes.value = false;
    }
}

function formatDateTime(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('pt-BR');
}

async function loadLimitedData() {
    loadingLimited.value = true;
    limitedError.value = '';
    try {
        const [itemsRes, eventsRes] = await Promise.all([
            api.get('/events/admin/items'),
            api.get('/events/admin/events')
        ]);
        collectibleItems.value = Array.isArray(itemsRes.data) ? itemsRes.data : [];
        limitedEvents.value = Array.isArray(eventsRes.data) ? eventsRes.data : [];
    } catch (e) {
        collectibleItems.value = [];
        limitedEvents.value = [];
        limitedError.value = e?.response?.data?.message || 'Não foi possível carregar itens/eventos.';
    } finally {
        loadingLimited.value = false;
    }
}

async function createItem() {
    savingLimited.value = true;
    limitedError.value = '';
    limitedNotice.value = '';
    try {
        await api.post('/events/admin/items', {
            ...itemForm.value,
            icon: itemForm.value.icon ? String(itemForm.value.icon).trim() : null
        });
        limitedNotice.value = 'Item criado com sucesso.';
        await loadLimitedData();
        resetLimitedFormModal();
    } catch (e) {
        limitedError.value = e?.response?.data?.message || 'Não foi possível criar o item.';
    } finally {
        savingLimited.value = false;
    }
}

function toIsoFromLocal(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function createEvent() {
    savingLimited.value = true;
    limitedError.value = '';
    limitedNotice.value = '';
    if (!eventForm.value.rewardItemId) {
        limitedError.value = 'Selecione uma recompensa.';
        savingLimited.value = false;
        return;
    }
    try {
        await api.post('/events/admin/events', {
            key: eventForm.value.key,
            title: eventForm.value.title,
            description: eventForm.value.description || null,
            startAt: toIsoFromLocal(eventForm.value.startAt),
            endAt: toIsoFromLocal(eventForm.value.endAt),
            isActive: Boolean(eventForm.value.isActive),
            episodeId: eventForm.value.episodeId ? Number(eventForm.value.episodeId) : null,
            rewardItemId: Number(eventForm.value.rewardItemId)
        });
        limitedNotice.value = 'Evento criado com sucesso.';
        await loadLimitedData();
        resetLimitedFormModal();
    } catch (e) {
        limitedError.value = e?.response?.data?.message || 'Não foi possível criar o evento.';
    } finally {
        savingLimited.value = false;
    }
}

async function loadMetrics() {
    loadingMetrics.value = true;
    metricsError.value = '';
    try {
        const { data } = await api.get('/gamification/admin/metrics');
        metrics.value = data;
    } catch (e) {
        metricsError.value = e?.response?.data?.message || 'Não foi possível carregar métricas de gamificação.';
    } finally {
        loadingMetrics.value = false;
    }
}

async function loadStudents() {
    loadingStudents.value = true;
    studentsError.value = '';
    try {
        const { data } = await api.get('/auth/students');
        students.value = Array.isArray(data) ? data : [];
        studentsCurrentPage.value = 1;
    } catch (e) {
        students.value = [];
        studentsError.value = e?.response?.data?.message || 'Não foi possível carregar os alunos.';
    } finally {
        loadingStudents.value = false;
    }
}

async function toggleStudentStatus(student) {
    if (!student?.id) return;
    mutatingStudentId.value = student.id;
    studentsError.value = '';
    try {
        await api.patch(`/auth/students/${student.id}/status`, {
            isActive: !student.isActive
        });
        await loadStudents();
    } catch (e) {
        studentsError.value = e?.response?.data?.message || 'Não foi possível atualizar o status do aluno.';
    } finally {
        mutatingStudentId.value = null;
    }
}

function closePasswordResetModal() {
    passwordResetResult.value = null;
    passwordCopyNotice.value = '';
}

async function resetStudentPassword(student) {
    if (!student?.id) return;
    const ok = window.confirm(
        `Gerar nova senha para ${student.username}?\n\nA senha atual deixará de funcionar e o aluno será desconectado dos dispositivos em que estiver logado.`
    );
    if (!ok) return;

    resettingStudentId.value = student.id;
    studentsError.value = '';
    passwordCopyNotice.value = '';
    try {
        const { data } = await api.post(`/auth/students/${student.id}/reset-password`);
        passwordResetResult.value = {
            message: data?.message || 'Nova senha gerada.',
            temporaryPassword: data?.temporaryPassword || '',
            username: data?.student?.username || student.username
        };
    } catch (e) {
        studentsError.value = e?.response?.data?.message || 'Não foi possível gerar nova senha.';
    } finally {
        resettingStudentId.value = null;
    }
}

async function copyTemporaryPassword() {
    const text = passwordResetResult.value?.temporaryPassword;
    if (!text || !navigator.clipboard?.writeText) {
        passwordCopyNotice.value = 'Copie manualmente o campo acima.';
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        passwordCopyNotice.value = 'Copiado!';
    } catch {
        passwordCopyNotice.value = 'Não foi possível copiar automaticamente.';
    }
}

/** Ordem exibida: mais alunos distintos → mais tentativas/aluno → tentativa mais recente → título. */
function compareAssessmentEpisodesByEngagement(a, b) {
    const st = (Number(b.studentsTried) || 0) - (Number(a.studentsTried) || 0);
    if (st !== 0) return st;
    const ap = (Number(b.attemptsPerStudent) || 0) - (Number(a.attemptsPerStudent) || 0);
    if (ap !== 0) return ap;
    const ta = a.lastAttemptAt ? new Date(a.lastAttemptAt).getTime() : 0;
    const tb = b.lastAttemptAt ? new Date(b.lastAttemptAt).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR', { sensitivity: 'base' });
}

function formatAssessmentMode(mode) {
    if (mode === 'quiz') return 'Quiz';
    if (mode === 'open_text') return 'Resposta aberta';
    if (mode === 'mini_game') return 'Mini game';
    if (mode === 'semver') return 'SemVer';
    if (mode === 'classification') return 'Classificação';
    if (mode === 'fill_blanks') return 'Lacunas';
    if (mode === 'matching') return 'Correspondência';
    return '—';
}

function openAssessmentDetails(item) {
    selectedAssessment.value = item;
}

function goToPrevPage() {
    if (isFirstPage.value) return;
    currentPage.value -= 1;
}

function goToNextPage() {
    if (isLastPage.value) return;
    currentPage.value += 1;
}

function goToPrevStudentsPage() {
    if (studentsIsFirstPage.value) return;
    studentsCurrentPage.value -= 1;
}

function goToNextStudentsPage() {
    if (studentsIsLastPage.value) return;
    studentsCurrentPage.value += 1;
}

function closeActionMenu() {
    openActionMenuId.value = null;
}

function toggleActionMenu(episodeId) {
    openActionMenuId.value = openActionMenuId.value === episodeId ? null : episodeId;
}

function handleEditAction(episode) {
    closeActionMenu();
    editEpisode(episode);
}

function handleDeleteAction(episodeId) {
    closeActionMenu();
    removeEpisode(episodeId);
}

function handleDocumentClick() {
    closeActionMenu();
}

function openCreate() {
    if (isMutating.value) return;
    activeSection.value = 'episodes';
    editing.value = false;
    selectedEpisode.value = null;
    showForm.value = true;
}

function editEpisode(episode) {
    if (isMutating.value) return;
    activeSection.value = 'episodes';
    editing.value = true;
    selectedEpisode.value = episode;
    showForm.value = true;
}

function resetForm() {
    showForm.value = false;
    editing.value = false;
    selectedEpisode.value = null;
}

async function handleSubmit(payload) {
    actionError.value = '';
    isMutating.value = true;

    try {
        if (editing.value && selectedEpisode.value) {
            await api.put(
                `/episodes/${selectedEpisode.value.id}`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
        } else {
            await api.post('/episodes', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        }

        resetForm();
        await loadEpisodes();
    } catch (e) {
        actionError.value = e?.response?.data?.message || 'Não foi possível salvar o episódio.';
    } finally {
        isMutating.value = false;
    }
}
async function removeEpisode(id) {
    if (!confirm('Deseja realmente excluir este episódio?')) return;

    actionError.value = '';
    isMutating.value = true;

    try {
        await api.delete(`/episodes/${id}`);
        await loadEpisodes();
    } catch (e) {
        actionError.value = e?.response?.data?.message || 'Não foi possível excluir o episódio.';
    } finally {
        isMutating.value = false;
    }
}

onMounted(async () => {
    document.addEventListener('click', handleDocumentClick);
    await Promise.all([loadEpisodes(), loadMetrics(), loadLimitedData(), loadStudents()]);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
});
</script>

<style scoped>
.row-actions-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    z-index: 30;
    min-width: 9.5rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--border) 90%, transparent);
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
    overflow: hidden;
}

.row-actions-item {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: left;
    padding: 0.625rem 0.75rem;
    cursor: pointer;
}

.row-actions-item:hover {
    background: color-mix(in srgb, var(--surface-2) 58%, transparent);
}

.row-actions-item-danger {
    color: color-mix(in srgb, var(--danger) 78%, var(--text));
}

.episodes-title-cell {
    display: inline-block;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
}

.episodes-cell-type,
.episodes-cell-year,
.episodes-cell-status,
.episodes-cell-actions {
    white-space: nowrap;
}

.students-actions {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    flex-wrap: nowrap;
}

.students-list-table :deep(.sd-data-table-table) {
    min-width: 680px;
}

.students-list-table :deep(.sd-data-table-table td) {
    vertical-align: middle;
}

.students-table-btn {
    min-width: 104px;
    justify-content: center;
}

.limited-form-tabs {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
    background: color-mix(in srgb, var(--surface-2) 52%, transparent);
    width: fit-content;
}

.limited-form-tab {
    border: 0;
    background: transparent;
    color: var(--muted);
    font-weight: 700;
    font-size: 0.82rem;
    line-height: 1.2;
    border-radius: 9px;
    padding: 0.5rem 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.limited-form-tab:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
}

.limited-form-tab--active {
    color: color-mix(in srgb, var(--primary) 88%, white);
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 24%, transparent);
}

.professor-hero {
    border: 1px solid color-mix(in srgb, var(--border) 85%, var(--primary) 15%);
    box-shadow: var(--card-section-shadow), 0 0 0 1px color-mix(in srgb, var(--primary) 8%, transparent);
}

/* Permite o texto encolher corretamente dentro do flex sem estourar o layout. */
.professor-hero-intro {
    min-width: 0;
}

.professor-hero-accent {
    position: absolute;
    inset: 0 0 auto 0;
    height: 4px;
    background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--primary) 72%, transparent),
        color-mix(in srgb, var(--primary-2) 55%, transparent),
        color-mix(in srgb, var(--primary) 35%, transparent)
    );
    opacity: 0.95;
    pointer-events: none;
}

.professor-hero-avatar {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 0.04em;
    color: #fff;
    background: linear-gradient(155deg, var(--primary), color-mix(in srgb, var(--primary-2) 70%, var(--primary)));
    border: 1px solid color-mix(in srgb, white 38%, var(--primary));
    box-shadow:
        inset 0 1px 0 color-mix(in srgb, white 22%, transparent),
        0 2px 8px color-mix(in srgb, var(--primary) 35%, transparent);
    cursor: help;
}

@media (min-width: 640px) {
    .professor-hero-avatar {
        width: 3.75rem;
        height: 3.75rem;
        font-size: 1.1rem;
    }
}

.professor-hero-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    min-width: 0;
    padding: 0.7rem 0.75rem;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
    background: color-mix(in srgb, var(--surface-2) 45%, var(--surface));
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.15s ease;
}

.professor-hero-stat:hover {
    border-color: color-mix(in srgb, var(--border) 55%, var(--primary) 45%);
    background: color-mix(in srgb, var(--surface) 70%, var(--surface-2));
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.07);
}

.professor-hero-stat:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
}

.professor-hero-stat--active {
    border-color: color-mix(in srgb, var(--primary) 42%, var(--border));
    background: color-mix(in srgb, var(--primary) 11%, var(--surface));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 22%, transparent);
}

.professor-hero-stat--active .professor-hero-stat-value {
    color: color-mix(in srgb, var(--primary) 72%, var(--text));
}

.professor-hero-stat-label {
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0.01em;
    color: var(--muted);
}

.professor-hero-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-top: 0.15rem;
    margin-bottom: 0.1rem;
}

.professor-hero-stat-hint {
    font-size: 0.6875rem;
    font-weight: 400;
    line-height: 1.3;
    color: var(--muted);
    opacity: 0.92;
}

</style>
