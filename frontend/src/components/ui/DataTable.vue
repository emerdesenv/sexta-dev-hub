<template>
    <div class="sd-data-table">
        <div class="sd-data-table-toolbar">
            <label class="sd-data-table-search">
                <input
                    v-model.trim="searchText"
                    type="search"
                    class="sd-input sd-data-table-search-input"
                    :placeholder="searchPlaceholder"
                >
            </label>
            <div class="sd-data-table-page-size">
                <span class="text-xs text-muted">Itens por página</span>
                <select v-model.number="pageSize" class="sd-input !w-auto !py-2 !px-3 text-sm">
                    <option v-for="option in pageSizeOptions" :key="`size-${option}`" :value="option">
                        {{ option }}
                    </option>
                </select>
            </div>
        </div>

        <div class="sd-data-table-wrap">
            <table
                class="sd-table sd-data-table-table"
                :class="{ 'sd-data-table-table--compact': density === 'compact' }"
            >
                <thead>
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="`head-${column.key}`"
                            :class="[column.headerClass || '', alignClass(column.align)]"
                            :style="columnWidthStyle(column)"
                        >
                            <button
                                v-if="column.sortable !== false"
                                type="button"
                                class="sd-data-table-sort"
                                @click="toggleSort(String(column.key))"
                            >
                                <span>{{ column.label }}</span>
                                <span class="sd-data-table-sort-icon">
                                    {{ sortIndicator(String(column.key)) }}
                                </span>
                            </button>
                            <span v-else>{{ column.label }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in paginatedRows"
                        :key="rowId(row)"
                        class="sd-data-table-row"
                        @click="emit('row-click', row)"
                    >
                        <td
                            v-for="column in columns"
                            :key="`cell-${rowId(row)}-${column.key}`"
                            :class="[column.cellClass || '', alignClass(column.align)]"
                            :style="columnWidthStyle(column)"
                        >
                            <slot :name="`cell-${column.key}`" :row="row">
                                {{ row[column.key] }}
                            </slot>
                        </td>
                    </tr>
                    <tr v-if="!paginatedRows.length">
                        <td :colspan="columns.length" class="py-8 text-center text-muted">
                            {{ emptyText }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="sd-data-table-footer">
            <span class="text-sm text-muted">
                Mostrando {{ pageFrom }}-{{ pageTo }} de {{ sortedRows.length }} registro(s)
            </span>
            <div class="flex items-center gap-2">
                <button
                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                    type="button"
                    :disabled="currentPage <= 1"
                    @click="currentPage -= 1"
                >
                    Anterior
                </button>
                <span class="text-sm text-muted">Página {{ currentPage }} de {{ totalPages }}</span>
                <button
                    class="sd-button sd-button-secondary px-3 py-2 text-sm"
                    type="button"
                    :disabled="currentPage >= totalPages"
                    @click="currentPage += 1"
                >
                    Próxima
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
    columns: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
    rowKey: { type: [String, Function], default: 'id' },
    searchKeys: { type: Array, default: () => [] },
    searchPlaceholder: { type: String, default: 'Buscar na tabela...' },
    emptyText: { type: String, default: 'Sem registros.' },
    pageSizeOptions: { type: Array, default: () => [5, 10, 20, 50] },
    initialPageSize: { type: Number, default: 10 },
    density: { type: String, default: 'comfortable' }
});

const emit = defineEmits(['row-click']);

const searchText = ref('');
const sortKey = ref('');
const sortDir = ref('asc');
const currentPage = ref(1);
const pageSize = ref(props.initialPageSize);

watch(() => props.rows, () => {
    currentPage.value = 1;
});

watch([searchText, pageSize], () => {
    currentPage.value = 1;
});

function rowId(row) {
    if (typeof props.rowKey === 'function') return props.rowKey(row);
    return row?.[props.rowKey] ?? JSON.stringify(row);
}

function normalize(value) {
    return String(value ?? '').toLowerCase();
}

const filteredRows = computed(() => {
    const query = normalize(searchText.value);
    if (!query) return props.rows;
    const keys = props.searchKeys.length ? props.searchKeys : props.columns.map((col) => String(col.key));
    return props.rows.filter((row) => keys.some((key) => normalize(row?.[key]).includes(query)));
});

const sortedRows = computed(() => {
    if (!sortKey.value) return filteredRows.value;
    const copied = [...filteredRows.value];
    copied.sort((a, b) => {
        const left = a?.[sortKey.value];
        const right = b?.[sortKey.value];
        const leftNorm = typeof left === 'number' ? left : normalize(left);
        const rightNorm = typeof right === 'number' ? right : normalize(right);
        if (leftNorm < rightNorm) return sortDir.value === 'asc' ? -1 : 1;
        if (leftNorm > rightNorm) return sortDir.value === 'asc' ? 1 : -1;
        return 0;
    });
    return copied;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value)));

watch(totalPages, (value) => {
    if (currentPage.value > value) currentPage.value = value;
});

const paginatedRows = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return sortedRows.value.slice(start, start + pageSize.value);
});

const pageFrom = computed(() => (sortedRows.value.length ? ((currentPage.value - 1) * pageSize.value) + 1 : 0));
const pageTo = computed(() => Math.min(currentPage.value * pageSize.value, sortedRows.value.length));

function toggleSort(key) {
    if (sortKey.value !== key) {
        sortKey.value = key;
        sortDir.value = 'asc';
        return;
    }
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
}

function sortIndicator(key) {
    if (sortKey.value !== key) return '↕';
    return sortDir.value === 'asc' ? '↑' : '↓';
}

function alignClass(align) {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return '';
}

/** Keeps declared column widths from collapsing when the table is width: 100%. */
function columnWidthStyle(column) {
    if (!column?.width) return null;
    return { width: column.width, minWidth: column.width };
}
</script>

<style scoped>
.sd-data-table {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.sd-data-table-toolbar {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.sd-data-table-search {
    flex: 1;
    min-width: min(100%, 260px);
}

.sd-data-table-search-input {
    width: 100%;
}

.sd-data-table-page-size {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.sd-data-table-wrap {
    overflow: auto;
}

.sd-data-table-table {
    min-width: 720px;
}

.sd-data-table-table--compact :deep(th),
.sd-data-table-table--compact :deep(td) {
    padding: 0.55rem 0.75rem;
}

.sd-data-table-sort {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    padding: 0;
}

.sd-data-table-sort-icon {
    font-size: 0.72rem;
    color: var(--muted);
}

.sd-data-table-row:nth-child(even) {
    background: color-mix(in srgb, var(--surface-2) 28%, transparent);
}

.sd-data-table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}
</style>
