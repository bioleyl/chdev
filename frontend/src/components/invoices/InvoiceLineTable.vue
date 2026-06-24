<template>
  <v-alert
    type="info"
    variant="tonal"
    v-if="props.lines.length === 0"
  >
    Aucune ligne. Ajoutez une prestation pour commencer.
  </v-alert>

  <v-data-table
    fixed-header
    height="500"
    hide-default-footer
    v-else
    :headers="headers"
    :items="props.lines"
    :items-per-page="-1"
    @click:row="onRowClick"
  >
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
  import { v } from 'vue-router/dist/router-CWoNjPRp.mjs';
  import type { CreateInvoiceLineInput } from '@chdev/common';

  const props = defineProps<{
    lines: Array<CreateInvoiceLineInput>;
  }>();

  const emit = defineEmits<{
    (e: 'edit', index: number): void;
    (e: 'delete', index: number): void;
  }>();

  const headers = [
    { title: 'Description', key: 'description' },
    { title: 'Quantite', key: 'quantity' },
    {
      title: 'Prix unitaire',
      key: 'unitPrice',
      value: (item: CreateInvoiceLineInput) => formatCurrency(item.unitPrice),
    },
    {
      title: 'Total',
      key: 'total',
      value: (item: CreateInvoiceLineInput) => formatCurrency(item.quantity * item.unitPrice),
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
</script>
