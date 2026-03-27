<template>
    <Teleport to="body">
        <div
            v-if="modelValue"
            class="student-gate-overlay"
            role="dialog"
            aria-modal="true"
            :aria-label="ariaLabel"
            @click.self="close"
        >
            <div class="student-gate-modal" @click.stop>
                <div class="text-lg font-bold">{{ title }}</div>
                <p class="text-sm text-muted mt-2">
                    {{ description }}
                </p>
                <div class="flex gap-2 mt-4">
                    <button class="sd-button sd-button-primary w-full" type="button" @click="emitAuth">
                        Entrar / Criar conta
                    </button>
                    <button class="sd-button sd-button-secondary w-full" type="button" @click="close">
                        Continuar visitante
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, default: false },
    title: {
        type: String,
        default: 'Conteúdo para aluno logado'
    },
    description: {
        type: String,
        default:
            'Entre como aluno para acompanhar progresso, ganhar XP e desbloquear recompensas.'
    },
    ariaLabel: {
        type: String,
        default: 'Acesso para aluno logado'
    }
});

const emit = defineEmits(['update:modelValue', 'auth']);

function close() {
    emit('update:modelValue', false);
}

function emitAuth() {
    emit('auth');
}
</script>

<style scoped>
.student-gate-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3, 8, 20, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 80;
}

.student-gate-modal {
    width: 100%;
    max-width: 420px;
    border-radius: 14px;
    border: 1px solid rgba(47, 61, 102, 0.9);
    background: #111a2f;
    padding: 18px;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.38);
}
</style>
