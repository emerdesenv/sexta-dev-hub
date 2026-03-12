<template>
  <div>
    <PublicHeader />
    <main class="container">
      <section class="card hero">
        <div>
          <span class="badge">Conteúdo aberto para alunos</span>
          <h1>Microaulas de ADS.</h1>
          <p>O aluno acessa diretamente pelo IP ou domínio principal. A área do professor fica isolada em <strong>/professor</strong>, com autenticação própria para gestão do conteúdo.</p>
          <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:16px;">
            <a href="#episodios" class="button">Explorar episódios</a>
          </div>
        </div>
        <div class="grid">
          <div class="card kpi"><strong>{{ episodes.length }}</strong><br /><span style="color:var(--muted);">episódios publicados</span></div>
          <div class="card kpi"><strong>PDF + Áudio</strong><br /><span style="color:var(--muted);">microlearning centralizado</span></div>
          <div class="card kpi"><strong>GitHub / Site</strong><br /><span style="color:var(--muted);">base pronta para produção</span></div>
        </div>
      </section>

      <section class="filters" id="episodios">
        <select v-model="filters.year">
          <option value="">Todos os anos</option>
          <option value="1">1º ano</option>
          <option value="2">2º ano</option>
          <option value="3">3º ano</option>
        </select>
        <input v-model="filters.category" placeholder="Filtrar por categoria" />
        <button class="button secondary" @click="loadEpisodes">Filtrar</button>
      </section>

      <div class="episode-grid">
        <EpisodeCard v-for="episode in episodes" :key="episode.id" :episode="episode" />
      </div>
      <div v-if="!episodes.length" class="notice" style="margin-top:20px;">Nenhum episódio publicado encontrado com os filtros selecionados.</div>
    </main>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import EpisodeCard from '../components/EpisodeCard.vue';
import api from '../services/api';

const episodes = ref([]);
const filters = reactive({ year: '', category: '' });

async function loadEpisodes() {
  const params = {};
  if (filters.year) params.year = filters.year;
  if (filters.category) params.category = filters.category;
  const { data } = await api.get('/episodes/public', { params });
  episodes.value = data;
}

onMounted(loadEpisodes);
</script>
