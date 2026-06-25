<script
  lang="ts"
  setup
>
  import { computed, ref } from 'vue';
  import PaginatedTable from '@/components/common/PaginatedTable.vue';
  import type { Invoice, InvoiceStatus, PaginationInput } from '@chdev/common';

  const options = defineModel<PaginationInput>('options', { required: false });
  const selectedInvoice = defineModel<Invoice | null>('selectedInvoice', { required: false });

  const props = defineProps<{
    items: Array<Invoice>;
    itemsLength: number;
    isLoading: boolean;
    showActions?: boolean;
    height?: number;
  }>();

  const emit = defineEmits<{
    delete: [item: Invoice];
    edit: [item: Invoice];
    print: [item: Invoice];
  }>();

  const internalOptions = ref<PaginationInput>({
    search: '',
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    sortBy: undefined,
    sortDesc: false,
  });

  const tableOptions = computed<PaginationInput>({
    get: () => options.value ?? internalOptions.value,
    set: (value) => {
      if (options.value === undefined) {
        internalOptions.value = value;
      } else {
        options.value = value;
      }
    },
  });

  const isLocalPagination = computed(() => options.value === undefined);

  function resolvePathValue(item: Invoice, path: string): unknown {
    if (path === 'invoiceDate') {
      return item.createdAt;
    }

    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc !== null && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, item);
  }

  function normalizeSortValue(value: unknown): string | number {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const timestamp = Date.parse(value);
      if (!Number.isNaN(timestamp)) {
        return timestamp;
      }
      return value.toLocaleLowerCase();
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value).toLocaleLowerCase();
  }

  const sortedLocalItems = computed(() => {
    if (!isLocalPagination.value) {
      return props.items;
    }

    const sortBy = tableOptions.value.sortBy;
    if (!sortBy) {
      return props.items;
    }

    const direction = tableOptions.value.sortDesc ? -1 : 1;
    return [...props.items].sort((a, b) => {
      const aValue = normalizeSortValue(resolvePathValue(a, sortBy));
      const bValue = normalizeSortValue(resolvePathValue(b, sortBy));

      if (aValue < bValue) {
        return -1 * direction;
      }
      if (aValue > bValue) {
        return 1 * direction;
      }
      return 0;
    });
  });

  const displayedItems = computed(() => {
    if (!isLocalPagination.value) {
      return props.items;
    }

    const page = tableOptions.value.page || 1;
    const itemsPerPage = tableOptions.value.itemsPerPage || 10;
    const start = (page - 1) * itemsPerPage;
    return sortedLocalItems.value.slice(start, start + itemsPerPage);
  });

  const displayedItemsLength = computed(() => {
    if (!isLocalPagination.value) {
      return props.itemsLength;
    }
    return props.items.length;
  });

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
    data-testid="invoices-list-component"
    v-model:options="tableOptions"
    v-model:row-selected="selectedInvoice"
    :data-test-id-prefix="'invoices'"
    :headers="headers"
    :height="props.height"
    :is-loading="isLoading"
    :items="displayedItems"
    :items-length="displayedItemsLength"
    :show-actions="props.showActions ?? true"
    @delete="emit('delete', $event)"
    @edit="emit('edit', $event)"
  >
    <template
      v-if="props.showActions ?? true"
      v-slot:actions="{ item }"
    >
      <v-btn
        data-testid="invoices-print-button"
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
