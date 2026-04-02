<template>
    <div
        class="trophy-bar rounded-2xl border px-4 py-4 md:px-6 md:py-5"
        role="region"
        aria-label="Resumo de nível, XP e coleção de troféus por categoria"
    >
        <div class="trophy-bar-inner flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div class="flex min-w-0 flex-1 items-start gap-3 md:gap-4">
                <div
                    class="trophy-bar-level-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl md:h-14 md:w-14"
                    aria-hidden="true"
                >
                    <svg class="h-7 w-7 md:h-8 md:w-8" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2l2.2 4.5L19 7l-3.5 3.1L16.2 14 12 11.9 7.8 14 8.5 10.1 5 7l4.8-.5L12 2z"
                            fill="currentColor"
                            class="trophy-bar-star"
                        />
                        <path
                            d="M8 16h8v2H8v-2zm-1 4h10v2H7v-2z"
                            fill="currentColor"
                            class="trophy-bar-bars"
                        />
                    </svg>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span class="text-xs font-semibold uppercase tracking-wide trophy-bar-kicker">
                            Nível
                        </span>
                        <strong class="text-3xl font-extrabold leading-none trophy-bar-value md:text-4xl">
                            {{ level }}
                        </strong>
                        <span class="trophy-bar-percent">{{ levelPercent }}%</span>
                    </div>
                    <div class="trophy-bar-progress mt-3 overflow-hidden rounded-full">
                        <div
                            class="trophy-bar-progress-fill h-full rounded-full transition-[width] duration-300 ease-out"
                            :style="{ width: `${levelPercent}%` }"
                        />
                    </div>
                    <p class="mt-2 text-xs trophy-bar-caption">
                        {{ xpCurrentLevel }} / {{ xpNextLevel }} XP para o próximo nível
                    </p>
                </div>
            </div>

            <div class="trophy-bar-total flex shrink-0 flex-col items-start border-t pt-4 sm:items-center sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0 lg:items-center">
                <span class="text-xs font-semibold uppercase tracking-wide trophy-bar-kicker">Total</span>
                <strong class="mt-1 text-3xl font-extrabold trophy-bar-value md:text-4xl">{{ totalItems }}</strong>
                <span class="text-xs trophy-bar-caption">na coleção</span>
            </div>

            <div
                class="flex flex-1 flex-wrap gap-4 sm:gap-5 md:justify-end lg:justify-end"
                role="list"
                aria-label="Troféus e conquistas por categoria"
            >
                <div
                    v-for="tier in tierDisplay"
                    :key="tier.id"
                    class="flex min-w-[4.5rem] items-center gap-2"
                    role="listitem"
                >
                    <span
                        class="trophy-dot flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold md:h-11 md:w-11 md:text-base"
                        :class="tier.dotClass"
                        aria-hidden="true"
                    >
                        {{ tier.short }}
                    </span>
                    <div class="flex flex-col leading-tight">
                        <span class="text-[0.65rem] font-semibold uppercase tracking-wide trophy-bar-kicker">
                            {{ tier.label }}
                        </span>
                        <strong class="text-lg font-extrabold trophy-bar-value">{{ tier.count }}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    level: { type: Number, default: 1 },
    levelPercent: { type: Number, default: 0 },
    xpCurrentLevel: { type: Number, default: 0 },
    xpNextLevel: { type: Number, default: 100 },
    trophyByTier: {
        type: Object,
        default: () => ({ platinum: 0, gold: 0, silver: 0, bronze: 0 })
    },
    totalItems: { type: Number, default: 0 }
});

const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const tierDisplay = computed(() => {
    const labels = {
        platinum: 'Platina',
        gold: 'Ouro',
        silver: 'Prata',
        bronze: 'Bronze'
    };
    const shorts = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
    const dotClasses = {
        platinum: 'trophy-dot--platinum',
        gold: 'trophy-dot--gold',
        silver: 'trophy-dot--silver',
        bronze: 'trophy-dot--bronze'
    };
    const src = props.trophyByTier || {};
    return TIER_ORDER.map((id) => ({
        id,
        label: labels[id],
        short: shorts[id],
        count: Number(src[id]) || 0,
        dotClass: dotClasses[id]
    }));
});
</script>

<style scoped>
.trophy-bar {
    position: relative;
    overflow: hidden;
    background: linear-gradient(
        125deg,
        color-mix(in srgb, var(--primary) 26%, var(--surface)) 0%,
        color-mix(in srgb, var(--surface-2) 42%, var(--surface)) 42%,
        color-mix(in srgb, var(--primary-2) 18%, var(--surface)) 100%
    );
    border-color: color-mix(in srgb, var(--primary) 38%, var(--border));
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--warning) 28%, transparent),
        0 16px 40px color-mix(in srgb, var(--primary) 16%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 45%, transparent);
    color: var(--text);
}

.trophy-bar::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 3px;
    background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--warning) 92%, #facc15),
        color-mix(in srgb, var(--warning) 55%, var(--primary)),
        color-mix(in srgb, var(--primary-2) 70%, var(--warning))
    );
    opacity: 0.96;
    pointer-events: none;
}

.trophy-bar-inner {
    position: relative;
    z-index: 1;
}

.trophy-bar-level-icon {
    background: linear-gradient(
        155deg,
        color-mix(in srgb, var(--primary) 52%, #0f172a),
        color-mix(in srgb, var(--primary-2) 38%, #1e1b4b)
    );
    border: 1px solid color-mix(in srgb, var(--primary-2) 55%, #0f172a);
    box-shadow:
        0 10px 22px color-mix(in srgb, var(--primary) 32%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 22%, transparent);
}

.trophy-bar-star {
    color: #fbbf24;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
}

.trophy-bar-bars {
    color: rgba(248, 250, 252, 0.92);
}

.trophy-bar-kicker {
    font-weight: 800;
    letter-spacing: 0.06em;
    color: color-mix(in srgb, var(--text) 62%, var(--primary));
}

.trophy-bar-value {
    color: color-mix(in srgb, var(--text) 96%, var(--primary));
}

.trophy-bar-percent {
    font-size: clamp(1rem, 2.5vw, 1.35rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: color-mix(in srgb, var(--warning) 72%, #ca8a04);
    text-shadow: 0 1px 0 color-mix(in srgb, var(--surface) 55%, transparent);
}

.trophy-bar-caption {
    font-weight: 500;
    color: color-mix(in srgb, var(--text) 58%, var(--muted));
}

.trophy-bar-progress {
    height: 0.65rem;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--text) 9%, var(--surface-2));
    border: 1px solid color-mix(in srgb, var(--border) 65%, var(--text) 10%);
    box-shadow: inset 0 2px 4px color-mix(in srgb, var(--text) 6%, transparent);
}

.trophy-bar-total {
    border-color: color-mix(in srgb, var(--primary) 22%, var(--border)) !important;
}

.trophy-bar-progress-fill {
    background: linear-gradient(
        90deg,
        #facc15,
        color-mix(in srgb, var(--warning) 75%, #ea580c),
        color-mix(in srgb, var(--warning) 88%, #f59e0b)
    );
    box-shadow:
        0 0 14px color-mix(in srgb, var(--warning) 45%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 55%, transparent);
}

.trophy-dot {
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(15, 23, 42, 0.4);
    border: 2px solid color-mix(in srgb, var(--surface) 55%, white);
    box-shadow:
        0 5px 14px rgba(15, 23, 42, 0.18),
        inset 0 2px 5px color-mix(in srgb, white 32%, transparent);
}

.trophy-dot--platinum {
    background: linear-gradient(150deg, #64748b, #38bdf8, #e2e8f0);
}

.trophy-dot--gold {
    background: linear-gradient(150deg, #ca8a04, #fde68a, #f59e0b);
}

.trophy-dot--silver {
    background: linear-gradient(150deg, #64748b, #cbd5e1, #e2e8f0);
    color: #0f172a;
    text-shadow: 0 1px 0 color-mix(in srgb, white 70%, transparent);
}

.trophy-dot--bronze {
    background: linear-gradient(150deg, #9a3412, #fdba74, #c2410c);
}

body[data-theme='neon'] .trophy-bar {
    box-shadow:
        0 0 0 1px color-mix(in srgb, var(--warning) 45%, transparent),
        0 12px 36px color-mix(in srgb, var(--primary) 22%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 12%, transparent);
}

body[data-theme='neon'] .trophy-bar-percent {
    text-shadow: 0 0 12px color-mix(in srgb, var(--warning) 35%, transparent);
}

body[data-theme='neon'] .trophy-bar-level-icon {
    border-color: color-mix(in srgb, var(--primary-2) 75%, transparent);
}
</style>
