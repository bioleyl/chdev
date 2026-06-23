<template>
  <v-tabs
    color="primary"
    v-model="tab"
  >
    <v-tab value="header">En-tête</v-tab>
    <v-tab value="lines">Lignes</v-tab>
  </v-tabs>

  <v-window v-model="tab">
    <v-window-item value="header">
      <v-form>
        <v-row>
          <v-col cols="12">
            <ClientSelect
              label="Client"
              v-model="form.clientId"
              :errors="errors.clientId"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-window-item>

    <v-window-item value="lines">
      <!-- TODO: Implement invoice lines -->
    </v-window-item>
  </v-window>

  <div class="d-flex justify-space-between pa-4">
    <v-btn
      variant="text"
      v-if="props.editing"
      :disabled="isLoading"
      @click="emit('cancel')"
    >
      Annuler
    </v-btn>

    <v-btn
      color="primary"
      :disabled="!isDirty || isLoading"
      @click="onSubmit"
    >
      Enregistrer
    </v-btn>
  </div>
</template>

<script
  generic="TSchema extends import('zod').ZodType<CreateInvoiceInput | UpdateInvoiceInput>"
  lang="ts"
  setup
>
  import { ref } from 'vue';
  import ClientSelect from '@/components/clients/ClientSelect.vue';
  import { useZodForm } from '../../composables/useZodForm.js';
  import type { CreateInvoiceInput, UpdateInvoiceInput } from '@chdev/common';
  import type { z } from 'zod';

  const props = defineProps<{
    schema: TSchema;
    initialValues: z.input<TSchema>;
    editing?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'submit', value: z.output<TSchema>): void;
    (e: 'cancel'): void;
  }>();

  const tab = ref<string>('header');
  const { form, errors, isDirty, validate } = useZodForm(props.schema, props.initialValues);

  const isLoading = ref<boolean>(false);

  const onSubmit = async () => {
    const result = validate();
    if (!result.success) {
      return;
    }

    isLoading.value = true;
    try {
      emit('submit', result.data);
    } finally {
      isLoading.value = false;
    }
  };
</script>
