<template>
  <section class="sd-card mt-6 p-4 md:p-5">
    <div class="flex items-center justify-between gap-3 mb-3">
      <h2 class="text-base md:text-lg font-bold">Pre-visualizacao do PDF</h2>
      <button
        type="button"
        class="sd-button sd-button-secondary px-3 py-2 text-sm"
        @click="renderPdf"
      >
        Atualizar
      </button>
    </div>

    <div v-if="loading" class="sd-notice">
      Carregando pre-visualizacao do PDF...
    </div>

    <div v-else-if="error" class="sd-error" aria-live="polite">
      {{ error }}
    </div>

    <div
      v-else
      ref="containerRef"
      class="rounded-xl border border-border/50 bg-surface/30 overflow-auto p-2"
    >
      <canvas ref="canvasRef" class="mx-auto block max-w-full h-auto" />
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  src: { type: String, required: true },
});

const loading = ref(false);
const error = ref('');
const containerRef = ref(null);
const canvasRef = ref(null);
let resizeObserver = null;
let getDocumentFn = null;

async function ensurePdfJs() {
  if (getDocumentFn) return;

  const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);

  GlobalWorkerOptions.workerSrc = workerModule.default;
  getDocumentFn = getDocument;
}

async function renderPdf() {
  if (!props.src || !canvasRef.value || !containerRef.value) return;
  loading.value = true;
  error.value = '';

  try {
    await ensurePdfJs();
    const task = getDocumentFn({ url: props.src });
    const pdf = await task.promise;
    const page = await pdf.getPage(1);

    const baseViewport = page.getViewport({ scale: 1 });
    const maxWidth = Math.max(containerRef.value.clientWidth - 16, 320);
    const scale = maxWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;
  } catch (e) {
    error.value = 'Nao foi possivel exibir o PDF nesta tela. Tente abrir em nova aba ou baixar o arquivo.';
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.src,
  () => {
    renderPdf();
  }
);

onMounted(() => {
  renderPdf();
  if (window.ResizeObserver && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!loading.value) renderPdf();
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>
