<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['sd-button', variantClass, $attrs.class]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger'].includes(v),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

const variantClass = {
  primary: 'sd-button-primary',
  secondary: 'sd-button-secondary',
  danger: 'sd-button-danger',
}[props.variant]
</script>

