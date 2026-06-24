<template>
  <v-container fluid>
    <v-row class="align-center">
      <v-col>
        <h1 class="text-h4">Factures</h1>
      </v-col>
      <v-col>
        <v-text-field
          clearable
          hide-details
          placeholder="Rechercher..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          v-model="search"
        />
      </v-col>
      <v-col class="text-right">
        <v-btn
          color="primary"
          @click="startCreate"
        >
          Créer une facture
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <InvoiceList
          v-model:options="options"
          v-model:row-selected="rowSelected"
          :is-loading="isLoading"
          :items="invoices"
          :items-length="itemsLength"
          :show-actions="true"
          @delete="handleDeleteInvoice"
          @edit="startEdit"
          @print="printInvoiceCommand"
        />
      </v-col>
    </v-row>
    <InvoiceModal
      v-model="invoiceModalOpen"
      :invoice="selectedInvoice"
      :is-creating="isCreatingInvoice"
      :schema="invoiceSchema"
      @cancel="handleInvoiceModalCancel"
      @saved="handleInvoiceModalSaved"
    />
  </v-container>
</template>

<script
  lang="ts"
  setup
>
  import { createInvoiceSchema, updateInvoiceSchema } from '@chdev/common';
  import { computed, onMounted, ref, watch } from 'vue';
  import InvoiceList from '@/components/invoices/InvoiceList.vue';
  import InvoiceModal from '@/components/invoices/InvoiceModal.vue';
  import { useLoading } from '../composables/useLoading';
  import { InvoiceService } from '../services/invoice.service';
  import type { CreateInvoiceInput, Invoice, PaginationInput, UpdateInvoiceInput } from '@chdev/common';

  const { isLoading, withLoading } = useLoading();
  const invoices = ref<Array<Invoice>>([]);
  const rowSelected = ref<Invoice | null>(null);
  const search = ref<string>('');
  const itemsLength = ref<number>(0);
  const invoiceModalOpen = ref<boolean>(false);
  const selectedInvoice = ref<Invoice | null>(null);
  const isCreatingInvoice = ref<boolean>(false);

  const options = ref<PaginationInput>({
    search: '',
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    sortBy: undefined,
    sortDesc: false,
  });

  const invoiceSchema = computed(() => {
    return isCreatingInvoice.value ? createInvoiceSchema : updateInvoiceSchema;
  });

  watch(options, (newOptions) => {
    fetchInvoices(newOptions);
  });

  watch(search, (newSearch) => {
    options.value = { ...options.value, search: newSearch || '' };
  });

  async function fetchInvoices(pagination: PaginationInput) {
    const { data, total } = await withLoading(InvoiceService.getAllPaginated(pagination));
    invoices.value = data;
    itemsLength.value = total;
  }

  async function refreshAfterInvoiceChange(): Promise<void> {
    await fetchInvoices(options.value);
  }

  function startCreate(): void {
    isCreatingInvoice.value = true;
    selectedInvoice.value = null;
    invoiceModalOpen.value = true;
  }

  function startEdit(invoice: Invoice): void {
    isCreatingInvoice.value = false;
    selectedInvoice.value = invoice;
    invoiceModalOpen.value = true;
  }

  function handleInvoiceModalCancel(): void {
    invoiceModalOpen.value = false;
    isCreatingInvoice.value = false;
    selectedInvoice.value = null;
  }

  async function saveInvoiceCommand(value: CreateInvoiceInput | UpdateInvoiceInput): Promise<void> {
    if ('id' in value) {
      await withLoading(InvoiceService.update(value.id, value));
    } else {
      await withLoading(InvoiceService.create(value));
    }
    await refreshAfterInvoiceChange();
  }

  async function handleInvoiceModalSaved(value: CreateInvoiceInput | UpdateInvoiceInput): Promise<void> {
    await saveInvoiceCommand(value);
    handleInvoiceModalCancel();
  }

  async function deleteInvoiceCommand(invoice: Invoice): Promise<void> {
    await withLoading(InvoiceService.delete(invoice.id));
    await refreshAfterInvoiceChange();
  }

  async function handleDeleteInvoice(invoice: Invoice): Promise<void> {
    await deleteInvoiceCommand(invoice);
  }

  async function printInvoiceCommand(invoice: Invoice): Promise<void> {
    const blob = await withLoading(InvoiceService.downloadPdf(invoice.id));
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  onMounted(() => {
    fetchInvoices(options.value);
  });
</script>
