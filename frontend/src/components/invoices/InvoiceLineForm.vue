<template>
  <v-card>
    <v-card-title>
      {{ props.editing ? 'Modifier une ligne' : 'Ajouter une ligne' }}
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12">
          <PrestationAutocomplete
            label="Prestation"
            :errors="prestationErrors"
            :model-value="form.prestationId || undefined"
            @update:model-value="onPrestationSelected"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            label="Description"
            v-model="form.description"
            :error-messages="errors.description"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-number-input
            label="Quantite"
            v-model="form.quantity"
            :error-messages="errors.quantity"
          />
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-number-input
            label="Prix unitaire"
            v-model="form.unitPrice"
            :error-messages="errors.unitPrice"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="d-flex justify-space-between">
      <v-btn
        variant="text"
        @click="emit('cancel')"
      >
        Annuler
      </v-btn>

      <v-btn
        color="primary"
        :disabled="!isDirty || isLoading"
        @click="onSave"
      >
        {{ props.editing ? 'Mettre a jour' : 'Ajouter la ligne' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script
  lang="ts"
  setup
>
  import { createInvoiceLineSchema } from '@chdev/common';
  import { computed } from 'vue';
  import PrestationAutocomplete from '@/components/prestations/PrestationAutocomplete.vue';
  import { useLoading } from '@/composables/useLoading';
  import { useZodForm } from '@/composables/useZodForm';
  import { PrestationService } from '@/services/prestation.service.js';
  import type { CreateInvoiceLineInput } from '@chdev/common';

  const props = withDefaults(
    defineProps<{
      initialValues: CreateInvoiceLineInput;
      editing?: boolean;
    }>(),
    {
      editing: false,
    }
  );

  const emit = defineEmits<{
    (e: 'save', value: CreateInvoiceLineInput): void;
    (e: 'cancel'): void;
  }>();

  const { isLoading, withLoading } = useLoading();
  const { form, errors, isDirty, validate, validateField } = useZodForm(
    createInvoiceLineSchema,
    props.initialValues
  );

  const prestationErrors = computed<Array<string>>(() => {
    if (!errors.prestationId) {
      return [];
    }

    return [errors.prestationId];
  });

  async function onPrestationSelected(prestationId: number | undefined): Promise<void> {
    form.prestationId = prestationId ?? 0;
    validateField('prestationId');

    if (!prestationId) {
      return;
    }

    const prestation = await withLoading(PrestationService.getById(prestationId));
    form.unitPrice = prestation.unitPrice;
    form.description = prestation.description || prestation.label;
  }

  function onSave() {
    const result = validate();
    if (!result.success) {
      return;
    }

    emit('save', result.data);
  }
</script>
