<template>
    <article class="card episode-card">
        <img v-if="episode.cover_url" :src="episode.cover_url" :alt="episode.title" />
        <div class="content">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <span class="badge">{{ episode.year_target }}º ano</span>
                <span class="badge">{{ episode.category }}</span>
                <span class="badge" v-if="episode.duration_label">{{ episode.duration_label }}</span>
            </div>
            <h3 style="margin:0;">{{ episode.title }}</h3>
            <p style="margin:0; color:var(--muted); line-height:1.5;">{{ episode.summary }}</p>
            <router-link class="button" :to="`/episodio/${episode.slug}`">Abrir episódio</router-link>
        </div>
    </article>
</template>

<script setup>
defineProps({ episode: Object });
</script>
