<script
  lang="ts"
  setup
>
  import PaginatedTable from '@/components/common/PaginatedTable.vue';
  import type { Invoice, InvoiceStatus, PaginationInput } from '@chdev/common';

  const options = defineModel<PaginationInput>('options', { required: true });
  const selectedInvoice = defineModel<Invoice | null>('selectedInvoice', { required: false });

  const props = defineProps<{
    items: Array<Invoice>;
    itemsLength: number;
    isLoading: boolean;
    showActions?: boolean;
  }>();

  const emit = defineEmits<{
    delete: [item: Invoice];
    edit: [item: Invoice];
    print: [item: Invoice];
  }>();

  const headers = [
    { title: 'Invoice Number', key: 'number' },
    { title: 'Client', key: 'client.companyName', value: (item: Invoice) => item.client?.companyName || '' },
    { title: 'Date', key: 'invoiceDate' },
    { title: 'Status', key: 'status' },
    { title: 'Total', key: 'total' },
  ];

  function statusColor(status: InvoiceStatus): string {
    const colors: Record<InvoiceStatus, string> = {
      DRAFT: 'grey',
      SENT: 'blue',
      PAID: 'green',
      CANCELLED: 'red',
    };
    return colors[status.toUpperCase() as InvoiceStatus] ?? 'grey';
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('fr-CH', {
      style: 'currency',
      currency: 'CHF',
    });
  }
</script>

<template>
  <PaginatedTable
    v-model:options="options"
    v-model:row-selected="selectedInvoice"
    :headers="headers"
    :is-loading="isLoading"
    :items="items"
    :items-length="itemsLength"
    :show-actions="true"
    @delete="emit('delete', $event)"
    @edit="emit('edit', $event)"
  >
    <template v-slot:actions="{ item }">
      <v-btn
        icon
        size="small"
        variant="text"
        @click="$emit('print', item)"
      >
        <v-icon>mdi-file-pdf-box</v-icon>
      </v-btn>
    </template>

    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)">
        {{ item.status }}
      </v-chip>
    </template>

    <template #item.total="{ value }">
      {{ formatCurrency(value) }}
    </template>
  </PaginatedTable>
</template>
