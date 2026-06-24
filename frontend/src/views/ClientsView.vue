<template>
  <v-container fluid>
    <v-row class="align-center">
      <v-col>
        <h1 class="text-h4">Clients</h1>
      </v-col>
      <v-col>
        <v-text-field
          clearable
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
          :is-loading="isLoading"
          :items="clients"
          :items-length="totalClients"
          :search="search"
          @delete="deleteClient"
          @edit="startEdit"
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
      v-model="invoiceFromClientModalOpen"
      :invoice="null"
      :is-creating="isCreatingFromClient"
      :preselected-client-id="preselectedClientId"
      :schema="invoiceSchema"
      @cancel="handleInvoiceFromClientCancel"
      @saved="handleInvoiceFromClientSaved"
    />
  </v-container>
</template>

<script
  lang="ts"
  setup
>
  import { createClientSchema, createInvoiceSchema, updateClientSchema } from '@chdev/common';
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
    PaginationInput,
    UpdateClientInput,
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
  const isCreatingFromClient = ref<boolean>(false);
  const invoiceFromClientModalOpen = ref<boolean>(false);
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
    return createInvoiceSchema;
  });

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
    preselectedClientId.value = client.id;
    isCreatingFromClient.value = true;
    invoiceFromClientModalOpen.value = true;
    drawerOpen.value = false;
  }

  function handleInvoiceFromClientCancel(): void {
    isCreatingFromClient.value = false;
    preselectedClientId.value = undefined;
    invoiceFromClientModalOpen.value = false;
  }

  async function handleInvoiceFromClientSaved(value: CreateInvoiceInput) {
    await withLoading(InvoiceService.create(value));
    handleInvoiceFromClientCancel();
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
