<template>
    <footer
        :class="[
            'mt-auto pt-8 pb-10 bg-surface/30 footer-root-line',
            { 'footer-community': variant === 'community' }
        ]"
    >
        <div class="sd-container">
            <div class="pt-6 text-sm footer-grid">
                <div class="text-muted">
                    <span class="font-semibold">© {{ new Date().getFullYear() }} Dev Hub</span>
                    <span class="mx-2">•</span>
                    <span>Comunidade ADS</span>
                    <span class="mx-2">•</span>
                    <span>Ambiente acadêmico</span>
                </div>

                <div class="footer-links">
                    <button type="button" class="footer-link footer-link-button" @click="termsModalOpen = true">Termos</button>
                    <button type="button" class="footer-link footer-link-button" @click="privacyModalOpen = true">Privacidade</button>
                    <button type="button" class="footer-link footer-link-button" @click="conductModalOpen = true">Conduta</button>

                    <a
                        v-if="githubUrl"
                        :href="githubUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="footer-link"
                    >
                        GitHub
                    </a>
                    <span class="footer-moderation-badge" aria-label="Conteúdo moderado">
                        <span class="footer-moderation-dot" aria-hidden="true"></span>
                        Conteúdo moderado
                    </span>
                </div>
            </div>
        </div>
    </footer>

    <BaseModal
        v-model="termsModalOpen"
        title="Termos de uso"
        aria-label="Termos de uso"
        max-width="2xl"
    >
        <div class="mt-4 space-y-3">
            <article class="sd-list-item p-3"><strong>1) Uso da plataforma</strong><p class="text-sm text-muted mt-1">O Dev Hub é um ambiente educacional. O uso deve seguir finalidade acadêmica e colaborativa.</p></article>
            <article class="sd-list-item p-3"><strong>2) Conta do usuário</strong><p class="text-sm text-muted mt-1">Cada usuário é responsável por manter seu acesso seguro e por atividades realizadas na própria conta.</p></article>
            <article class="sd-list-item p-3"><strong>3) Condutas proibidas</strong><p class="text-sm text-muted mt-1">É proibido assédio, discriminação, spam, fraude, tentativa de invasão e manipulação indevida de regras.</p></article>
            <article class="sd-list-item p-3"><strong>4) Moderação</strong><p class="text-sm text-muted mt-1">Conteúdos podem ser removidos e contas podem sofrer restrições em caso de violação.</p></article>
        </div>
    </BaseModal>

    <BaseModal
        v-model="privacyModalOpen"
        title="Política de privacidade"
        aria-label="Política de privacidade"
        max-width="2xl"
    >
        <div class="mt-4 space-y-3">
            <article class="sd-list-item p-3"><strong>1) Dados coletados</strong><p class="text-sm text-muted mt-1">Coletamos nome de usuário, senha protegida, progresso de estudo e interações na plataforma.</p></article>
            <article class="sd-list-item p-3"><strong>2) Dados não coletados</strong><p class="text-sm text-muted mt-1">Atualmente não coletamos e-mail neste fluxo de uso.</p></article>
            <article class="sd-list-item p-3"><strong>3) Finalidade</strong><p class="text-sm text-muted mt-1">Os dados são usados para autenticação, experiência personalizada, segurança e moderação.</p></article>
            <article class="sd-list-item p-3"><strong>4) Segurança</strong><p class="text-sm text-muted mt-1">Adotamos práticas para proteção dos dados e revisão contínua dos controles de segurança.</p></article>
        </div>
    </BaseModal>

    <BaseModal
        v-model="conductModalOpen"
        title="Código de conduta"
        aria-label="Código de conduta"
        max-width="2xl"
    >
        <div class="mt-4 space-y-3">
            <article class="sd-list-item p-3"><strong>1) Respeito e inclusão</strong><p class="text-sm text-muted mt-1">Trate todas as pessoas com respeito. Não é tolerado conteúdo ofensivo ou discriminatório.</p></article>
            <article class="sd-list-item p-3"><strong>2) Colaboração construtiva</strong><p class="text-sm text-muted mt-1">Priorize respostas claras, objetivas e úteis para o aprendizado coletivo.</p></article>
            <article class="sd-list-item p-3"><strong>3) Conteúdo inadequado</strong><p class="text-sm text-muted mt-1">Conteúdos de ódio, ameaça, assédio ou incentivo a autoagressão serão removidos.</p></article>
            <article class="sd-list-item p-3"><strong>4) Denúncias</strong><p class="text-sm text-muted mt-1">Use denúncias com responsabilidade. A equipe de moderação avalia os casos reportados.</p></article>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref } from 'vue';
import BaseModal from '../ui/BaseModal.vue';

defineProps({
    variant: {
        type: String,
        default: 'default'
    }
});

const githubEnvUrl = import.meta.env.VITE_GITHUB_URL || '';
const githubUrl = githubEnvUrl || 'https://github.com/emerdesenv/sexta-dev-hub';
const termsModalOpen = ref(false);
const privacyModalOpen = ref(false);
const conductModalOpen = ref(false);
</script>

<style scoped>
.footer-community {
    background:
        linear-gradient(
            180deg,
            color-mix(in srgb, var(--surface) 76%, transparent),
            color-mix(in srgb, var(--bg) 86%, transparent)
        );
}

.footer-link {
    color: color-mix(in srgb, var(--primary-2) 75%, var(--text));
    text-decoration: none;
    font-weight: 600;
}

.footer-link-button {
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font: inherit;
}

.footer-link:hover {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 4px;
}

.footer-link:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--primary) 55%, transparent);
    outline-offset: 2px;
    border-radius: 0.375rem;
}

.footer-grid {
    display: grid;
    gap: 0.75rem;
}

.footer-root-line {
    position: relative;
    padding-top: 0.9rem;
}

.footer-root-line::before {
    content: '';
    position: absolute;
    top: 0.9rem;
    left: 0;
    right: 0;
    height: 1px;
    background: color-mix(in srgb, var(--border) 74%, white);
}

.footer-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.8rem;
}

.footer-moderation-badge {
    margin-left: 0.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--success) 42%, transparent);
    background: color-mix(in srgb, var(--success) 14%, transparent);
    color: color-mix(in srgb, var(--success) 84%, white);
    padding: 0.28rem 0.62rem;
    font-size: 0.75rem;
    font-weight: 700;
}

.footer-moderation-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    background: currentColor;
}

@media (min-width: 768px) {
    .footer-grid {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
    }
}
</style>

