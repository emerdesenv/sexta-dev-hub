<template>
    <Teleport to="body">
        <div
            v-if="modelValue"
            class="sd-modal-overlay"
            role="dialog"
            :aria-modal="true"
            :aria-label="ariaLabel || title || 'Modal'"
            @click.self="handleOverlayClose"
        >
            <div class="sd-modal-panel" :class="maxWidthClass" @click.stop>
                <div class="sd-modal-header">
                    <h3 class="sd-section-title text-xl">{{ title }}</h3>
                    <button
                        v-if="showClose"
                        class="sd-button sd-button-secondary px-3 py-2 text-sm"
                        type="button"
                        :disabled="disableClose"
                        @click="emitClose"
                    >
                        Fechar
                    </button>
                </div>
                <slot />
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
    maxWidth: { type: String, default: '2xl' },
    showClose: { type: Boolean, default: true },
    closeOnOverlay: { type: Boolean, default: true },
    disableClose: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'close']);

const maxWidthClass = computed(() => {
    const map = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl'
    };
    return map[props.maxWidth] || map['2xl'];
});

function emitClose() {
    if (props.disableClose) return;
    emit('update:modelValue', false);
    emit('close');
}

function handleOverlayClose() {
    if (!props.closeOnOverlay) return;
    emitClose();
}
</script>
