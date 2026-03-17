<template>
    <form class="card" style="padding:20px; display:grid; gap:14px;" @submit.prevent="submitForm">
        <h2 style="margin:0;">{{ editing ? 'Editar episódio' : 'Novo episódio' }}</h2>
        <div class="grid" style="grid-template-columns:1fr 1fr;">
            <label>Título <input v-model="form.title" required /></label>
            <label>Categoria <input v-model="form.category" required /></label>
            <label>Ano alvo
                <select v-model="form.year_target">
                <option :value="1">1º ano</option>
                <option :value="2">2º ano</option>
                <option :value="3">3º ano</option>
                </select>
            </label>

            <label>Duração (ex: 05:20) <input v-model="form.duration_label" /></label>
            <label>Tags (separadas por vírgula) <input v-model="form.tags" /></label>
            <label>Status
                <select v-model="form.is_published">
                <option :value="true">Publicado</option>
                <option :value="false">Rascunho</option>
                </select>
            </label>
        </div>

        <label>Resumo <textarea rows="5" v-model="form.summary" required /></label>
        <div class="grid" style="grid-template-columns:1fr 1fr 1fr;">
            <label>Capa <input type="file" accept="image/*" @change="setFile($event, 'cover')" /></label>
            <label>Áudio <input type="file" accept="audio/*" @change="setFile($event, 'audio')" /></label>
            <label>PDF <input type="file" accept="application/pdf" @change="setFile($event, 'pdf')" /></label>
        </div>

        <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="button secondary" @click="$emit('cancel')">Cancelar</button>
            <button type="submit" class="button">Salvar</button>
        </div>
    </form>
</template>

<script setup>
import { reactive, watch } from 'vue';
const props = defineProps({ modelValue: Object, editing: Boolean });
const emit = defineEmits(['submit', 'cancel']);
const form = reactive({ title:'', category:'', year_target:1, duration_label:'', tags:'', is_published:false, summary:'', cover:null, audio:null, pdf:null });
watch(() => props.modelValue, (value) => {
Object.assign(form, { title:'', category:'', year_target:1, duration_label:'', tags:'', is_published:false, summary:'', cover:null, audio:null, pdf:null }, value || {});
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
