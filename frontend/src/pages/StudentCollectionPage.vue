<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer>
            <section class="sd-card sd-card-section p-6 md:p-7 mt-4 md:mt-5 collection-hero">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <Badge tone="warning">Coleção</Badge>
                        <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Minha coleção</h1>
                        <p class="mt-2 text-muted">
                            Itens colecionáveis desbloqueados em eventos relâmpago e desafios especiais.
                        </p>
                    </div>
                    <div class="collection-hero-icon" aria-hidden="true">🧢</div>
                </div>

                <div v-if="error" class="sd-error mt-4">{{ error }}</div>
                <div v-else-if="loading" class="sd-notice mt-4">Carregando sua coleção...</div>

                <div v-else class="mt-6 collection-body">
                    <p class="collection-kpi-legend">Resumo da sua coleção</p>
                    <div class="grid gap-3 sm:grid-cols-3 mb-6 collection-kpi-row">
                        <div class="sd-card-item p-3 collection-kpi collection-kpi-total">
                            <div class="collection-kpi-label">Total de itens</div>
                            <strong class="text-2xl font-extrabold collection-kpi-value">{{ items.length }}</strong>
                        </div>
                        <div class="sd-card-item p-3 collection-kpi collection-kpi-rare">
                            <div class="collection-kpi-label">Itens raros+</div>
                            <strong class="text-2xl font-extrabold collection-kpi-value">{{ rareItemsCount }}</strong>
                        </div>
                        <div class="sd-card-item p-3 collection-kpi collection-kpi-latest">
                            <div class="collection-kpi-label">Último desbloqueio</div>
                            <strong class="text-sm font-extrabold collection-kpi-date">{{ latestUnlockLabel }}</strong>
                        </div>
                    </div>

                    <p v-if="items.length" class="collection-items-legend">Itens desbloqueados</p>
                    <div v-if="items.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 collection-items-grid">
                        <article
                            v-for="entry in items"
                            :key="entry.id"
                            class="collection-item-card"
                            :class="itemRaritySurfaceClass(entry.item?.rarity)"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <h2 class="sd-card-title truncate collection-item-title">
                                        {{ entry.item?.title || 'Item' }}
                                    </h2>
                                    <p class="sd-card-meta collection-item-meta">
                                        {{ rarityLabel(entry.item?.rarity) }} • {{ typeLabel(entry.item?.type) }}
                                    </p>
                                </div>
                                <span
                                    class="collection-item-icon-wrap text-2xl inline-flex items-center justify-center min-h-[2.35rem] min-w-[2.35rem]"
                                    aria-hidden="true"
                                >
                                    <img
                                        v-if="isImageIcon(entry.item?.icon)"
                                        :src="entry.item?.icon"
                                        alt=""
                                        class="h-7 w-7 rounded object-contain"
                                    />
                                    <template v-else-if="entry.item?.icon">
                                        {{ entry.item.icon }}
                                    </template>
                                    <svg
                                        v-else
                                        class="h-7 w-7 collection-item-fallback-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                        <path
                                            d="M2 7h20v5H2V7z"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                        <path
                                            d="M12 22V7"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                        <path
                                            d="M12 7h4.5a2.5 2.5 0 0 0 0-5C14.6 2 13 4 12 7Z"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                        <path
                                            d="M12 7H7.5a2.5 2.5 0 0 1 0-5C9.4 2 11 4 12 7Z"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </span>
                            </div>

                            <div class="mt-3 text-xs text-muted">
                                Desbloqueado em {{ formatDate(entry.acquiredAt) }}
                            </div>
                            <div v-if="entry.sourceEvent?.title" class="mt-2 text-xs text-muted">
                                Fonte: <b>{{ entry.sourceEvent.title }}</b>
                            </div>
                        </article>
                    </div>

                    <div v-else class="sd-notice">
                        Você ainda não possui itens colecionáveis. Fique de olho nos eventos relâmpago.
                    </div>
                </div>
            </section>
        </PageContainer>
        <Footer />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';
import api from '../services/api';
import { isImageIcon } from '../constants/collectibleIcons';

const loading = ref(false);
const error = ref('');
const items = ref([]);

const rareItemsCount = computed(() =>
    items.value.filter((entry) => {
        const rarity = String(entry?.item?.rarity || '').toLowerCase();
        return rarity === 'rare' || rarity === 'epic' || rarity === 'legendary';
    }).length
);

const latestUnlockLabel = computed(() => {
    if (!items.value.length) return '-';
    const sorted = [...items.value].sort((a, b) => {
        const da = new Date(a?.acquiredAt || 0).getTime();
        const db = new Date(b?.acquiredAt || 0).getTime();
        return db - da;
    });
    return formatDate(sorted[0]?.acquiredAt);
});

function formatDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
}

function rarityLabel(value) {
    const v = String(value || '').toLowerCase();
    if (v === 'legendary') return 'Lendário';
    if (v === 'epic') return 'Épico';
    if (v === 'rare') return 'Raro';
    return 'Comum';
}

function typeLabel(value) {
    const v = String(value || '').toLowerCase();
    if (v === 'avatar_item') return 'Item de avatar';
    return 'Badge';
}

function itemRaritySurfaceClass(rarity) {
    const word = String(rarity || '').toLowerCase();
    if (word === 'legendary') return 'collection-item--legendary';
    if (word === 'epic') return 'collection-item--epic';
    if (word === 'rare') return 'collection-item--rare';
    return 'collection-item--common';
}

async function loadCollection() {
    loading.value = true;
    error.value = '';
    try {
        const { data } = await api.get('/events/collectibles/me');
        items.value = Array.isArray(data?.items) ? data.items : [];
    } catch (e) {
        items.value = [];
        error.value = e?.response?.data?.message || 'Não foi possível carregar sua coleção.';
    } finally {
        loading.value = false;
    }
}

onMounted(loadCollection);
</script>

<style scoped>
.collection-hero {
    background:
        radial-gradient(circle at 12% 20%, color-mix(in srgb, var(--warning) 12%, transparent), transparent 38%),
        radial-gradient(circle at 92% 15%, color-mix(in srgb, var(--primary-2) 20%, transparent), transparent 36%),
        linear-gradient(
            132deg,
            color-mix(in srgb, var(--primary) 12%, var(--surface)) 0%,
            color-mix(in srgb, var(--surface-2) 18%, var(--surface)) 45%,
            color-mix(in srgb, var(--surface) 97%, var(--primary-2) 3%) 100%
        );
    border-color: color-mix(in srgb, var(--border) 85%, var(--warning) 8%);
}

.collection-hero-icon {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 0.95rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.65rem;
    border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border));
    background: linear-gradient(
        145deg,
        color-mix(in srgb, var(--primary) 14%, var(--surface)),
        color-mix(in srgb, var(--surface) 88%, var(--primary-2) 10%)
    );
    box-shadow: 0 6px 18px color-mix(in srgb, var(--primary) 12%, transparent);
}

.collection-body {
    padding-top: 0.15rem;
}

.collection-kpi-legend,
.collection-items-legend {
    margin: 0 0 0.55rem;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text) 58%, transparent);
}

.collection-items-legend {
    margin-top: 0.15rem;
    margin-bottom: 0.65rem;
    color: color-mix(in srgb, var(--primary-2) 32%, var(--muted));
}

.collection-kpi-row {
    align-items: stretch;
}

.collection-kpi {
    border-width: 1px;
    border-style: solid;
    box-shadow: 0 1px 0 color-mix(in srgb, white 35%, transparent) inset;
}

.collection-kpi-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--muted);
}

.collection-kpi-value,
.collection-kpi-date {
    display: block;
    margin-top: 0.2rem;
    letter-spacing: -0.02em;
}

.collection-kpi-total {
    border-color: color-mix(in srgb, var(--info) 32%, var(--border));
    background: linear-gradient(
        140deg,
        color-mix(in srgb, var(--info) 10%, var(--surface)),
        color-mix(in srgb, var(--surface) 94%, var(--info) 4%)
    );
    box-shadow: inset 0 3px 0 color-mix(in srgb, var(--info) 24%, transparent);
}

.collection-kpi-total .collection-kpi-value {
    color: color-mix(in srgb, var(--info) 30%, var(--text));
}

.collection-kpi-rare {
    border-color: color-mix(in srgb, var(--primary-2) 38%, var(--border));
    background: linear-gradient(
        140deg,
        color-mix(in srgb, var(--primary-2) 12%, var(--surface)),
        color-mix(in srgb, var(--surface) 91%, var(--primary-2) 7%)
    );
    box-shadow: inset 0 3px 0 color-mix(in srgb, var(--primary-2) 26%, transparent);
}

.collection-kpi-rare .collection-kpi-value {
    color: color-mix(in srgb, var(--primary-2) 24%, var(--text));
}

.collection-kpi-latest {
    border-color: color-mix(in srgb, var(--success) 28%, var(--border));
    background: linear-gradient(
        140deg,
        color-mix(in srgb, var(--success) 9%, var(--surface)),
        color-mix(in srgb, var(--surface) 95%, var(--success) 4%)
    );
    box-shadow: inset 0 3px 0 color-mix(in srgb, var(--success) 22%, transparent);
}

.collection-kpi-latest .collection-kpi-date {
    color: color-mix(in srgb, var(--success) 28%, var(--text));
    font-size: 0.95rem;
}

.collection-items-grid {
    align-items: stretch;
}

.collection-item-card {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--border) 88%, var(--primary) 12%);
    padding: 1.15rem 1.2rem 1.1rem 1.35rem;
    background: linear-gradient(
        102deg,
        color-mix(in srgb, var(--surface) 94%, var(--surface-2) 6%),
        color-mix(in srgb, var(--surface-2) 22%, var(--surface))
    );
    box-shadow: 0 8px 22px color-mix(in srgb, var(--primary) 6%, transparent);
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.collection-item-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65rem;
    bottom: 0.65rem;
    width: 4px;
    border-radius: 999px;
    background: linear-gradient(180deg, var(--primary), var(--primary-2));
    opacity: 0.85;
}

.collection-item-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--primary) 26%, var(--border));
    box-shadow: 0 14px 32px color-mix(in srgb, var(--primary) 10%, transparent);
}

.collection-item--common::before {
    background: linear-gradient(180deg, var(--primary), var(--primary-2));
}

.collection-item--rare::before {
    background: linear-gradient(180deg, var(--info), color-mix(in srgb, var(--primary) 55%, var(--info)));
}

.collection-item--rare {
    border-color: color-mix(in srgb, var(--info) 22%, var(--border));
    background: linear-gradient(
        102deg,
        color-mix(in srgb, var(--surface) 92%, var(--info) 6%),
        color-mix(in srgb, var(--surface-2) 28%, var(--surface))
    );
}

.collection-item--epic::before {
    background: linear-gradient(180deg, var(--primary-2), var(--primary));
}

.collection-item--epic {
    border-color: color-mix(in srgb, var(--primary-2) 28%, var(--border));
    background: linear-gradient(
        102deg,
        color-mix(in srgb, var(--surface) 90%, var(--primary-2) 8%),
        color-mix(in srgb, var(--surface-2) 30%, var(--surface))
    );
}

.collection-item--legendary::before {
    background: linear-gradient(180deg, var(--warning), color-mix(in srgb, var(--danger) 35%, var(--warning)));
}

.collection-item--legendary {
    border-color: color-mix(in srgb, var(--warning) 32%, var(--border));
    background: linear-gradient(
        102deg,
        color-mix(in srgb, var(--surface) 88%, var(--warning) 10%),
        color-mix(in srgb, var(--surface-2) 25%, var(--surface))
    );
    box-shadow: 0 8px 26px color-mix(in srgb, var(--warning) 10%, transparent);
}

.collection-item-title {
    color: color-mix(in srgb, var(--text) 96%, var(--primary) 4%);
}

.collection-item-meta {
    color: var(--muted);
}

.collection-item-icon-wrap {
    flex-shrink: 0;
    border-radius: 0.85rem;
    border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--border));
    background: linear-gradient(
        160deg,
        color-mix(in srgb, var(--surface) 82%, var(--primary-2) 12%),
        color-mix(in srgb, var(--surface-2) 40%, var(--surface))
    );
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 8%, transparent);
}

.collection-item-fallback-icon {
    color: color-mix(in srgb, var(--primary) 45%, var(--muted));
}
</style>

