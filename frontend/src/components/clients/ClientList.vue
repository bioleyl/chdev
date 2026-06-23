<script
  lang="ts"
  setup
>
  import PaginatedTable from '@/components/common/PaginatedTable.vue';
  import type { Client, PaginationInput } from '@chdev/common';

  const options = defineModel<PaginationInput>('options', { required: true });
  const selectedClient = defineModel<Client | null>('rowSelected', { required: false });

  const props = defineProps<{
    items: Array<Client>;
    itemsLength: number;
    isLoading: boolean;
    showActions?: boolean;
  }>();

  const emit = defineEmits<{
    delete: [item: Client];
    edit: [item: Client];
  }>();

  const headers = [
    { title: "Nom de l'entreprise", key: 'companyName' },
    { title: 'Email', key: 'email' },
    { title: 'Téléphone', key: 'phone' },
    { title: 'Adresse', key: 'address' },
    { title: 'Notes', key: 'notes' },
  ];

  function formatAdress(item: Client): string {
    const lines = [item.address, `${item.zipCode} ${item.city}`, item.country].filter(Boolean);
    if (lines.length === 0) {
      return 'No address';
    }
    return lines.join('\n');
  }
</script>

<template>
  <PaginatedTable
    v-model:options="options"
    v-model:row-selected="selectedClient"
    :headers="headers"
    :is-loading="isLoading"
    :items="items"
    :items-length="itemsLength"
    :show-actions="true"
    @delete="emit('delete', $event)"
    @edit="emit('edit', $event)"
  >
    <template #item.address="{ item }">
      <span style="white-space: pre-line;">{{ formatAdress(item) }}</span>
    </template>
    <template #item.notes="{ item }">
      <span style="white-space: pre-line;">{{ item.notes }}</span>
    </template>
  </PaginatedTable>
</template>
