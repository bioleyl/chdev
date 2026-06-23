<script
  generic="T"
  lang="ts"
  setup
>
  import { computed, ref } from 'vue';
  import ConfirmDialog from './ConfirmDialog.vue';
  import type { PaginationInput } from '@chdev/common';
  import type { DataTableHeader, DataTableSortItem } from 'vuetify';

  const options = defineModel<PaginationInput>('options', { required: true });

  const props = withDefaults(
    defineProps<{
      headers: Array<DataTableHeader<T>>;
      items: Array<T>;
      itemsLength: number;
      isLoading: boolean;
      showActions?: boolean;
      rowSelected?: T | null;
      height?: number;
    }>(),
    {
      height: 900,
      showActions: false,
      rowSelected: null,
    }
  );

  const emit = defineEmits<{
    'update:rowSelected': [item: T | null];
    delete: [item: T];
    edit: [item: T];
    download: [item: T];
  }>();

  const modal = ref<boolean>(false);
  const itemToDelete = ref<T | null>(null);

  const pagination = computed<PaginationInput>({
    get: () => options.value,
    set: (value) => {
      options.value = value;
    },
  });

  const columns = computed(() => {
    return props.showActions
      ? [
          ...props.headers,
          {
            title: 'Actions',
            key: 'actions',
            sortable: false,
            cellProps: { class: 'action-column' },
            headerProps: { class: 'action-column' },
            align: 'center' as const,
          },
        ]
      : props.headers;
  });

  function onSortByChange(cols: Array<DataTableSortItem>) {
    const sortBy = cols?.length ? cols[0].key : undefined;
    const sortDesc = cols?.length ? cols[0].order === 'desc' : false;
    pagination.value = { ...pagination.value, sortBy, sortDesc };
  }

  function onPageChange(page: number) {
    pagination.value = { ...pagination.value, page };
  }

  function onItemsPerPageChange(itemsPerPage: number) {
    pagination.value = { ...pagination.value, itemsPerPage };
  }

  function onDelete(item: T) {
    itemToDelete.value = item;
    modal.value = true;
  }

  function onDeleteConfirm() {
    modal.value = false;
    if (itemToDelete.value) {
      emit('delete', itemToDelete.value);
      itemToDelete.value = null;
    }
  }

  function onRowClick(item: T) {
    emit('update:rowSelected', item);
  }

  function rowProps({ item }: { item: T }) {
    return {
      class: item === props.rowSelected ? 'selected-row' : '',
      onClick: () => onRowClick(item),
    };
  }
</script>

<template>
  <v-data-table-server
    fixed-header
    :headers="columns"
    :height="props.height"
    :items="items"
    :items-length="itemsLength"
    :items-per-page="pagination.itemsPerPage"
    :loading="isLoading"
    :page="pagination.page"
    :row-props="rowProps"
    @update:items-per-page="onItemsPerPageChange"
    @update:page="onPageChange"
    @update:sort-by="onSortByChange"
  >
    <template
      v-for="(_, name) in $slots"
      :key="name"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps"
      />
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-space-around">
        <slot
          name="actions"
          :item="item"
        > </slot>
        <v-btn
          icon
          size="small"
          variant="text"
          @click.stop="emit('edit', item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          color="red"
          icon
          size="small"
          variant="text"
          @click.stop="onDelete(item)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table-server>
  <confirm-dialog
    text="Etes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
    title="Confirmation"
    v-model:open="modal"
    @no="modal = false"
    @yes="onDeleteConfirm"
  />
</template>

<style scoped>
  :global(td) {
    padding: 8px 16px;
  }

  :global(.selected-row) {
    background-color: rgba(25, 118, 210, 0.12);
  }

  :global(.selected-row:hover) {
    background-color: rgba(25, 118, 210, 0.18);
  }

  :global(.action-column) {
    position: sticky;
    right: 0;
    background: rgb(var(--v-theme-surface));
    z-index: 2;
    border-left: 1px solid rgba(0, 0, 0, 0.12);
  }
</style>
