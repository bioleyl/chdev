<template>
  <v-dialog
    max-width="600"
    persistent
    v-model="internalDialog"
  >
    <v-card v-if="prestation || isCreating">
      <v-card-title>
        <div class="text-h5 pa-3 pb-0">
          {{ isCreating ? 'Créer une prestation' : 'Modifier la prestation' }}
        </div>
      </v-card-title>

      <v-card-text>
        <prestation-form
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
  generic="TSchema extends import('zod').ZodType<CreatePrestationInput | UpdatePrestationInput>"
  lang="ts"
  setup
>
  import { computed, watch } from 'vue';
  import PrestationForm from './PrestationForm.vue';
  import type { CreatePrestationInput, Prestation, UpdatePrestationInput } from '@chdev/common';
  import type { z } from 'zod';

  const props = defineProps<{
    modelValue: boolean;
    prestation: z.input<TSchema> | null;
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

  const initialCreateData: CreatePrestationInput = {
    label: '',
    description: '',
    // @ts-expect-error
    unitPrice: undefined,
    unit: '',
  };

  const data = computed<z.input<TSchema>>(
    () => (props.isCreating ? initialCreateData : props.prestation) as z.input<TSchema>
  );

  function handleCancel() {
    emit('cancel');
  }

  // Auto-open dialog when a prestation is selected or when creating
  watch(
    () => props.prestation,
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
