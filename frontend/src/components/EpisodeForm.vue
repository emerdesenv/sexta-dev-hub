<template>
    <form class="p-4 md:p-6 flex flex-col gap-5" @submit.prevent="submitForm">
        <h2 class="text-xl font-bold">
            {{ editing ? 'Editar episódio' : 'Novo episódio' }}
        </h2>

        <div class="episode-form-tabs" role="tablist" aria-label="Seções do formulário de episódio">
            <button
                type="button"
                class="episode-form-tab"
                :class="{ 'episode-form-tab--active': activeTab === 'main' }"
                role="tab"
                :aria-selected="activeTab === 'main'"
                @click="activeTab = 'main'"
            >
                Informações principais
            </button>
            <button
                type="button"
                class="episode-form-tab"
                :class="{ 'episode-form-tab--active': activeTab === 'media' }"
                role="tab"
                :aria-selected="activeTab === 'media'"
                @click="activeTab = 'media'"
            >
                Capa, imagem e áudio
            </button>
        </div>

        <div v-if="activeTab === 'main'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex flex-col gap-2">
                <span class="sd-label">Título</span>
                <input class="sd-input" v-model="form.title" required />
            </label>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Categoria</span>
                <input class="sd-input" v-model="form.category" required />
            </label>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Ano alvo</span>
                <select class="sd-input" v-model="form.year_target">
                    <option :value="1">1º ano</option>
                    <option :value="2">2º ano</option>
                    <option :value="3">3º ano</option>
                </select>
            </label>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Duração (ex: 05:20)</span>
                <input class="sd-input" v-model="form.duration_label" />
            </label>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Tags (separadas por vírgula)</span>
                <input class="sd-input" v-model="form.tags" />
            </label>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Status</span>
                <select class="sd-input" v-model="form.is_published">
                    <option :value="true">Publicado</option>
                    <option :value="false">Rascunho</option>
                </select>
            </label>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Tipo do episódio</span>
                <select class="sd-input" v-model="form.episode_type">
                    <option value="study">Estudo</option>
                    <option value="assessment">Avaliativo</option>
                </select>
            </label>
        </div>

        <label v-if="activeTab === 'main'" class="flex items-center gap-3 text-sm text-muted">
            <input type="checkbox" v-model="form.early_access_only" />
            Disponível apenas para quem resgatou acesso antecipado
        </label>

        <label v-if="activeTab === 'main'" class="flex flex-col gap-2 max-w-md">
            <span class="sd-label">Troféu ao concluir (coleção)</span>
            <select class="sd-input" v-model="form.trophy_tier">
                <option value="">Nenhum - contagem só por XP/moedas neste episódio</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Prata</option>
                <option value="gold">Ouro</option>
                <option value="platinum">Platina</option>
            </select>
            <span class="text-xs text-muted">
                Troféus entram na barra da gamificação; não alteram XP ou moedas além do que o episódio já concede.
            </span>
        </label>

        <label v-if="activeTab === 'main'" class="flex flex-col gap-2">
            <span class="sd-label">Resumo</span>
            <textarea class="sd-input" rows="5" v-model="form.summary" required />
        </label>

        <div v-if="activeTab === 'main' && form.episode_type === 'assessment'" class="sd-card p-4 flex flex-col gap-4">
            <h3 class="text-base font-semibold">Configuração avaliativa</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Modo</span>
                    <select class="sd-input" v-model="form.assessment_mode">
                        <option value="quiz">Quiz</option>
                        <option value="open_text">Resposta aberta</option>
                        <option value="mini_game">Mini game</option>
                        <option value="semver">Versionamento (SemVer)</option>
                        <option value="classification">Classificação por grupo</option>
                        <option value="fill_blanks">Complete as lacunas</option>
                        <option value="matching">Correspondência</option>
                    </select>
                </label>
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Tentativas máximas</span>
                    <input class="sd-input" type="number" min="1" max="10" v-model.number="form.max_attempts" />
                </label>
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Nota mínima (%)</span>
                    <input class="sd-input" type="number" min="0" max="100" v-model.number="form.passing_score" />
                </label>
                <label class="flex flex-col gap-2">
                    <span class="sd-label">XP da missão</span>
                    <input class="sd-input" type="number" min="0" max="1000" v-model.number="form.xp_reward" />
                </label>
            </div>

            <label class="flex flex-col gap-2">
                <span class="sd-label">Tempo limite (segundos, opcional)</span>
                <input class="sd-input" type="number" min="30" max="7200" v-model.number="form.time_limit_sec" />
            </label>

            <div v-if="form.assessment_mode === 'quiz'" class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <span class="sd-label">Perguntas do quiz</span>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-sm" @click="addQuizQuestion">
                        Adicionar pergunta
                    </Button>
                </div>
                <div v-for="(question, index) in form.assessment_config.questions" :key="`question-${index}`" class="sd-card p-3 flex flex-col gap-3">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Pergunta {{ index + 1 }}</span>
                        <input class="sd-input" v-model="question.prompt" />
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label v-for="(option, optionIndex) in question.options" :key="`opt-${index}-${optionIndex}`" class="flex flex-col gap-2">
                            <span class="sd-label">Opção {{ optionIndex + 1 }}</span>
                            <input class="sd-input" v-model="question.options[optionIndex]" />
                        </label>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Resposta correta</span>
                            <select class="sd-input" v-model.number="question.correctOptionIndex">
                                <option :value="0">Opção 1</option>
                                <option :value="1">Opção 2</option>
                                <option :value="2">Opção 3</option>
                            </select>
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="sd-label">Peso</span>
                            <input class="sd-input" type="number" min="1" v-model.number="question.weight" />
                        </label>
                    </div>
                    <div class="flex justify-end">
                        <Button type="button" variant="secondary" class="px-3 py-2 text-sm" @click="removeQuizQuestion(index)">
                            Remover
                        </Button>
                    </div>
                </div>
            </div>

            <div v-else-if="form.assessment_mode === 'open_text'" class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Enunciado</span>
                    <textarea class="sd-input assessment-answer-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('bold')">
                        + Negrito
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('bullet')">
                        + Tópicos
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('numbered')">
                        + Lista numerada
                    </Button>
                </div>
                <p class="text-xs text-muted">
                    Dica: o enunciado aceita Markdown (ex.: <code>**negrito**</code>, <code>- item</code>, <code>1. passo</code>).
                </p>
                <div v-if="promptPreviewHtml" class="prompt-preview-box">
                    <div class="prompt-preview-title">Pré-visualização do enunciado</div>
                    <div class="prompt-preview-content" v-html="promptPreviewHtml" />
                </div>
            </div>

            <div v-else-if="form.assessment_mode === 'mini_game'" class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Tema do mini game (ordenação)</span>
                    <textarea class="sd-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('bold')">
                        + Negrito
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('bullet')">
                        + Tópicos
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('numbered')">
                        + Lista numerada
                    </Button>
                </div>
                <p class="text-xs text-muted">
                    Dica: o enunciado aceita Markdown (ex.: <code>**negrito**</code>, <code>- item</code>, <code>1. passo</code>).
                </p>
                <div v-if="promptPreviewHtml" class="prompt-preview-box">
                    <div class="prompt-preview-title">Pré-visualização do enunciado</div>
                    <div class="prompt-preview-content" v-html="promptPreviewHtml" />
                </div>
                <div class="flex items-center justify-between">
                    <span class="sd-label">Itens em ordem correta</span>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-sm" @click="addOrderingItem">
                        Adicionar item
                    </Button>
                </div>
                <label v-for="(item, index) in form.assessment_config.items" :key="`item-${index}`" class="flex flex-col gap-2">
                    <span class="sd-label">Posição {{ index + 1 }}</span>
                    <input class="sd-input" v-model="item.label" />
                </label>
            </div>

            <div v-else-if="form.assessment_mode === 'semver'" class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Enunciado</span>
                    <textarea class="sd-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('bold')">
                        + Negrito
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('bullet')">
                        + Tópicos
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="applyPromptFormat('numbered')">
                        + Lista numerada
                    </Button>
                </div>
                <p class="text-xs text-muted">
                    Dica: o enunciado aceita Markdown (ex.: <code>**negrito**</code>, <code>- item</code>, <code>1. passo</code>).
                </p>
                <div v-if="promptPreviewHtml" class="prompt-preview-box">
                    <div class="prompt-preview-title">Pré-visualização do enunciado</div>
                    <div class="prompt-preview-content" v-html="promptPreviewHtml" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">MAJOR esperado</span>
                        <input class="sd-input" type="number" min="0" v-model.number="form.assessment_config.expected.major" />
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">MINOR esperado</span>
                        <input class="sd-input" type="number" min="0" v-model.number="form.assessment_config.expected.minor" />
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">PATCH esperado</span>
                        <input class="sd-input" type="number" min="0" v-model.number="form.assessment_config.expected.patch" />
                    </label>
                </div>
            </div>

            <div v-else-if="form.assessment_mode === 'classification'" class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Enunciado</span>
                    <textarea class="sd-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="addClassificationGroup">
                        Adicionar grupo
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="addClassificationItem">
                        Adicionar item
                    </Button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label v-for="(group, index) in form.assessment_config.groups" :key="`group-${group.id}`" class="flex flex-col gap-2">
                        <span class="sd-label">Grupo {{ index + 1 }}</span>
                        <input class="sd-input assessment-answer-input" v-model="group.label" />
                    </label>
                </div>
                <div v-for="(item, index) in form.assessment_config.items" :key="`class-item-${item.id}`" class="sd-card p-3 flex flex-col gap-3">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Item {{ index + 1 }}</span>
                        <input class="sd-input assessment-answer-input" v-model="item.label" />
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Grupo correto</span>
                        <select class="sd-input assessment-answer-select" v-model="item.correctGroupId">
                            <option v-for="group in form.assessment_config.groups" :key="`group-opt-${group.id}`" :value="group.id">
                                {{ group.label || group.id }}
                            </option>
                        </select>
                    </label>
                </div>
            </div>

            <div v-else-if="form.assessment_mode === 'fill_blanks'" class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Enunciado (use placeholders como <code v-pre>{{b1}}</code>)</span>
                    <textarea class="sd-input assessment-answer-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
                <Button type="button" variant="secondary" class="px-3 py-2 text-xs self-start" @click="addBlank">
                    Adicionar lacuna
                </Button>
                <div v-for="(blank, index) in form.assessment_config.blanks" :key="`blank-${blank.id}`" class="sd-card p-3 flex flex-col gap-3">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Lacuna {{ index + 1 }} (ID)</span>
                        <input class="sd-input assessment-answer-input" v-model="blank.id" />
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Respostas aceitas (separe por vírgula)</span>
                        <input class="sd-input assessment-answer-input" v-model="blank.answersCsv" />
                    </label>
                    <label class="flex items-center gap-2 text-sm text-muted">
                        <input type="checkbox" v-model="blank.caseSensitive" />
                        Diferenciar maiúsculas/minúsculas
                    </label>
                </div>
            </div>

            <div v-else class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Enunciado</span>
                    <textarea class="sd-input assessment-answer-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
                <div class="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="addMatchingLeft">
                        Adicionar item esquerda
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="addMatchingRight">
                        Adicionar item direita
                    </Button>
                    <Button type="button" variant="secondary" class="px-3 py-2 text-xs" @click="addMatchingPair">
                        Adicionar par correto
                    </Button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="sd-card p-3 flex flex-col gap-2">
                        <span class="sd-label">Coluna esquerda</span>
                        <label v-for="item in form.assessment_config.leftItems" :key="`left-${item.id}`" class="flex flex-col gap-1">
                            <input class="sd-input assessment-answer-input" v-model="item.label" />
                        </label>
                    </div>
                    <div class="sd-card p-3 flex flex-col gap-2">
                        <span class="sd-label">Coluna direita</span>
                        <label v-for="item in form.assessment_config.rightItems" :key="`right-${item.id}`" class="flex flex-col gap-1">
                            <input class="sd-input assessment-answer-input" v-model="item.label" />
                        </label>
                    </div>
                </div>
                <div v-for="(pair, index) in form.assessment_config.pairs" :key="`pair-${index}`" class="sd-card p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Esquerda (par {{ index + 1 }})</span>
                        <select class="sd-input assessment-answer-select" v-model="pair.leftId">
                            <option v-for="item in form.assessment_config.leftItems" :key="`pair-left-${item.id}`" :value="item.id">
                                {{ item.label || item.id }}
                            </option>
                        </select>
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="sd-label">Direita correta</span>
                        <select class="sd-input assessment-answer-select" v-model="pair.rightId">
                            <option v-for="item in form.assessment_config.rightItems" :key="`pair-right-${item.id}`" :value="item.id">
                                {{ item.label || item.id }}
                            </option>
                        </select>
                    </label>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'media'" class="sd-card p-4 md:p-5 flex flex-col gap-4">
            <div class="text-sm text-muted">
                Faça upload dos materiais de apoio do episódio (capa, imagem complementar, áudio e PDF).
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label class="flex flex-col gap-2">
                <span class="sd-label">Capa</span>
                <input
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border file:border-border/90 file:bg-surface file:px-4 file:py-2 file:text-text hover:file:bg-surface-2"
                    @change="setFile($event, 'cover')"
                />
            </label>
            <label class="flex flex-col gap-2">
                <span class="sd-label">Áudio</span>
                <input
                    type="file"
                    accept="audio/*"
                    class="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border file:border-border/90 file:bg-surface file:px-4 file:py-2 file:text-text hover:file:bg-surface-2"
                    @change="setFile($event, 'audio')"
                />
            </label>
            <label class="flex flex-col gap-2">
                <span class="sd-label">Imagem complementar</span>
                <input
                    type="file"
                    accept="image/*"
                    class="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border file:border-border/90 file:bg-surface file:px-4 file:py-2 file:text-text hover:file:bg-surface-2"
                    @change="setFile($event, 'image')"
                />
            </label>
            <label class="flex flex-col gap-2">
                <span class="sd-label">PDF</span>
                <input
                    type="file"
                    accept="application/pdf"
                    class="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border file:border-border/90 file:bg-surface file:px-4 file:py-2 file:text-text hover:file:bg-surface-2"
                    @change="setFile($event, 'pdf')"
                />
            </label>
            </div>
        </div>

        <div class="flex gap-3 justify-end">
            <Button variant="secondary" type="button" class="px-3 py-2 text-sm" @click="$emit('cancel')">
                Cancelar
            </Button>
            <Button variant="primary" type="submit" class="px-3 py-2 text-sm">
                Salvar
            </Button>
        </div>
    </form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';

import Button from './ui/Button.vue';

const props = defineProps({ modelValue: Object, editing: Boolean });
const emit = defineEmits(['submit', 'cancel']);
const activeTab = ref('main');

const defaults = {
    title: '',
    category: '',
    year_target: 1,
    duration_label: '',
    tags: '',
    trophy_tier: '',
    is_published: false,
    early_access_only: false,
    summary: '',
    cover: null,
    image: null,
    audio: null,
    pdf: null,
    episode_type: 'study',
    assessment_mode: 'quiz',
    max_attempts: 1,
    passing_score: 60,
    time_limit_sec: null,
    xp_reward: 40,
    assessment_config: { questions: [] }
};
const form = reactive({ ...defaults });
const promptPreviewHtml = computed(() => renderPromptMarkdown(form.assessment_config?.prompt || ''));

watch(() => props.modelValue, (value) => {
    activeTab.value = 'main';
    Object.assign(form, { ...defaults }, value || {});
    form.trophy_tier = value?.trophy_tier ? String(value.trophy_tier) : '';
    if (Array.isArray(value?.tags)) form.tags = value.tags.join(', ');
    if (value?.assessment_config && typeof value.assessment_config === 'object') {
        form.assessment_config = JSON.parse(JSON.stringify(value.assessment_config));
    }
    ensureAssessmentShape();
}, { immediate: true });

watch(() => form.episode_type, ensureAssessmentShape);
watch(() => form.assessment_mode, ensureAssessmentShape);

function setFile(event, key) { form[key] = event.target.files?.[0] || null; }

function createQuestion(index = 0) {
    return {
        id: `q_${Date.now()}_${index}`,
        prompt: '',
        options: ['', '', ''],
        correctOptionIndex: 0,
        weight: 1
    };
}

function ensureAssessmentShape() {
    if (form.episode_type !== 'assessment') return;
    if (form.assessment_mode === 'quiz') {
        if (!Array.isArray(form.assessment_config?.questions)) {
            form.assessment_config = { questions: [] };
        }
        if (!form.assessment_config.questions.length) {
            form.assessment_config.questions = [createQuestion(0)];
        }
    } else if (form.assessment_mode === 'open_text') {
        if (typeof form.assessment_config?.prompt !== 'string') {
            form.assessment_config = { prompt: '' };
        }
    } else if (form.assessment_mode === 'mini_game') {
        if (!Array.isArray(form.assessment_config?.items)) {
            form.assessment_config = {
                prompt: '',
                items: [{ id: 'item_1', label: '' }, { id: 'item_2', label: '' }]
            };
        }
    } else if (form.assessment_mode === 'semver') {
        const maybeExpected = form.assessment_config?.expected;
        const expected = {
            major: Number.isInteger(Number(maybeExpected?.major)) ? Math.max(0, Number(maybeExpected.major)) : 0,
            minor: Number.isInteger(Number(maybeExpected?.minor)) ? Math.max(0, Number(maybeExpected.minor)) : 0,
            patch: Number.isInteger(Number(maybeExpected?.patch)) ? Math.max(0, Number(maybeExpected.patch)) : 0
        };
        form.assessment_config = {
            prompt: typeof form.assessment_config?.prompt === 'string' ? form.assessment_config.prompt : '',
            expected
        };
    } else if (form.assessment_mode === 'classification') {
        const groups = Array.isArray(form.assessment_config?.groups) ? form.assessment_config.groups : [];
        const items = Array.isArray(form.assessment_config?.items) ? form.assessment_config.items : [];
        form.assessment_config = {
            prompt: typeof form.assessment_config?.prompt === 'string' ? form.assessment_config.prompt : '',
            groups: groups.length ? groups : [{ id: 'g_major', label: 'MAJOR' }, { id: 'g_minor', label: 'MINOR' }],
            items: items.length ? items : [{ id: 'c_1', label: '', correctGroupId: 'g_major' }]
        };
    } else if (form.assessment_mode === 'fill_blanks') {
        const blanks = Array.isArray(form.assessment_config?.blanks) ? form.assessment_config.blanks : [];
        form.assessment_config = {
            prompt: typeof form.assessment_config?.prompt === 'string' ? form.assessment_config.prompt : '',
            blanks: blanks.length ? blanks.map((blank, index) => ({
                id: blank?.id || `b${index + 1}`,
                answersCsv: Array.isArray(blank?.answers) ? blank.answers.join(', ') : (blank?.answersCsv || ''),
                caseSensitive: Boolean(blank?.caseSensitive)
            })) : [{ id: 'b1', answersCsv: '', caseSensitive: false }]
        };
    } else {
        const leftItems = Array.isArray(form.assessment_config?.leftItems) ? form.assessment_config.leftItems : [];
        const rightItems = Array.isArray(form.assessment_config?.rightItems) ? form.assessment_config.rightItems : [];
        const pairs = Array.isArray(form.assessment_config?.pairs) ? form.assessment_config.pairs : [];
        form.assessment_config = {
            prompt: typeof form.assessment_config?.prompt === 'string' ? form.assessment_config.prompt : '',
            leftItems: leftItems.length ? leftItems : [{ id: 'l1', label: '' }],
            rightItems: rightItems.length ? rightItems : [{ id: 'r1', label: '' }],
            pairs: pairs.length ? pairs : [{ leftId: 'l1', rightId: 'r1' }]
        };
    }
}

function addQuizQuestion() {
    form.assessment_config.questions.push(createQuestion(form.assessment_config.questions.length));
}

function removeQuizQuestion(index) {
    form.assessment_config.questions.splice(index, 1);
    if (!form.assessment_config.questions.length) {
        form.assessment_config.questions.push(createQuestion(0));
    }
}

function addOrderingItem() {
    const nextIndex = form.assessment_config.items.length + 1;
    form.assessment_config.items.push({ id: `item_${nextIndex}`, label: '' });
}

function addClassificationGroup() {
    const next = form.assessment_config.groups.length + 1;
    form.assessment_config.groups.push({ id: `g_${next}`, label: '' });
}

function addClassificationItem() {
    const next = form.assessment_config.items.length + 1;
    const fallbackGroup = form.assessment_config.groups[0]?.id || '';
    form.assessment_config.items.push({ id: `c_${next}`, label: '', correctGroupId: fallbackGroup });
}

function addBlank() {
    const next = form.assessment_config.blanks.length + 1;
    form.assessment_config.blanks.push({ id: `b${next}`, answersCsv: '', caseSensitive: false });
}

function addMatchingLeft() {
    const next = form.assessment_config.leftItems.length + 1;
    form.assessment_config.leftItems.push({ id: `l${next}`, label: '' });
}

function addMatchingRight() {
    const next = form.assessment_config.rightItems.length + 1;
    form.assessment_config.rightItems.push({ id: `r${next}`, label: '' });
}

function addMatchingPair() {
    const fallbackLeft = form.assessment_config.leftItems[0]?.id || '';
    const fallbackRight = form.assessment_config.rightItems[0]?.id || '';
    form.assessment_config.pairs.push({ leftId: fallbackLeft, rightId: fallbackRight });
}

function applyPromptFormat(type) {
    if (!form.assessment_config || typeof form.assessment_config !== 'object') return;
    const current = String(form.assessment_config.prompt || '');
    const prefix = current.trim().length ? '\n' : '';
    let snippet = '';
    if (type === 'bold') {
        snippet = '**texto em negrito**';
    } else if (type === 'bullet') {
        snippet = '- item 1\n- item 2';
    } else if (type === 'numbered') {
        snippet = '1. passo 1\n2. passo 2';
    }
    form.assessment_config.prompt = `${current}${prefix}${snippet}`.trimStart();
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatInlineMarkdown(value) {
    let output = escapeHtml(value);
    output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    output = output.replace(/\*(.+?)\*/g, '<em>$1</em>');
    output = output.replace(/`(.+?)`/g, '<code>$1</code>');
    return output;
}

function renderPromptMarkdown(value) {
    const source = String(value || '').trim();
    if (!source) return '';
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const chunks = [];
    let paragraphBuffer = [];
    let listType = null;
    let listBuffer = [];

    const flushParagraph = () => {
        if (!paragraphBuffer.length) return;
        const html = paragraphBuffer.map((line) => formatInlineMarkdown(line)).join('<br />');
        chunks.push(`<p>${html}</p>`);
        paragraphBuffer = [];
    };

    const flushList = () => {
        if (!listType || !listBuffer.length) return;
        const tag = listType === 'ol' ? 'ol' : 'ul';
        const items = listBuffer.map((line) => `<li>${formatInlineMarkdown(line)}</li>`).join('');
        chunks.push(`<${tag}>${items}</${tag}>`);
        listType = null;
        listBuffer = [];
    };

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();
            const level = Math.min(3, headingMatch[1].length);
            chunks.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
            continue;
        }

        const unorderedMatch = trimmed.match(/^-\s+(.+)$/);
        if (unorderedMatch) {
            flushParagraph();
            if (listType !== 'ul') {
                flushList();
                listType = 'ul';
            }
            listBuffer.push(unorderedMatch[1]);
            continue;
        }

        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        if (orderedMatch) {
            flushParagraph();
            if (listType !== 'ol') {
                flushList();
                listType = 'ol';
            }
            listBuffer.push(orderedMatch[1]);
            continue;
        }

        flushList();
        paragraphBuffer.push(trimmed);
    }

    flushParagraph();
    flushList();
    return chunks.join('');
}

function submitForm() {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
        if (key === 'trophy_tier') {
            payload.append('trophy_tier', value === null || value === undefined || value === '' ? '' : value);
            return;
        }
        if (value === null || value === undefined) return;
        if (key === 'assessment_config') {
            if (form.episode_type === 'assessment') {
                const config = form.assessment_mode === 'mini_game'
                    ? {
                        gameType: 'ordering',
                        prompt: String(form.assessment_config.prompt || '').trim(),
                        items: form.assessment_config.items
                            .map((item) => String(item.label || '').trim())
                            .filter(Boolean)
                            .map((label, index) => ({ id: `item_${index + 1}`, label, correctPosition: index + 1 }))
                    }
                    : form.assessment_mode === 'semver'
                        ? {
                            prompt: String(form.assessment_config.prompt || '').trim(),
                            expected: {
                                major: Math.max(0, Number(form.assessment_config?.expected?.major || 0)),
                                minor: Math.max(0, Number(form.assessment_config?.expected?.minor || 0)),
                                patch: Math.max(0, Number(form.assessment_config?.expected?.patch || 0))
                            }
                        }
                    : form.assessment_mode === 'classification'
                        ? {
                            prompt: String(form.assessment_config.prompt || '').trim(),
                            groups: form.assessment_config.groups
                                .map((group, index) => ({
                                    id: String(group.id || `g_${index + 1}`).trim(),
                                    label: String(group.label || '').trim()
                                }))
                                .filter((group) => group.id && group.label),
                            items: form.assessment_config.items
                                .map((item, index) => ({
                                    id: String(item.id || `c_${index + 1}`).trim(),
                                    label: String(item.label || '').trim(),
                                    correctGroupId: String(item.correctGroupId || '').trim()
                                }))
                                .filter((item) => item.id && item.label && item.correctGroupId)
                        }
                    : form.assessment_mode === 'fill_blanks'
                        ? {
                            prompt: String(form.assessment_config.prompt || '').trim(),
                            blanks: form.assessment_config.blanks
                                .map((blank, index) => ({
                                    id: String(blank.id || `b${index + 1}`).trim(),
                                    caseSensitive: Boolean(blank.caseSensitive),
                                    answers: String(blank.answersCsv || '')
                                        .split(',')
                                        .map((item) => item.trim())
                                        .filter(Boolean)
                                }))
                                .filter((blank) => blank.id && blank.answers.length)
                        }
                    : form.assessment_mode === 'matching'
                        ? {
                            prompt: String(form.assessment_config.prompt || '').trim(),
                            leftItems: form.assessment_config.leftItems
                                .map((item, index) => ({
                                    id: String(item.id || `l${index + 1}`).trim(),
                                    label: String(item.label || '').trim()
                                }))
                                .filter((item) => item.id && item.label),
                            rightItems: form.assessment_config.rightItems
                                .map((item, index) => ({
                                    id: String(item.id || `r${index + 1}`).trim(),
                                    label: String(item.label || '').trim()
                                }))
                                .filter((item) => item.id && item.label),
                            pairs: form.assessment_config.pairs
                                .map((pair) => ({
                                    leftId: String(pair.leftId || '').trim(),
                                    rightId: String(pair.rightId || '').trim()
                                }))
                                .filter((pair) => pair.leftId && pair.rightId)
                        }
                    : form.assessment_config;
                payload.append('assessment_config', JSON.stringify(config));
            }
            return;
        }
        if (key === 'time_limit_sec' && !value) return;
        payload.append(key, value);
    });
    emit('submit', payload);
}
</script>

<style scoped>
.prompt-preview-box {
    border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
    background: color-mix(in srgb, var(--surface-2) 40%, transparent);
    border-radius: 10px;
    padding: 0.7rem;
}

.prompt-preview-title {
    font-size: 0.78rem;
    color: var(--muted);
    margin-bottom: 0.35rem;
    font-weight: 600;
}

.prompt-preview-content {
    font-size: 0.92rem;
    line-height: 1.45;
}

.prompt-preview-content :deep(p) {
    margin: 0.35rem 0;
}

.prompt-preview-content :deep(ul),
.prompt-preview-content :deep(ol) {
    margin: 0.35rem 0 0.35rem 1.2rem;
    padding: 0;
}

.prompt-preview-content :deep(li) {
    margin: 0.15rem 0;
}

.prompt-preview-content :deep(h1),
.prompt-preview-content :deep(h2),
.prompt-preview-content :deep(h3) {
    margin: 0.45rem 0 0.25rem;
    font-weight: 700;
}

.prompt-preview-content :deep(code) {
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
    border-radius: 6px;
    padding: 0.05rem 0.35rem;
    font-size: 0.82em;
}

.episode-form-tabs {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
    background: color-mix(in srgb, var(--surface-2) 52%, transparent);
    width: fit-content;
}

.episode-form-tab {
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

.episode-form-tab:hover {
    color: var(--text);
    background: color-mix(in srgb, var(--surface) 72%, transparent);
}

.episode-form-tab--active {
    color: color-mix(in srgb, var(--primary) 88%, white);
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary) 24%, transparent);
}

.assessment-answer-input,
.assessment-answer-select {
    background: color-mix(in srgb, var(--surface) 94%, white 6%);
    border-color: color-mix(in srgb, var(--border) 78%, var(--primary) 22%);
    color: var(--text);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--text) 4%, transparent);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.assessment-answer-input::placeholder {
    color: color-mix(in srgb, var(--text-muted) 80%, transparent);
}

.assessment-answer-input:hover,
.assessment-answer-select:hover {
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
    background: color-mix(in srgb, var(--surface) 88%, white 12%);
}

.assessment-answer-input:focus,
.assessment-answer-select:focus {
    border-color: color-mix(in srgb, var(--primary) 72%, var(--focus-ring));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent);
    outline: none;
}
</style>
