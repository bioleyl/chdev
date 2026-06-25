<template>
  <v-dialog
    data-testid="invoices-modal-component"
    max-width="800"
    persistent
    v-model="internalDialog"
  >
    <v-card v-if="invoice || isCreating">
      <v-card-title>
        <div class="text-h5 pa-3 pb-0">
          {{ isCreating ? 'Créer une facture' : 'Modifier la facture' }}
        </div>
      </v-card-title>

      <v-card-text>
        <invoice-form
          :editing="true"
          :initial-values="data"
          :schema="schema"
          @cancel="handleCancel"
          @submit="emit('saved', $event)"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script
  generic="TSchema extends import('zod').ZodType<CreateInvoiceInput | UpdateInvoiceInput>"
  lang="ts"
  setup
>
  import { computed, watch } from 'vue';
  import InvoiceForm from './InvoiceForm.vue';
  import type { CreateInvoiceInput, Invoice, UpdateInvoiceInput } from '@chdev/common';
  import type { z } from 'zod';

  const props = defineProps<{
    modelValue: boolean;
    invoice: z.input<TSchema> | null;
    isCreating: boolean;
    schema: TSchema;
    preselectedClientId?: number;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    cancel: [];
    saved: [value: z.output<TSchema>];
  }>();

  const internalDialog = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  });

  const initialCreateData: CreateInvoiceInput = {
    //@ts-expect-error
    clientId: undefined,
    lines: [],
  };

  const data = computed<z.input<TSchema>>(() => {
    if (props.isCreating) {
      return {
        clientId: props.preselectedClientId ?? undefined,
        lines: [],
      } as z.input<TSchema>;
    }
    return props.invoice as z.input<TSchema>;
  });

  function handleCancel() {
    emit('cancel');
  }

  // Auto-open dialog when an invoice is selected or when creating
  watch(
    () => props.invoice,
    (newValue) => {
      if (newValue !== null && !props.isCreating) {
        internalDialog.value = true;
      }
    }
  );

  watch(
    () => props.isCreating,
    (newValue) => {
      if (newValue) {
        internalDialog.value = true;
      }
    }
  );

  watch(internalDialog, (newValue) => {
    if (!newValue) {
      emit('cancel');
    }
  });
</script>
