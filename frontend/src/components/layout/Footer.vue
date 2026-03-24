<template>
    <footer class="mt-auto pt-8 pb-10 bg-surface/30">
        <div class="sd-container">
            <div
                class="border-t border-border/40 pt-6 text-muted text-sm flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between"
            >
                <span>© {{ new Date().getFullYear() }} Sexta Dev Hub</span>
                <div class="flex items-center gap-3">
                    <span>Conteúdos em PDF, áudio e aprendizado técnico.</span>
                    <a
                        v-if="githubUrl"
                        :href="githubUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="underline underline-offset-4 hover:text-text transition-colors"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
const githubEnvUrl = import.meta.env.VITE_GITHUB_URL || '';
const githubUrl = githubEnvUrl || 'https://github.com/emerdesenv/sexta-dev-hub';
</script>

