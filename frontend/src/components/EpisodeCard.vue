<template>
    <Card class="overflow-hidden h-full flex flex-col">
        <div class="w-full h-44 sm:h-48 bg-surface-2/40 border-b border-border/40 flex items-center justify-center">
            <img
                v-if="episode.cover_url"
                :src="episode.cover_url"
                :alt="episode.title"
                class="w-full h-full object-contain"
            />
            <span v-else class="text-sm text-muted">Sem capa</span>
        </div>

        <div class="p-5 flex flex-col gap-3 flex-1">
            <div class="flex flex-wrap gap-2">
                <Badge>{{ episode.year_target }}º ano</Badge>
                <Badge>{{ episode.category }}</Badge>
                <Badge v-if="episode.duration_label">{{ episode.duration_label }}</Badge>
                <Badge v-if="episode.audio_url" tone="audio">Áudio</Badge>
                <Badge v-if="episode.pdf_url" tone="pdf">PDF</Badge>
            </div>

            <h3 class="text-lg sm:text-xl font-bold leading-snug">
                {{ episode.title }}
            </h3>
            <p class="text-muted leading-relaxed">
                {{ episode.summary }}
            </p>

            <router-link
                class="sd-button sd-button-primary mt-auto px-4 py-2 text-sm"
                :to="`/episodio/${episode.slug}`"
            >
                Abrir episódio
            </router-link>
        </div>
    </Card>
</template>

<script setup>
import Card from './ui/Card.vue';
import Badge from './ui/Badge.vue';

defineProps({ episode: Object });
</script>
