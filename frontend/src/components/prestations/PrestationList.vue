<script
  lang="ts"
  setup
>
  import PaginatedTable from '../common/PaginatedTable.vue';
  import type { PaginationInput, Prestation } from '@chdev/common';

  const options = defineModel<PaginationInput>('options', { required: true });
  const rowSelected = defineModel<Prestation | null>('rowSelected', { required: false });

  const props = defineProps<{
    items: Array<Prestation>;
    itemsLength: number;
    isLoading: boolean;
    showActions?: boolean;
  }>();

  const emit = defineEmits<{
    delete: [item: Prestation];
    edit: [item: Prestation];
  }>();

  const headers = [
    { title: 'Label', key: 'label' },
    { title: 'Description', key: 'description' },
    { title: 'Prix unitaire', key: 'unitPrice' },
    { title: 'Unité', key: 'unit' },
  ];

  function formatCurrency(value: number): string {
    return value.toLocaleString('fr-CH', {
      style: 'currency',
      currency: 'CHF',
    });
  }
</script>

<template>
  <PaginatedTable
    data-testid="prestations-list-component"
    v-model:options="options"
    v-model:row-selected="rowSelected"
    :dataTestIdPrefix="'prestations'"
    :headers="headers"
    :is-loading="isLoading"
    :items="items"
    :items-length="itemsLength"
    :show-actions="true"
    @delete="emit('delete', $event)"
    @edit="emit('edit', $event)"
  >
    <template #item.unitPrice="{ value }">
      {{ formatCurrency(value) }}
    </template>
  </PaginatedTable>
</template>
