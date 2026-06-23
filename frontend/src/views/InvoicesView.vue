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
          @delete="deleteInvoice"
          @edit="startEdit"
          @print="printInvoice"
        />
      </v-col>
    </v-row>
    <InvoiceModal
      v-model="modalOpen"
      :invoice="selectedInvoice"
      :is-creating="isCreating"
      :schema="schema"
      @cancel="handleCancel"
      @saved="handleModalSaved"
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
  const selectedInvoice = ref<Invoice | null>(null);
  const search = ref<string>('');
  const itemsLength = ref<number>(0);
  const modalOpen = ref<boolean>(false);
  const isCreating = ref<boolean>(false);

  const options = ref<PaginationInput>({
    search: '',
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    sortBy: undefined,
    sortDesc: false,
  });

  const schema = computed(() => (isCreating.value ? createInvoiceSchema : updateInvoiceSchema));

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

  async function deleteInvoice(invoice: Invoice) {
    await withLoading(InvoiceService.delete(invoice.id));
    await fetchInvoices(options.value);
  }

  function startCreate() {
    isCreating.value = true;
    selectedInvoice.value = null;
    modalOpen.value = true;
  }

  function startEdit(item: Invoice) {
    isCreating.value = false;
    selectedInvoice.value = item;
    modalOpen.value = true;
  }

  function handleCancel() {
    selectedInvoice.value = null;
    isCreating.value = false;
    modalOpen.value = false;
  }

  async function handleModalSaved(value: CreateInvoiceInput | UpdateInvoiceInput) {
    if ('id' in value) {
      await withLoading(InvoiceService.update(value.id, value));
    } else {
      await withLoading(InvoiceService.create(value));
    }
    handleCancel();
    fetchInvoices(options.value);
  }

  async function printInvoice(item: Invoice): Promise<void> {
    const blob = await withLoading(InvoiceService.downloadPdf(item.id));
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank');

    // optional cleanup (slightly delayed to ensure the tab has time to load it)
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  onMounted(() => {
    fetchInvoices(options.value);
  });
</script>
