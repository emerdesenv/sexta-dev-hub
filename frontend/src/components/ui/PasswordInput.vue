<template>
    <label class="flex flex-col gap-2">
        <span class="sd-label">{{ label }}</span>
        <div class="sd-password-wrap">
            <input
                class="sd-input sd-password-wrap__input"
                :type="show ? 'text' : 'password'"
                v-model="model"
                :autocomplete="autocomplete"
                :required="required"
            />
            <button
                type="button"
                class="sd-password-toggle"
                :aria-pressed="show"
                :aria-label="show ? 'Ocultar senha' : 'Mostrar senha'"
                tabindex="0"
                @click="show = !show"
            >
                <!-- eye open -->
                <svg
                    v-if="!show"
                    class="sd-password-toggle__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <!-- eye off -->
                <svg
                    v-else
                    class="sd-password-toggle__icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a3 3 0 1 0 4.24 4.24" />
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.71 18.71 0 0 1 5.06-5.94" />
                    <path d="M9.88 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                </svg>
            </button>
        </div>
    </label>
</template>

<script setup>
import { ref } from 'vue';

const model = defineModel({ required: true });

defineProps({
    label: { type: String, required: true },
    autocomplete: { type: String, default: undefined },
    required: { type: Boolean, default: false }
});

const show = ref(false);
</script>

<style scoped>
.sd-password-wrap {
    position: relative;
    display: block;
}

.sd-password-wrap__input {
    width: 100%;
    padding-right: 2.75rem;
}

.sd-password-toggle {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0.5rem;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: color 140ms ease, background-color 140ms ease;
}

.sd-password-toggle:hover {
    color: var(--text-soft);
    background: color-mix(in srgb, var(--surface-2) 45%, transparent);
}

.sd-password-toggle:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 55%, transparent);
}

.sd-password-toggle__icon {
    width: 1.125rem;
    height: 1.125rem;
}
</style>
