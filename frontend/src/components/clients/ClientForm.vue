<template>
  <generic-form
    :editing="props.editing"
    :initial-values="props.initialValues"
    :is-loading="props.isSubmitting"
    :schema="props.schema"
    @cancel="emit('cancel')"
    @submit="emit('submit', $event)"
  >
    <template #default="{ form, errors, disabled, readonly }">
      <v-row>
        <v-col cols="12">
          <v-text-field
            label="Nom de l'entreprise"
            v-model="form.companyName"
            :disabled="disabled"
            :error-messages="errors.companyName"
            :readonly="readonly"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Email"
            v-model="form.email"
            :disabled="disabled"
            :error-messages="errors.email"
            :readonly="readonly"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Téléphone"
            v-model="form.phone"
            :disabled="disabled"
            :error-messages="errors.phone"
            :readonly="readonly"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Adresse"
            v-model="form.address"
            :disabled="disabled"
            :error-messages="errors.address"
            :readonly="readonly"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-number-input
            label="Code postal"
            v-model="form.zipCode"
            :disabled="disabled"
            :error-messages="errors.zipCode"
            :readonly="readonly"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            label="Ville"
            v-model="form.city"
            :disabled="disabled"
            :error-messages="errors.city"
            :readonly="readonly"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            label="Pays"
            v-model="form.country"
            :disabled="disabled"
            :error-messages="errors.country"
            :readonly="readonly"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            label="Notes"
            v-model="form.notes"
            :disabled="disabled"
            :error-messages="errors.notes"
            :readonly="readonly"
          />
        </v-col>
      </v-row>
    </template>
  </generic-form>
</template>

<script
  generic="TSchema extends import('zod').ZodType<CreateClientInput | UpdateClientInput>"
  lang="ts"
  setup
>
  import GenericForm from '../common/GenericForm.vue';
  import type { CreateClientInput, UpdateClientInput } from '@chdev/common';
  import type { z } from 'zod';

  const props = defineProps<{
    schema: TSchema;
    initialValues: z.input<TSchema>;
    isSubmitting?: boolean;
    editing?: boolean;
  }>();

  const emit = defineEmits<{
    submit: [value: z.output<TSchema>];
    cancel: [];
  }>();
</script>
