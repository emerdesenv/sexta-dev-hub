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
        validator: (v) =>
            [
                'neutral',
                'primary',
                'audio',
                'pdf',
                'pro',
                'success',
                'info',
                'warning',
                'published',
                'draft',
            ].includes(v),
    },
})

const toneClass = {
    neutral: '',
    primary: 'sd-badge-primary',
    audio: 'sd-badge-audio',
    pdf: 'sd-badge-pdf',
    pro: 'sd-badge-pro',
    success: 'sd-badge-success',
    info: 'sd-badge-info',
    warning: 'sd-badge-warning',
    published: 'sd-badge-published',
    draft: 'sd-badge-draft',
}[props.tone]
</script>

