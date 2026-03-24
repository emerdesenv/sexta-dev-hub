<template>
    <form class="sd-card p-6 flex flex-col gap-5" @submit.prevent="submitForm">
        <h2 class="text-xl font-bold">
            {{ editing ? 'Editar episódio' : 'Novo episódio' }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <label class="flex items-center gap-3 text-sm text-muted">
            <input type="checkbox" v-model="form.early_access_only" />
            Disponível apenas para quem resgatou acesso antecipado
        </label>

        <label class="flex flex-col gap-2">
            <span class="sd-label">Resumo</span>
            <textarea class="sd-input" rows="5" v-model="form.summary" required />
        </label>

        <div v-if="form.episode_type === 'assessment'" class="sd-card p-4 flex flex-col gap-4">
            <h3 class="text-base font-semibold">Configuração avaliativa</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Modo</span>
                    <select class="sd-input" v-model="form.assessment_mode">
                        <option value="quiz">Quiz</option>
                        <option value="open_text">Resposta aberta</option>
                        <option value="mini_game">Mini game</option>
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
                    <textarea class="sd-input" rows="4" v-model="form.assessment_config.prompt" />
                </label>
            </div>

            <div v-else class="flex flex-col gap-3">
                <label class="flex flex-col gap-2">
                    <span class="sd-label">Tema do mini game (ordenação)</span>
                    <input class="sd-input" v-model="form.assessment_config.prompt" />
                </label>
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
                <span class="sd-label">PDF</span>
                <input
                    type="file"
                    accept="application/pdf"
                    class="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border file:border-border/90 file:bg-surface file:px-4 file:py-2 file:text-text hover:file:bg-surface-2"
                    @change="setFile($event, 'pdf')"
                />
            </label>
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
import { reactive, watch } from 'vue';

import Button from './ui/Button.vue';

const props = defineProps({ modelValue: Object, editing: Boolean });
const emit = defineEmits(['submit', 'cancel']);

const defaults = {
    title: '',
    category: '',
    year_target: 1,
    duration_label: '',
    tags: '',
    is_published: false,
    early_access_only: false,
    summary: '',
    cover: null,
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

watch(() => props.modelValue, (value) => {
    Object.assign(form, { ...defaults }, value || {});
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
    } else {
        if (!Array.isArray(form.assessment_config?.items)) {
            form.assessment_config = {
                prompt: '',
                items: [{ id: 'item_1', label: '' }, { id: 'item_2', label: '' }]
            };
        }
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

function submitForm() {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
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
