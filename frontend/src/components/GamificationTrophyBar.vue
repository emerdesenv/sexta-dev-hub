<template>
    <div
        class="trophy-bar rounded-2xl border border-white/10 px-4 py-4 md:px-6 md:py-5"
        role="region"
        aria-label="Resumo de nível, XP e coleção de troféus por categoria"
    >
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div class="flex min-w-0 flex-1 items-start gap-3 md:gap-4">
                <div
                    class="trophy-bar-level-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl md:h-14 md:w-14"
                    aria-hidden="true"
                >
                    <svg class="h-7 w-7 md:h-8 md:w-8" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2l2.2 4.5L19 7l-3.5 3.1L16.2 14 12 11.9 7.8 14 8.5 10.1 5 7l4.8-.5L12 2z"
                            fill="currentColor"
                            class="text-amber-300"
                        />
                        <path
                            d="M8 16h8v2H8v-2zm-1 4h10v2H7v-2z"
                            fill="currentColor"
                            class="text-white/90"
                        />
                    </svg>
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-baseline gap-2">
                        <span class="text-xs font-semibold uppercase tracking-wide text-white/75">
                            Nível
                        </span>
                        <strong class="text-3xl font-extrabold leading-none text-white md:text-4xl">
                            {{ level }}
                        </strong>
                        <span class="text-sm font-semibold text-amber-200/95">{{ levelPercent }}%</span>
                    </div>
                    <div class="trophy-bar-progress mt-3 h-2 overflow-hidden rounded-full bg-black/25">
                        <div
                            class="trophy-bar-progress-fill h-full rounded-full transition-[width] duration-300 ease-out"
                            :style="{ width: `${levelPercent}%` }"
                        />
                    </div>
                    <p class="mt-2 text-xs text-white/70">
                        {{ xpCurrentLevel }} / {{ xpNextLevel }} XP para o próximo nível
                    </p>
                </div>
            </div>

            <div class="flex shrink-0 flex-col items-start border-t border-white/15 pt-4 sm:items-center sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0 lg:items-center">
                <span class="text-xs font-semibold uppercase tracking-wide text-white/75">Total</span>
                <strong class="mt-1 text-3xl font-extrabold text-white md:text-4xl">{{ totalItems }}</strong>
                <span class="text-xs text-white/65">na coleção</span>
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
                        class="trophy-dot flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-slate-900 shadow-inner"
                        :class="tier.dotClass"
                        aria-hidden="true"
                    >
                        {{ tier.short }}
                    </span>
                    <div class="flex flex-col leading-tight">
                        <span class="text-[0.65rem] font-semibold uppercase tracking-wide text-white/75">
                            {{ tier.label }}
                        </span>
                        <strong class="text-lg font-extrabold text-white">{{ tier.count }}</strong>
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
    background: linear-gradient(
        115deg,
        color-mix(in srgb, var(--primary) 42%, #0c1428) 0%,
        color-mix(in srgb, var(--primary) 18%, var(--surface-elevated)) 100%
    );
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
}

body[data-theme='light'] .trophy-bar {
    background: linear-gradient(
        115deg,
        color-mix(in srgb, var(--primary) 55%, #1e3a5f) 0%,
        color-mix(in srgb, var(--primary) 35%, #172554) 100%
    );
    border-color: rgba(255, 255, 255, 0.14);
}

.trophy-bar-level-icon {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0.15));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.trophy-bar-progress-fill {
    background: linear-gradient(90deg, #facc15, #f59e0b);
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
}

.trophy-dot--platinum {
    background: linear-gradient(145deg, #e2e8f0, #38bdf8, #64748b);
}

.trophy-dot--gold {
    background: linear-gradient(145deg, #fde68a, #f59e0b);
}

.trophy-dot--silver {
    background: linear-gradient(145deg, #f1f5f9, #94a3b8);
}

.trophy-dot--bronze {
    background: linear-gradient(145deg, #fdba74, #b45309);
}
</style>
