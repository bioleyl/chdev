<template>
  <v-alert
    type="info"
    variant="tonal"
    v-if="lines.length === 0"
  >
    Aucune ligne. Ajoutez une prestation pour commencer.
  </v-alert>

  <v-data-table
    class="draggable-table"
    fixed-header
    height="500"
    hide-default-footer
    v-else
    ref="tableRef"
    :headers="headers"
    :items="lines"
    :items-per-page="-1"
    @click:row="onRowClick"
  >
    <template #item.handle="{ index }">
      <v-icon class="drag-handle">mdi-drag</v-icon>
    </template>
    <template #item.actions="{ index }">
      <div class="d-flex justify-space-around">
        <v-btn
          color="red"
          icon
          size="small"
          variant="text"
          @click.stop="emit('delete', index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script
  lang="ts"
  setup
>
  import Sortable from 'sortablejs';
  import { nextTick, onMounted, ref } from 'vue';
  import type { CreateInvoiceLineInput } from '@chdev/common';
  import type { SortableEvent } from 'sortablejs';
  import type { VDataTable } from 'vuetify/components';

  const lines = defineModel<Array<CreateInvoiceLineInput>>('lines', { required: true });

  const emit = defineEmits<{
    (e: 'edit', index: number): void;
    (e: 'delete', index: number): void;
  }>();

  const tableRef = ref<InstanceType<typeof VDataTable> | null>(null);

  const headers = [
    { title: '', key: 'handle', sortable: false, width: '60px' },
    { title: 'Description', key: 'description', sortable: false },
    { title: 'Quantite', key: 'quantity', sortable: false },
    {
      title: 'Prix unitaire',
      key: 'unitPrice',
      value: (item: CreateInvoiceLineInput) => formatCurrency(item.unitPrice),
      sortable: false,
    },
    {
      title: 'Total',
      key: 'total',
      value: (item: CreateInvoiceLineInput) => formatCurrency(item.quantity * item.unitPrice),
      sortable: false,
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      align: 'center' as const,
    },
  ];

  const currencyFormatter = new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
  });

  function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
  }

  function onRowClick(_: Event, { index }: { index: number }) {
    emit('edit', index);
  }

  onMounted(async () => {
    // Wait for the DOM and Vuetify layout engines to fully register
    await nextTick();

    if (tableRef.value?.$el) {
      // Safely query the raw DOM wrapper inside the typed table instance
      const tbody = tableRef.value.$el.querySelector('tbody') as HTMLTableSectionElement | null;

      if (tbody) {
        Sortable.create(tbody, {
          handle: '.drag-handle', // Tie drag actions strictly to the mdi-drag class
          animation: 200, // Move duration in milliseconds

          // Use Sortable's built-in SortableEvent interface for callback arguments
          onEnd: (evt: SortableEvent): void => {
            if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
              // Splice item from its original position
              const [movedItem] = lines.value.splice(evt.oldIndex, 1);

              // Re-insert item at its new structural coordinate
              lines.value.splice(evt.newIndex, 0, movedItem);
            }
          },
        });
      }
    }
  });
</script>

<style scoped>
  .drag-handle {
    cursor: grab;
  }
  .drag-handle:active {
    cursor: grabbing;
  }

  /* Optional: Targets the dynamic row element background safely via deep selectors */
  :global(.sortable-chosen) {
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
</style>
