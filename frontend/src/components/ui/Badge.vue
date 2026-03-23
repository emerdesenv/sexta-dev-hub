<template>
    <span :class="['sd-badge', toneClass]">
        <slot />
    </span>
</template>

<script setup>
const props = defineProps({
    tone: {
        type: String,
        default: 'neutral',
        validator: (v) => ['neutral', 'primary', 'audio', 'pdf', 'pro'].includes(v),
    },
})

const toneClass = {
    neutral: '',
    primary: 'sd-badge-primary',
    audio: 'sd-badge-audio',
    pdf: 'sd-badge-pdf',
    pro: 'sd-badge-pro',
}[props.tone]
</script>

