<script
  generic="T"
  lang="ts"
  setup
>
  import { ref, watch } from 'vue';
  import { useLoading } from '@/composables/useLoading';

  const props = withDefaults(
    defineProps<{
      modelValue: number | undefined;
      label: string;
      errors?: string | Array<string>;
      itemTitle: (item: T) => string;
      search: (search: string) => Promise<{ data: Array<T>; total: number }>;
      fetchById?: (id: number) => Promise<T>;
      itemValue?: string;
      readonly?: boolean;
      disabled?: boolean;
    }>(),
    {
      readonly: false,
      disabled: false,
    }
  );

  const emit = defineEmits<(e: 'update:modelValue', value: number | undefined) => void>();

  const { isLoading, withLoading } = useLoading();

  const menuOpen = ref(false);
  const items = ref<Array<T>>([]);
  const searchText = ref('');
  const selectedId = ref<number | undefined>(props.modelValue);
  const selectedItem = ref<T | undefined>(undefined);
  const valueKey = props.itemValue ?? 'id';

  function getItemValue(item: T): number {
    return Reflect.get(item as object, valueKey) as number;
  }

  function formatItem(item: T): string {
    return props.itemTitle(item);
  }

  watch(
    () => props.modelValue,
    async (newValue) => {
      selectedId.value = newValue;
      if (newValue) {
        await fetchItemDetails(newValue);
      } else {
        selectedItem.value = undefined;
        searchText.value = '';
      }
    },
    { immediate: true }
  );

  watch(selectedId, (newValue) => {
    emit('update:modelValue', newValue);
  });

  watch(searchText, async (newSearch) => {
    if (!newSearch) {
      items.value = [];
      return;
    }
    await doSearch(newSearch);
  });

  async function doSearch(searchQuery: string) {
    const result = await withLoading(props.search(searchQuery));
    items.value = result.data;
    menuOpen.value = true;
  }

  async function fetchItemDetails(id: number) {
    if (props.fetchById) {
      selectedItem.value = await withLoading(props.fetchById(id));
    }
  }

  function onSelect(item: T) {
    selectedId.value = getItemValue(item);
    selectedItem.value = item;
    searchText.value = '';
    menuOpen.value = false;
  }

  function onClear() {
    selectedId.value = undefined;
    selectedItem.value = undefined;
    searchText.value = '';
    items.value = [];
  }
</script>

<template>
  <v-menu
    activator="parent"
    width="auto"
    v-model="menuOpen"
    :close-on-content-click="false"
    :disabled="!!selectedId"
  >
    <v-list
      density="compact"
      :loading="isLoading"
    >
      <v-list-item
        v-for="item in items"
        :key="getItemValue(item as T)"
        :value="getItemValue(item as T)"
        @click="onSelect(item as T)"
      >
        <v-list-item-title>{{ formatItem(item as T) }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="items.length === 0 && !isLoading">
        <v-list-item-title>Aucun résultat</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <div>
    <v-text-field
      density="compact"
      readonly
      v-if="selectedId"
      :clearable="!props.readonly"
      :disabled="props.disabled"
      :error-messages="errors"
      :label="label"
      :model-value="selectedItem ? formatItem(selectedItem as T) : ''"
      @click:clear="onClear"
    />
    <v-text-field
      clearable
      density="compact"
      placeholder="Rechercher..."
      v-else
      v-model="searchText"
      :disabled="props.disabled"
      :error-messages="errors"
      :label="label"
      :readonly="props.readonly"
      @click:clear="onClear"
      @focus="menuOpen = true"
    />
  </div>
</template>
