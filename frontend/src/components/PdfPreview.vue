<template>
  <section class="sd-card mt-6 p-4 md:p-5">
    <h2 class="text-base md:text-lg font-bold mb-3">Pre-visualizacao do PDF</h2>
    <div class="rounded-xl border border-border/50 bg-surface/30 overflow-hidden">
      <iframe
        :src="viewerSrc"
        class="w-full h-[520px] bg-white"
        title="Pre-visualizacao do PDF"
        loading="lazy"
      />
    </div>
    <p class="text-sm text-muted mt-3">
      Se a pre-visualizacao nao aparecer no seu navegador, use "Abrir em nova aba" ou "Baixar PDF".
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
});

const viewerSrc = computed(() => `${props.src}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`);
</script>
