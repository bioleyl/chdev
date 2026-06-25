<script
  lang="ts"
  setup
>
  import { ref, watch } from 'vue';
  import PaginatedTable from '@/components/common/PaginatedTable.vue';
  import InvoiceList from '@/components/invoices/InvoiceList.vue';
  import { ClientService } from '@/services/client.service';
  import type { Client, Invoice, PaginationInput } from '@chdev/common';

  const options = defineModel<PaginationInput>('options', { required: true });
  const selectedClient = defineModel<Client | null>('rowSelected', { required: false });

  const props = defineProps<{
    items: Array<Client>;
    itemsLength: number;
    isLoading: boolean;
    showActions?: boolean;
    invoiceRefreshToken?: number;
  }>();

  const emit = defineEmits<{
    delete: [item: Client];
    edit: [item: Client];
    'delete-invoice': [clientId: number, invoice: Invoice];
    'edit-invoice': [clientId: number, invoice: Invoice];
    'print-invoice': [invoice: Invoice];
  }>();

  const headers = [
    { title: "Nom de l'entreprise", key: 'companyName' },
    { title: 'Email', key: 'email' },
    { title: 'Téléphone', key: 'phone' },
    { title: 'Adresse', key: 'address' },
    { title: 'Notes', key: 'notes' },
  ];

  const expandedClientIds = ref<Array<number>>([]);
  const invoicesByClientId = ref<Record<number, Array<Invoice>>>({});
  const loadingClientIds = ref<Array<number>>([]);

  function formatAdress(item: Client): string {
    const lines = [item.address, `${item.zipCode} ${item.city}`, item.country].filter(Boolean);
    if (lines.length === 0) {
      return 'No address';
    }
    return lines.join('\n');
  }

  function isLoadingInvoices(clientId: number): boolean {
    return loadingClientIds.value.includes(clientId);
  }

  async function fetchInvoicesForClient(clientId: number): Promise<void> {
    if (invoicesByClientId.value[clientId] !== undefined || isLoadingInvoices(clientId)) {
      return;
    }

    loadingClientIds.value = [...loadingClientIds.value, clientId];
    try {
      const invoices = await ClientService.getInvoicesByClientId(clientId);
      invoicesByClientId.value = {
        ...invoicesByClientId.value,
        [clientId]: invoices,
      };
    } finally {
      loadingClientIds.value = loadingClientIds.value.filter((id) => id !== clientId);
    }
  }

  watch(expandedClientIds, (newIds, oldIds = []) => {
    const newlyExpandedIds = newIds.filter((id) => !oldIds.includes(id));
    newlyExpandedIds.forEach((id) => {
      fetchInvoicesForClient(id);
    });
  });

  watch(
    () => props.invoiceRefreshToken,
    () => {
      const expandedIds = [...expandedClientIds.value];
      expandedIds.forEach((id) => {
        delete invoicesByClientId.value[id];
        fetchInvoicesForClient(id);
      });
    }
  );
</script>

<template>
  <PaginatedTable
    data-testid="clients-list-component"
    v-model:options="options"
    v-model:row-selected="selectedClient"
    v-model:expanded="expandedClientIds"
    :data-test-id-prefix="'clients'"
    :headers="headers"
    :is-loading="isLoading"
    :items="items"
    :items-length="itemsLength"
    :show-actions="true"
    :show-expand="true"
    @delete="emit('delete', $event)"
    @edit="emit('edit', $event)"
  >
    <template #item.address="{ item }">
      <span style="white-space: pre-line;">{{ formatAdress(item) }}</span>
    </template>
    <template #item.notes="{ item }">
      <span style="white-space: pre-line;">{{ item.notes }}</span>
    </template>

    <template #expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length">
          <div class="expanded-content">
            <div class="text-subtitle-2 mb-2">Factures</div>
            <InvoiceList
              :height="300"
              :is-loading="isLoadingInvoices(item.id)"
              :items="invoicesByClientId[item.id] ?? []"
              :items-length="(invoicesByClientId[item.id] ?? []).length"
              :show-actions="true"
              @delete="emit('delete-invoice', item.id, $event)"
              @edit="emit('edit-invoice', item.id, $event)"
              @print="emit('print-invoice', $event)"
            />
          </div>
        </td>
      </tr>
    </template>
  </PaginatedTable>
</template>

<style scoped>
  .expanded-content {
    padding: 8px 0;
  }
</style>
