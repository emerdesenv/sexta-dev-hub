<template>
    <div class="min-h-screen flex flex-col">
        <PublicHeader />
        <PageContainer class="pt-8 md:pt-10 pb-12">
            <section class="sd-card sd-card-section p-6 md:p-7">
                <Badge tone="warning">Coleção</Badge>
                <h1 class="mt-3 text-3xl sm:text-4xl font-extrabold">Minha coleção</h1>
                <p class="mt-2 text-muted">
                    Itens colecionáveis desbloqueados em eventos relâmpago e desafios especiais.
                </p>

                <div v-if="error" class="sd-error mt-4">{{ error }}</div>
                <div v-else-if="loading" class="sd-notice mt-4">Carregando sua coleção...</div>

                <div v-else class="mt-6">
                    <div v-if="items.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <article
                            v-for="entry in items"
                            :key="entry.id"
                            class="sd-card sd-card-item p-5"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <h2 class="sd-card-title truncate">
                                        {{ entry.item?.title || 'Item' }}
                                    </h2>
                                    <p class="sd-card-meta">
                                        {{ rarityLabel(entry.item?.rarity) }} • {{ typeLabel(entry.item?.type) }}
                                    </p>
                                </div>
                                <span class="text-2xl" aria-hidden="true">
                                    <template v-if="entry.item?.icon">
                                        {{ entry.item.icon }}
                                    </template>
                                    <svg
                                        v-else
                                        class="h-7 w-7 text-white/80"
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
import { onMounted, ref } from 'vue';
import PublicHeader from '../components/PublicHeader.vue';
import PageContainer from '../components/layout/PageContainer.vue';
import Footer from '../components/layout/Footer.vue';
import Badge from '../components/ui/Badge.vue';
import api from '../services/api';

const loading = ref(false);
const error = ref('');
const items = ref([]);

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

