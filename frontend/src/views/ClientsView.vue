<template>
  <v-container
    data-testid="clients-page-container"
    fluid
  >
    <v-row class="align-center">
      <v-col>
        <h1 class="text-h4">Clients</h1>
      </v-col>
      <v-col>
        <v-text-field
          clearable
          data-testid="clients-search-field"
          hide-details
          placeholder="Rechercher..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          v-model="search"
        ></v-text-field>
      </v-col>
      <v-col class="text-right">
        <v-btn
          color="primary"
          data-testid="clients-create-button"
          @click="startCreate"
        >
          Créer un client
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ClientList
          v-model:options="options"
          v-model:row-selected="rowSelected"
          :invoice-refresh-token="invoiceRefreshToken"
          :is-loading="isLoading"
          :items="clients"
          :items-length="totalClients"
          @delete="deleteClient"
          @delete-invoice="handleDeleteInvoice"
          @edit="startEdit"
          @edit-invoice="handleEditInvoice"
          @print-invoice="printInvoiceCommand"
        />
      </v-col>
    </v-row>
    <ClientModal
      v-model="modalOpen"
      :client="selectedClient"
      :is-creating="isCreating"
      :schema="schema"
      @cancel="handleCancel"
      @saved="handleModalSaved"
    />

    <ClientDrawer
      v-model="drawerOpen"
      :client="rowSelected"
      @create-invoice="handleCreateInvoiceFromClient"
    />

    <InvoiceModal
      v-model="invoiceModalOpen"
      :invoice="selectedInvoiceForInvoiceModal"
      :is-creating="isCreatingInvoice"
      :preselected-client-id="preselectedClientId"
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
  import { createClientSchema, createInvoiceSchema, updateClientSchema, updateInvoiceSchema } from '@chdev/common';
  import { computed, onMounted, ref, watch } from 'vue';
  import ClientDrawer from '@/components/clients/ClientDrawer.vue';
  import ClientList from '@/components/clients/ClientList.vue';
  import ClientModal from '@/components/clients/ClientModal.vue';
  import InvoiceModal from '@/components/invoices/InvoiceModal.vue';
  import { useLoading } from '../composables/useLoading';
  import { ClientService } from '../services/client.service';
  import { InvoiceService } from '../services/invoice.service';
  import type {
    Client,
    CreateClientInput,
    CreateInvoiceInput,
    Invoice,
    PaginationInput,
    UpdateClientInput,
    UpdateInvoiceInput,
  } from '@chdev/common';

  const { isLoading, withLoading } = useLoading();
  const clients = ref<Array<Client>>([]);
  const rowSelected = ref<Client | null>(null);
  const selectedClient = ref<Client | null>(null);
  const search = ref<string>('');
  const totalClients = ref<number>(0);
  const modalOpen = ref<boolean>(false);
  const isCreating = ref<boolean>(false);
  const drawerOpen = ref<boolean>(false);
  const invoiceRefreshToken = ref<number>(0);
  const invoiceModalOpen = ref<boolean>(false);
  const isCreatingInvoice = ref<boolean>(false);
  const selectedInvoiceForInvoiceModal = ref<Invoice | null>(null);
  const preselectedClientId = ref<number | undefined>(undefined);

  const options = ref<PaginationInput>({
    search: '',
    totalItems: 0,
    page: 1,
    itemsPerPage: 10,
    sortBy: undefined,
    sortDesc: false,
  });

  watch(options, (newOptions) => {
    fetchClients(newOptions);
  });

  watch(search, (newSearch) => {
    options.value = { ...options.value, search: newSearch || '' };
  });

  watch(rowSelected, (newValue) => {
    if (newValue !== null) {
      drawerOpen.value = true;
    }
  });

  watch(drawerOpen, (newValue) => {
    if (!newValue) {
      rowSelected.value = null;
    }
  });

  const schema = computed(() => {
    return isCreating.value ? createClientSchema : updateClientSchema;
  });

  const invoiceSchema = computed(() => {
    return isCreatingInvoice.value ? createInvoiceSchema : updateInvoiceSchema;
  });

  async function refreshAfterInvoiceChange() {
    invoiceRefreshToken.value += 1;
    await fetchClients(options.value);
  }

  async function saveInvoiceCommand(value: CreateInvoiceInput | UpdateInvoiceInput): Promise<void> {
    if ('id' in value) {
      await withLoading(InvoiceService.update(value.id, value));
    } else {
      await withLoading(InvoiceService.create(value));
    }
    await refreshAfterInvoiceChange();
  }

  async function deleteInvoiceCommand(invoice: Invoice): Promise<void> {
    await withLoading(InvoiceService.delete(invoice.id));
    await refreshAfterInvoiceChange();
  }

  async function printInvoiceCommand(invoice: Invoice): Promise<void> {
    const blob = await withLoading(InvoiceService.downloadPdf(invoice.id));
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function fetchClients(pagination: PaginationInput) {
    const { data, total } = await withLoading(ClientService.getAllPaginated(pagination));
    clients.value = data;
    totalClients.value = total;
  }

  async function deleteClient(client: Client) {
    await withLoading(ClientService.delete(client.id));
    fetchClients(options.value);
  }

  function startCreate() {
    isCreating.value = true;
    selectedClient.value = null;
    modalOpen.value = true;
  }

  function startEdit(item: Client) {
    isCreating.value = false;
    selectedClient.value = item;
    modalOpen.value = true;
  }

  function handleCancel() {
    selectedClient.value = null;
    isCreating.value = false;
    modalOpen.value = false;
  }

  function handleCreateInvoiceFromClient(client: Client): void {
    isCreatingInvoice.value = true;
    selectedInvoiceForInvoiceModal.value = null;
    preselectedClientId.value = client.id;
    invoiceModalOpen.value = true;
    drawerOpen.value = false;
  }

  function handleInvoiceModalCancel(): void {
    invoiceModalOpen.value = false;
    isCreatingInvoice.value = false;
    selectedInvoiceForInvoiceModal.value = null;
    preselectedClientId.value = undefined;
  }

  async function handleInvoiceModalSaved(value: CreateInvoiceInput | UpdateInvoiceInput) {
    await saveInvoiceCommand(value);
    handleInvoiceModalCancel();
  }

  function handleEditInvoice(_clientId: number, invoice: Invoice): void {
    isCreatingInvoice.value = false;
    preselectedClientId.value = undefined;
    selectedInvoiceForInvoiceModal.value = invoice;
    invoiceModalOpen.value = true;
  }

  async function handleDeleteInvoice(_clientId: number, invoice: Invoice): Promise<void> {
    await deleteInvoiceCommand(invoice);
  }

  async function handleModalSaved(value: CreateClientInput | UpdateClientInput) {
    if ('id' in value) {
      await withLoading(ClientService.update(value.id, value));
    } else {
      await withLoading(ClientService.create(value));
    }
    handleCancel();
    fetchClients(options.value);
  }

  onMounted(() => {
    fetchClients(options.value);
  });
</script>
