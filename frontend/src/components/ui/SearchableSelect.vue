<template>
    <div ref="rootRef" class="searchable-select">
        <button
            :id="buttonId"
            type="button"
            class="searchable-select-trigger sd-input"
            :class="{ 'searchable-select-trigger--open': open, 'opacity-60 cursor-not-allowed': disabled }"
            :disabled="disabled"
            :aria-expanded="open"
            :aria-haspopup="true"
            :aria-controls="listId"
            @click="toggle"
        >
            <span class="searchable-select-trigger-text truncate text-left">{{ displayLabel }}</span>
            <span class="searchable-select-chevron" aria-hidden="true">▾</span>
        </button>

        <Teleport to="body">
            <div
                v-if="open"
                ref="panelRef"
                class="searchable-select-panel"
                :style="panelStyle"
                role="listbox"
                :id="listId"
                :aria-labelledby="buttonId"
            >
                <input
                    ref="searchInputRef"
                    v-model.trim="query"
                    type="search"
                    class="sd-input searchable-select-search"
                    :placeholder="searchPlaceholder"
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck="false"
                    @keydown.escape.stop="close"
                >
                <ul class="searchable-select-options">
                    <li
                        v-for="(opt, index) in filteredOptions"
                        :key="`${opt.value}-${index}`"
                        class="searchable-select-option"
                        :class="{
                            'searchable-select-option--active': opt.value === modelValue,
                            'searchable-select-option--disabled': opt.disabled,
                            'searchable-select-option--highlight': index === highlightedIndex
                        }"
                        role="option"
                        :aria-selected="opt.value === modelValue"
                        @mouseenter="highlightedIndex = index"
                        @mousedown.prevent="choose(opt)"
                    >
                        {{ opt.label }}
                    </li>
                    <li v-if="!filteredOptions.length" class="searchable-select-empty">
                        Nenhum resultado.
                    </li>
                </ul>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch
} from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
    /** { value: string, label: string, disabled?: boolean } */
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Selecione...' },
    searchPlaceholder: { type: String, default: 'Pesquisar...' },
    disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const uid = Math.random().toString(36).slice(2, 9);
const buttonId = `searchable-select-btn-${uid}`;
const listId = `searchable-select-list-${uid}`;

const rootRef = ref(null);
const panelRef = ref(null);
const searchInputRef = ref(null);
const open = ref(false);
const query = ref('');
const panelStyle = ref({});
const highlightedIndex = ref(0);

const displayLabel = computed(() => {
    const selected = props.options.find((o) => o.value === props.modelValue);
    if (selected) return selected.label;
    return props.placeholder;
});

function normalize(s) {
    return String(s ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
}

const filteredOptions = computed(() => {
    const q = normalize(query.value);
    if (!q) return props.options;
    return props.options.filter((o) => {
        if (o.disabled && !normalize(o.label).includes(q) && !normalize(o.value).includes(q)) {
            return false;
        }
        return normalize(o.label).includes(q) || normalize(o.value).includes(q);
    });
});

watch(filteredOptions, (list) => {
    const idx = list.findIndex((o) => o.value === props.modelValue);
    highlightedIndex.value = idx >= 0 ? idx : 0;
});

watch(open, async (isOpen) => {
    if (!isOpen) {
        query.value = '';
        return;
    }
    await nextTick();
    updatePanelPosition();
    searchInputRef.value?.focus();
});

function choose(opt) {
    if (opt.disabled) return;
    emit('update:modelValue', opt.value);
    close();
}

function toggle() {
    if (props.disabled) return;
    open.value = !open.value;
}

function close() {
    open.value = false;
}

function updatePanelPosition() {
    const el = rootRef.value?.querySelector('.searchable-select-trigger');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 4;
    const maxH = Math.min(280, window.innerHeight - r.bottom - gap - 16);
    panelStyle.value = {
        position: 'fixed',
        left: `${r.left}px`,
        top: `${r.bottom + gap}px`,
        width: `${r.width}px`,
        maxHeight: `${maxH}px`,
        zIndex: '100'
    };
}

function onDocPointerDown(event) {
    if (!open.value) return;
    const t = event.target;
    if (rootRef.value?.contains(t)) return;
    if (panelRef.value?.contains(t)) return;
    close();
}

function onViewportChange() {
    if (open.value) {
        updatePanelPosition();
    }
}

onMounted(() => {
    document.addEventListener('pointerdown', onDocPointerDown, true);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocPointerDown, true);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});
</script>

<style scoped>
.searchable-select {
    position: relative;
    width: 100%;
}

.searchable-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    text-align: left;
    cursor: pointer;
    background: color-mix(in srgb, var(--surface) 94%, white 6%);
}

.searchable-select-trigger--open {
    border-color: color-mix(in srgb, var(--border) 60%, var(--primary) 40%);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 35%, transparent);
}

.searchable-select-trigger-text {
    flex: 1;
    min-width: 0;
}

.searchable-select-chevron {
    flex-shrink: 0;
    font-size: 0.65rem;
    color: var(--muted);
}

.searchable-select-panel {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.5rem;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
    background: color-mix(in srgb, var(--surface) 98%, transparent);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
    overflow: hidden;
}

.searchable-select-search {
    width: 100%;
    flex-shrink: 0;
}

.searchable-select-options {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

.searchable-select-option {
    padding: 0.5rem 0.65rem;
    border-radius: 8px;
    font-size: 0.875rem;
    cursor: pointer;
    color: var(--text);
}

.searchable-select-option:hover,
.searchable-select-option--highlight {
    background: color-mix(in srgb, var(--surface-2) 55%, transparent);
}

.searchable-select-option--active {
    font-weight: 700;
    background: color-mix(in srgb, var(--primary) 12%, transparent);
}

.searchable-select-option--disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
}

.searchable-select-empty {
    padding: 0.75rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--muted);
}
</style>
