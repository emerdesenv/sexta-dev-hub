<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-4 md:pt-6">
            <main class="py-8">
                <div class="grid gap-6 lg:grid-cols-[300px_1fr]">
                    <aside class="lg:sticky lg:top-24 self-start">
                        <div class="sd-card sd-card-section p-5 md:p-6">
                            <span class="sd-badge sd-badge-primary">Gestão administrativa</span>
                            <h2 class="mt-4 sd-card-title">
                                Olá, {{ auth.user?.username }}
                            </h2>
                            <p class="mt-2 text-muted leading-relaxed">
                                Gerencie episódios, publique materiais e mantenha a área pública atualizada.
                            </p>

                            <div class="mt-5 flex flex-col gap-3">
                                <button
                                    class="sd-button sd-button-primary w-full"
                                    type="button"
                                    :disabled="isMutating || loadingEpisodes"
                                    @click="openCreate"
                                >
                                    Novo episódio
                                </button>
                            </div>
                        </div>
                    </aside>

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
                            <div class="flex justify-between items-center gap-3 flex-wrap">
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

                            <div v-if="metricsError" class="sd-error mt-4">
                                {{ metricsError }}
                            </div>

                            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
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
                                <div class="mt-4 overflow-auto" v-if="metrics.assessmentEpisodes.length">
                                    <table class="sd-table">
                                        <thead>
                                            <tr>
                                                <th>Atividade</th>
                                                <th>Modo</th>
                                                <th class="text-right">Alunos</th>
                                                <th class="text-right">Aprovação</th>
                                                <th class="text-right">Nota média</th>
                                                <th class="text-right">Tentativas/aluno</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr
                                                v-for="item in metrics.assessmentEpisodes"
                                                :key="item.episodeId"
                                                class="cursor-pointer hover:bg-surface-2/40"
                                                @click="openAssessmentDetails(item)"
                                            >
                                                <td class="font-medium">{{ item.title }}</td>
                                                <td>{{ formatAssessmentMode(item.mode) }}</td>
                                                <td class="text-right">{{ item.studentsTried }}</td>
                                                <td class="text-right">{{ item.passRate }}%</td>
                                                <td class="text-right">{{ item.averageScore }}%</td>
                                                <td class="text-right">{{ item.attemptsPerStudent }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div v-else class="sd-notice mt-4">
                                    Nenhuma atividade encontrada com os filtros selecionados.
                                </div>
                            </div>

                        </div>

                        <div v-if="activeSection === 'events'" class="sd-card p-4 md:p-6 min-w-0">
                            <div class="flex justify-between items-center gap-3 flex-wrap">
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
                            <div v-if="metricsError" class="sd-error mt-4">
                                {{ metricsError }}
                            </div>
                            <div class="mt-2 max-h-80 overflow-y-auto overscroll-contain pr-1">
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
                            <div class="flex justify-between items-center gap-3 flex-wrap">
                                <h2 class="sd-section-title">Eventos relâmpago</h2>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                        type="button"
                                        :disabled="loadingLimited"
                                        @click="loadLimitedData"
                                    >
                                        {{ loadingLimited ? 'Atualizando...' : 'Atualizar' }}
                                    </button>
                                </div>
                            </div>

                            <div v-if="limitedError" class="sd-error mt-4">{{ limitedError }}</div>
                            <div v-if="limitedNotice" class="sd-notice mt-4">{{ limitedNotice }}</div>

                            <div class="mt-6 grid gap-6 lg:grid-cols-2">
                                <section class="sd-card sd-card-item p-5">
                                    <h3 class="sd-card-title">Criar item colecionável</h3>
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

                                <section class="sd-card sd-card-item p-5">
                                    <h3 class="sd-card-title">Criar evento</h3>
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
                                            <select class="sd-input" v-model="eventForm.episodeId">
                                                <option value="">Sem episódio</option>
                                                <option v-for="ep in episodes" :key="ep.id" :value="String(ep.id)">
                                                    #{{ ep.id }} • {{ ep.title }}
                                                </option>
                                            </select>
                                        </label>
                                        <label class="flex flex-col gap-2">
                                            <span class="sd-label">Recompensa</span>
                                            <select class="sd-input" v-model="eventForm.rewardItemId" required>
                                                <option value="" disabled>Selecione um item</option>
                                                <option v-for="item in collectibleItems" :key="item.id" :value="String(item.id)">
                                                    {{ item.title }} ({{ item.rarity }})
                                                </option>
                                            </select>
                                        </label>
                                        <button class="sd-button sd-button-primary w-fit" type="submit" :disabled="savingLimited">
                                            {{ savingLimited ? 'Salvando...' : 'Criar evento' }}
                                        </button>
                                    </form>
                                </section>
                            </div>

                            <section class="mt-6">
                                <h3 class="sd-card-title">Eventos cadastrados</h3>
                                <div v-if="limitedEvents.length" class="mt-3 overflow-auto">
                                    <table class="sd-table">
                                        <thead>
                                            <tr>
                                                <th>Evento</th>
                                                <th>Janela</th>
                                                <th>Status</th>
                                                <th>Recompensa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="ev in limitedEvents" :key="ev.id">
                                                <td class="font-medium">{{ ev.title }}</td>
                                                <td class="text-sm text-muted">
                                                    {{ formatDateTime(ev.startAt) }} → {{ formatDateTime(ev.endAt) }}
                                                </td>
                                                <td>
                                                    <span class="sd-badge" :class="ev.isActive ? 'sd-badge-published' : 'sd-badge-draft'">
                                                        {{ ev.isActive ? 'Ativo' : 'Inativo' }}
                                                    </span>
                                                </td>
                                                <td class="text-sm">
                                                    <span class="inline-flex items-center gap-2">
                                                        <img
                                                            v-if="isImageIcon(ev.reward?.icon)"
                                                            :src="ev.reward?.icon"
                                                            alt=""
                                                            class="h-5 w-5 rounded object-contain"
                                                        />
                                                        <span v-else>{{ ev.reward?.icon || '🎁' }}</span>
                                                        <span>{{ ev.reward?.title || '-' }}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div v-else class="sd-notice mt-3">Nenhum evento cadastrado ainda.</div>
                            </section>
                        </div>

                        <div v-if="activeSection === 'students'" class="sd-card p-4 md:p-6 min-w-0">
                            <div class="flex justify-between items-center gap-3 flex-wrap">
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

                            <div v-if="studentsError" class="sd-error mt-4">
                                {{ studentsError }}
                            </div>

                            <div v-else-if="loadingStudents" class="sd-notice mt-4">
                                Carregando alunos...
                            </div>

                            <div v-else-if="students.length" class="mt-4 space-y-3 md:hidden">
                                <article v-for="student in paginatedStudents" :key="student.id" class="sd-list-item p-3">
                                    <div class="flex items-center justify-between gap-2">
                                        <div class="font-medium break-words">{{ student.username }}</div>
                                        <span class="sd-badge" :class="student.isActive ? 'sd-badge-published' : 'sd-badge-draft'">
                                            {{ student.isActive ? 'Ativo' : 'Inativo' }}
                                        </span>
                                    </div>
                                    <div class="text-xs text-muted mt-2">Criado em {{ formatDateTime(student.createdAt) }}</div>
                                    <div class="mt-3">
                                        <button
                                            class="sd-button px-3 py-2 text-sm w-full"
                                            type="button"
                                            :class="student.isActive ? 'sd-button-secondary' : 'sd-button-primary'"
                                            :disabled="mutatingStudentId === student.id"
                                            @click="toggleStudentStatus(student)"
                                        >
                                            {{ mutatingStudentId === student.id ? 'Salvando...' : (student.isActive ? 'Inativar' : 'Ativar') }}
                                        </button>
                                    </div>
                                </article>
                            </div>

                            <div v-if="students.length" class="mt-4 overflow-auto hidden md:block">
                                <table class="sd-table">
                                    <thead>
                                        <tr>
                                            <th>Usuário</th>
                                            <th>Status</th>
                                            <th class="text-right">Criado em</th>
                                            <th class="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="student in paginatedStudents" :key="student.id">
                                            <td class="font-medium">{{ student.username }}</td>
                                            <td>
                                                <span class="sd-badge" :class="student.isActive ? 'sd-badge-published' : 'sd-badge-draft'">
                                                    {{ student.isActive ? 'Ativo' : 'Inativo' }}
                                                </span>
                                            </td>
                                            <td class="text-right text-sm text-muted">{{ formatDateTime(student.createdAt) }}</td>
                                            <td class="text-center">
                                                <button
                                                    class="sd-button px-3 py-2 text-sm"
                                                    type="button"
                                                    :class="student.isActive ? 'sd-button-secondary' : 'sd-button-primary'"
                                                    :disabled="mutatingStudentId === student.id"
                                                    @click="toggleStudentStatus(student)"
                                                >
                                                    {{ mutatingStudentId === student.id ? 'Salvando...' : (student.isActive ? 'Inativar' : 'Ativar') }}
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div
                                v-if="students.length > 0"
                                class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
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

                            <div v-else class="sd-notice mt-4">
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
                            <div class="flex justify-between items-center gap-3 flex-wrap">
                                <h2 class="sd-section-title">Episódios cadastrados</h2>
                                <span class="sd-badge">{{ episodes.length }} registro(s)</span>
                            </div>

                            <div class="mt-4 space-y-3 md:hidden">
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

                            <div class="hidden md:block overflow-auto">
                            <table class="sd-table">
                                <thead>
                                    <tr>
                                        <th>Título</th>
                                        <th>Tipo</th>
                                        <th class="text-right">Ano</th>
                                        <th class="text-center">Status</th>
                                        <th>Categoria</th>
                                        <th class="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="episode in paginatedEpisodes"
                                        :key="episode.id"
                                        class="hover:bg-surface-2/40"
                                    >
                                        <td class="font-medium">{{ episode.title }}</td>
                                        <td>
                                            <span class="sd-badge">
                                                {{ episode.episode_type === 'assessment' ? 'Avaliativo' : 'Estudo' }}
                                            </span>
                                        </td>
                                        <td class="text-right">{{ episode.year_target }}º ano</td>
                                        <td class="text-center">
                                            <span
                                                class="sd-badge"
                                                :class="episode.is_published ? 'sd-badge-published' : 'sd-badge-draft'"
                                            >
                                                {{ episode.is_published ? 'Publicado' : 'Rascunho' }}
                                            </span>
                                        </td>
                                        <td>{{ episode.category }}</td>
                                        <td class="text-right">
                                            <div class="relative inline-flex justify-end">
                                                <button
                                                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                                                    type="button"
                                                    aria-label="Abrir ações do episódio"
                                                    :disabled="isMutating || loadingEpisodes"
                                                    @click.stop="toggleActionMenu(episode.id)"
                                                >
                                                    Ações
                                                </button>
                                                <div
                                                    v-if="openActionMenuId === episode.id"
                                                    class="row-actions-menu"
                                                    @click.stop
                                                >
                                                    <button
                                                        class="row-actions-item"
                                                        type="button"
                                                        :disabled="isMutating || loadingEpisodes"
                                                        @click="handleEditAction(episode)"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        class="row-actions-item row-actions-item-danger"
                                                        type="button"
                                                        :disabled="isMutating || loadingEpisodes"
                                                        @click="handleDeleteAction(episode.id)"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr v-if="episodes.length === 0">
                                        <td colspan="6" class="py-8 text-center text-muted">
                                            Nenhum episódio cadastrado.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
                            <div
                                v-if="episodes.length > 0"
                                class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
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
            :model-value="Boolean(selectedAssessment)"
            title="Desempenho por aluno"
            aria-label="Detalhes da atividade avaliativa"
            max-width="4xl"
            @update:model-value="(value) => { if (!value) selectedAssessment = null; }"
            @close="selectedAssessment = null"
        >
            <p v-if="selectedAssessment" class="text-sm text-muted mt-1">{{ selectedAssessment.title }} • {{ formatAssessmentMode(selectedAssessment.mode) }}</p>
            <div v-if="selectedAssessment" class="mt-4 max-h-[60vh] overflow-auto">
                <table class="sd-table">
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th class="text-right">Tentativas</th>
                            <th class="text-right">Melhor nota</th>
                            <th class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="student in selectedAssessment.students" :key="`${selectedAssessment.episodeId}-${student.userId}`">
                            <td>{{ student.username }}</td>
                            <td class="text-right">{{ student.attemptsUsed }}</td>
                            <td class="text-right">{{ student.bestScore }}%</td>
                            <td class="text-center">
                                <span class="sd-badge" :class="student.passed ? 'sd-badge-published' : 'sd-badge-draft'">
                                    {{ student.passed ? 'Aprovado' : 'Reprovado' }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="!selectedAssessment.students?.length">
                            <td colspan="4" class="py-6 text-center text-muted">Sem dados de alunos para esta atividade.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </BaseModal>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeForm from '../components/EpisodeForm.vue';
import BaseModal from '../components/ui/BaseModal.vue';
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
const collectibleItems = ref([]);
const limitedEvents = ref([]);
const students = ref([]);
const loadingStudents = ref(false);
const studentsError = ref('');
const mutatingStudentId = ref(null);
const studentsCurrentPage = ref(1);
const studentsItemsPerPage = ref(10);
const iconCatalog = collectibleIconCatalog;

const itemForm = ref({
    key: '',
    title: '',
    type: 'badge',
    rarity: 'rare',
    icon: collectibleIconCatalog[0]?.value || ''
});

const eventForm = ref({
    key: '',
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    isActive: true,
    episodeId: '',
    rewardItemId: ''
});

const totalItems = computed(() => episodes.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => startIndex.value + itemsPerPage.value);
const paginatedEpisodes = computed(() => episodes.value.slice(startIndex.value, endIndex.value));
const pageFrom = computed(() => (totalItems.value ? startIndex.value + 1 : 0));
const pageTo = computed(() => Math.min(endIndex.value, totalItems.value));
const isFirstPage = computed(() => currentPage.value <= 1);
const isLastPage = computed(() => currentPage.value >= totalPages.value);
const totalStudentsItems = computed(() => students.value.length);
const studentsTotalPages = computed(() => Math.max(1, Math.ceil(totalStudentsItems.value / studentsItemsPerPage.value)));
const studentsStartIndex = computed(() => (studentsCurrentPage.value - 1) * studentsItemsPerPage.value);
const studentsEndIndex = computed(() => studentsStartIndex.value + studentsItemsPerPage.value);
const paginatedStudents = computed(() => students.value.slice(studentsStartIndex.value, studentsEndIndex.value));
const studentsPageFrom = computed(() => (totalStudentsItems.value ? studentsStartIndex.value + 1 : 0));
const studentsPageTo = computed(() => Math.min(studentsEndIndex.value, totalStudentsItems.value));
const studentsIsFirstPage = computed(() => studentsCurrentPage.value <= 1);
const studentsIsLastPage = computed(() => studentsCurrentPage.value >= studentsTotalPages.value);
const openActionMenuId = ref(null);

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
        itemForm.value = {
            key: '',
            title: '',
            type: 'badge',
            rarity: 'rare',
            icon: collectibleIconCatalog[0]?.value || ''
        };
        await loadLimitedData();
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
        eventForm.value = { key: '', title: '', description: '', startAt: '', endAt: '', isActive: true, episodeId: '', rewardItemId: '' };
        await loadLimitedData();
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

function formatAssessmentMode(mode) {
    if (mode === 'quiz') return 'Quiz';
    if (mode === 'open_text') return 'Resposta aberta';
    if (mode === 'mini_game') return 'Mini game';
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
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
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
    color: color-mix(in srgb, var(--danger) 78%, white);
}

</style>
