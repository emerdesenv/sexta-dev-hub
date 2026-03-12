<template>
  <div>
    <PublicHeader />
    <main class="container admin-layout">
      <aside class="card sidebar">
        <div style="display:grid; gap:10px;">
          <span class="badge">Gestão administrativa</span>
          <h2 style="margin:0;">Olá, {{ auth.user?.username }}</h2>
          <p style="margin:0; color:var(--muted);">Gerencie episódios, publique materiais e mantenha a área pública atualizada.</p>
          <button class="button" @click="openCreate">Novo episódio</button>
          <button class="button secondary" @click="auth.logout(); router.push('/professor')">Sair</button>
        </div>
      </aside>

      <section class="grid">
        <EpisodeForm v-if="showForm" :editing="editing" :model-value="selectedEpisode" @submit="handleSubmit" @cancel="resetForm" />

        <div class="card" style="padding:20px; overflow:auto;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap;">
            <h2 style="margin:0;">Episódios cadastrados</h2>
            <span class="badge">{{ episodes.length }} registros</span>
          </div>
          <table class="table">
            <thead>
              <tr><th>Título</th><th>Ano</th><th>Status</th><th>Categoria</th><th>Ações</th></tr>
            </thead>
            <tbody>
              <tr v-for="episode in episodes" :key="episode.id">
                <td>{{ episode.title }}</td>
                <td>{{ episode.year_target }}º ano</td>
                <td>{{ episode.is_published ? 'Publicado' : 'Rascunho' }}</td>
                <td>{{ episode.category }}</td>
                <td style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button class="button secondary" @click="editEpisode(episode)">Editar</button>
                  <button class="button danger" @click="removeEpisode(episode.id)">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeForm from '../components/EpisodeForm.vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
const router = useRouter();
const episodes = ref([]);
const showForm = ref(false);
const editing = ref(false);
const selectedEpisode = ref(null);
async function loadEpisodes() {
  const { data } = await api.get('/episodes');
  episodes.value = data;
}
function openCreate() {
  editing.value = false;
  selectedEpisode.value = null;
  showForm.value = true;
}
function editEpisode(episode) {
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
  if (editing.value && selectedEpisode.value) {
    await api.put(`/episodes/${selectedEpisode.value.id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  } else {
    await api.post('/episodes', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  resetForm();
  loadEpisodes();
}
async function removeEpisode(id) {
  if (!confirm('Deseja realmente excluir este episódio?')) return;
  await api.delete(`/episodes/${id}`);
  loadEpisodes();
}
onMounted(loadEpisodes);
</script>
