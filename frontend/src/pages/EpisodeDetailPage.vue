<template>
  <div>
    <PublicHeader />
    <main class="container" v-if="episode">
      <div class="card" style="padding:24px; display:grid; gap:20px;">
        <img v-if="episode.cover_url" :src="episode.cover_url" :alt="episode.title" style="width:100%; max-height:380px; object-fit:cover; border-radius:16px;" />
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <span class="badge">{{ episode.year_target }}º ano</span>
          <span class="badge">{{ episode.category }}</span>
          <span class="badge" v-if="episode.duration_label">{{ episode.duration_label }}</span>
        </div>
        <h1 style="margin:0;">{{ episode.title }}</h1>
        <p style="margin:0; color:var(--muted); line-height:1.7;">{{ episode.summary }}</p>
        <audio v-if="episode.audio_url" class="audio-player" controls :src="episode.audio_url"></audio>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <a v-if="episode.pdf_url" class="button" :href="episode.pdf_url" target="_blank">Abrir PDF</a>
          <router-link class="button secondary" to="/">Voltar</router-link>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import PublicHeader from '../components/PublicHeader.vue';
import api from '../services/api';
const route = useRoute();
const episode = ref(null);
async function loadEpisode() {
  const { data } = await api.get(`/episodes/public/${route.params.slug}`);
  episode.value = data;
}
onMounted(loadEpisode);
</script>
