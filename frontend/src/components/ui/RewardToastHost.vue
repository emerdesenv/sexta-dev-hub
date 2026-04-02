<template>
    <Transition name="reward-toast">
        <div
            v-if="rewardToast.open"
            class="reward-toast"
            :class="{
                'reward-toast--collectible': rewardToast.kind === 'collectible',
                'reward-toast--reward': rewardToast.kind === 'badge' || rewardToast.kind === 'trophy',
                'reward-toast--study': rewardToast.kind === 'study'
            }"
            role="status"
            aria-live="polite"
        >
            <span class="reward-toast-icon" aria-hidden="true">{{ rewardToast.icon }}</span>
            <div class="min-w-0 flex-1">
                <p class="reward-toast-title">{{ rewardToast.title }}</p>
                <p class="reward-toast-text">{{ rewardToast.message }}</p>
            </div>
            <button type="button" class="reward-toast-close" @click="dismissRewardToast" aria-label="Fechar notificação">
                ×
            </button>
        </div>
    </Transition>
</template>

<script setup>
import { useRewardToast } from '../../composables/useRewardToast';

const { rewardToast, dismissRewardToast } = useRewardToast();
</script>

<style scoped>
.reward-toast {
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 120;
    width: min(30rem, calc(100vw - 2rem));
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    border-radius: 0.9rem;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
    padding: 0.75rem 0.8rem;
}

.reward-toast--reward {
    border: 1px solid color-mix(in srgb, var(--success) 62%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--success) 18%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 95%, transparent)
    );
}

.reward-toast--collectible {
    border: 1px solid color-mix(in srgb, var(--warning) 62%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--warning) 18%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 95%, transparent)
    );
}

.reward-toast--study {
    border: 1px solid color-mix(in srgb, var(--success) 62%, var(--border));
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--success) 18%, var(--surface-elevated)),
        color-mix(in srgb, var(--surface) 95%, transparent)
    );
}

.reward-toast-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--surface-2) 70%, transparent);
}

.reward-toast-title {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.01em;
}

.reward-toast-text {
    margin: 0.18rem 0 0;
    font-size: 0.78rem;
    line-height: 1.4;
    color: color-mix(in srgb, var(--text) 88%, transparent);
}

.reward-toast-close {
    border: 0;
    background: transparent;
    color: color-mix(in srgb, var(--text) 78%, transparent);
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0.1rem 0.2rem;
}

.reward-toast-enter-active,
.reward-toast-leave-active {
    transition: opacity 220ms ease, transform 220ms ease;
}

.reward-toast-enter-from,
.reward-toast-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@media (max-width: 640px) {
    .reward-toast {
        right: 0.75rem;
        top: 0.75rem;
        width: min(26rem, calc(100vw - 1.5rem));
    }
}
</style>
