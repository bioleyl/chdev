<template>
  <v-dialog
    data-testid="clients-modal-component"
    max-width="600"
    persistent
    v-model="internalDialog"
  >
    <v-card v-if="client || isCreating">
      <v-card-title>
        <div class="text-h5 pa-3 pb-0">
          {{ isCreating ? 'Créer un client' : 'Modifier le client' }}
        </div>
      </v-card-title>

      <v-card-text>
        <client-form
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
  generic="TSchema extends import('zod').ZodType<CreateClientInput | UpdateClientInput>"
  lang="ts"
  setup
>
  import { computed, watch } from 'vue';
  import ClientForm from './ClientForm.vue';
  import type { Client, CreateClientInput, UpdateClientInput } from '@chdev/common';
  import type { z } from 'zod';

  const props = defineProps<{
    modelValue: boolean;
    client: z.input<TSchema> | null;
    isCreating: boolean;
    schema: TSchema;
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

  const initialCreateData: CreateClientInput = {
    companyName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: 0,
    city: '',
    country: '',
    notes: '',
  };

  const data = computed<z.input<TSchema>>(
    () => (props.isCreating ? initialCreateData : props.client) as z.input<TSchema>
  );

  function handleCancel() {
    emit('cancel');
  }

  // Auto-open dialog when a client is selected or when creating
  watch(
    () => props.client,
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
