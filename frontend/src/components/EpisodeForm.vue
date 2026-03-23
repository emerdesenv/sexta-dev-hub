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
        </div>

        <label class="flex items-center gap-3 text-sm text-muted">
            <input type="checkbox" v-model="form.early_access_only" />
            Disponível apenas para quem resgatou acesso antecipado
        </label>

        <label class="flex flex-col gap-2">
            <span class="sd-label">Resumo</span>
            <textarea class="sd-input" rows="5" v-model="form.summary" required />
        </label>

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

const form = reactive({ title:'', category:'', year_target:1, duration_label:'', tags:'', is_published:false, early_access_only:false, summary:'', cover:null, audio:null, pdf:null });

watch(() => props.modelValue, (value) => {
    Object.assign(form, { title:'', category:'', year_target:1, duration_label:'', tags:'', is_published:false, early_access_only:false, summary:'', cover:null, audio:null, pdf:null }, value || {});
    if (Array.isArray(value?.tags)) form.tags = value.tags.join(', ');
}, { immediate: true });

function setFile(event, key) { form[key] = event.target.files?.[0] || null; }

function submitForm() {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) payload.append(key, value);
    });
    emit('submit', payload);
}
</script>
