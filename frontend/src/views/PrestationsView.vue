<template>
  <v-container
    data-testid="prestations-page-container"
    fluid
  >
    <v-row class="align-center">
      <v-col>
        <h1 class="text-h4">Prestations</h1>
      </v-col>
      <v-col>
        <v-text-field
          clearable
          data-testid="prestations-search-field"
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
          data-testid="prestations-create-button"
          @click="startCreate"
        >
          Créer une prestation
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <PrestationList
          v-model:options="options"
          v-model:row-selected="rowSelected"
          :is-loading="isLoading"
          :items="prestations"
          :items-length="itemsLength"
          @delete="deletePrestation"
          @edit="startEdit"
        />
      </v-col>
    </v-row>
    <PrestationDrawer
      v-model="drawer"
      :prestation="rowSelected"
    />
    <PrestationModal
      v-model="modalOpen"
      :is-creating="isCreating"
      :prestation="selectedPrestation"
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
  import { createPrestationSchema, updatePrestationSchema } from '@chdev/common';
  import { computed, onMounted, ref, watch } from 'vue';
  import PrestationDrawer from '../components/prestations/PrestationDrawer.vue';
  import PrestationList from '../components/prestations/PrestationList.vue';
  import PrestationModal from '../components/prestations/PrestationModal.vue';
  import { useLoading } from '../composables/useLoading';
  import { PrestationService } from '../services/prestation.service';
  import type { CreatePrestationInput, PaginationInput, Prestation, UpdatePrestationInput } from '@chdev/common';

  const { isLoading, withLoading } = useLoading();
  const prestations = ref<Array<Prestation>>([]);
  const rowSelected = ref<Prestation | null>(null);
  const search = ref<string>('');
  const selectedPrestation = ref<Prestation | null>(null);
  const itemsLength = ref<number>(0);
  const drawer = ref<boolean>(false);
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

  watch(options, (newOptions) => {
    fetchPrestations(newOptions);
  });

  watch(search, (newSearch) => {
    options.value = { ...options.value, search: newSearch || '' };
  });

  watch(rowSelected, (newValue) => {
    drawer.value = newValue !== null;
  });

  watch(drawer, (newValue) => {
    if (!newValue) {
      rowSelected.value = null;
    }
  });

  const schema = computed(() => {
    return isCreating.value ? createPrestationSchema : updatePrestationSchema;
  });

  async function fetchPrestations(options: PaginationInput) {
    const { data, total } = await withLoading(PrestationService.getAllPaginated(options));
    prestations.value = data;
    itemsLength.value = total;
  }

  async function deletePrestation(prestation: Prestation) {
    await withLoading(PrestationService.delete(prestation.id));
    fetchPrestations(options.value);
  }

  function startCreate() {
    isCreating.value = true;
    modalOpen.value = true;
  }

  function startEdit(item: Prestation) {
    isCreating.value = false;
    modalOpen.value = true;
    selectedPrestation.value = item;
  }

  function handleCancel() {
    rowSelected.value = null;
    isCreating.value = false;
    modalOpen.value = false;
  }

  async function handleModalSaved(value: CreatePrestationInput | UpdatePrestationInput) {
    if ('id' in value) {
      await withLoading(PrestationService.update(value));
    } else {
      await withLoading(PrestationService.create(value));
    }
    handleCancel();
    fetchPrestations(options.value);
  }

  onMounted(() => {
    fetchPrestations(options.value);
  });
</script>
