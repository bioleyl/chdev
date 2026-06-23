<template>
  <generic-form
    :editing="props.editing"
    :initial-values="props.initialValues"
    :is-loading="props.isSubmitting"
    :schema="props.schema"
    @submit="emit('submit', $event)"
  >
    <template #default="{ form, errors, disabled, readonly }">
      <v-row>
        <v-col cols="12">
          <v-text-field
            label="Name"
            v-model="form.label"
            :disabled="disabled"
            :error-messages="errors.label"
            :readonly="readonly"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Description"
            v-model="form.description"
            :disabled="disabled"
            :error-messages="errors.description"
            :readonly="readonly"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-number-input
            label="Unit Price"
            v-model="form.unitPrice"
            :disabled="disabled"
            :error-messages="errors.unitPrice"
            :readonly="readonly"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            label="Unit"
            v-model="form.unit"
            :disabled="disabled"
            :error-messages="errors.unit"
            :readonly="readonly"
          />
        </v-col>
      </v-row>
    </template>
  </generic-form>
</template>

<script
  generic="TSchema extends import('zod').ZodType<CreatePrestationInput | UpdatePrestationInput>"
  lang="ts"
  setup
>
  import GenericForm from '../common/GenericForm.vue';
  import type { CreatePrestationInput, UpdatePrestationInput } from '@chdev/common';
  import type { z } from 'zod';

  const props = defineProps<{
    schema: TSchema;
    initialValues: z.input<TSchema>;
    isSubmitting?: boolean;
    editing?: boolean;
  }>();

  const emit = defineEmits<(e: 'submit', value: z.output<TSchema>) => void>();
</script>
