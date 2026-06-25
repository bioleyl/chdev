<script
  generic="TSchema extends import('zod').ZodTypeAny"
  lang="ts"
  setup
>
  import { computed, ref } from 'vue';
  import { useZodForm } from '@/composables/useZodForm';
  import ConfirmDialog from './ConfirmDialog.vue';
  import type { z } from 'zod';

  const props = withDefaults(
    defineProps<{
      schema: TSchema;
      initialValues: z.input<TSchema>;
      isLoading?: boolean;
      actionName?: string;
      showCancelButton?: boolean;
      editing?: boolean;
      saveButtonTestId?: string;
      cancelButtonTestId?: string;
    }>(),
    {
      showCancelButton: true,
      actionName: 'Enregistrer',
      editing: false,
      saveButtonTestId: 'generic-form-save-button',
      cancelButtonTestId: 'generic-form-cancel-button',
    }
  );

  const emit = defineEmits<{
    (e: 'submit', value: z.output<TSchema>): void;
    (e: 'cancel'): void;
  }>();

  const modal = ref(false);

  const { form, errors, validate, reset, isDirty } = useZodForm<TSchema>(props.schema, props.initialValues);

  const isDisabled = computed(() => props.isLoading === true);

  function cancel() {
    if (isDirty.value && !modal.value) {
      modal.value = true;
      return;
    }
    reset();
    modal.value = false;
    emit('cancel');
  }

  function save() {
    if (props.isLoading) {
      return;
    }

    const result = validate();
    if (!result.success) {
      return;
    }

    emit('submit', result.data);
  }
</script>

<template>
  <div>
    <slot name="title" />

    <v-form>
      <slot
        :disabled="isDisabled"
        :editing="props.editing"
        :errors="errors"
        :form="form"
        :is-dirty="isDirty"
        :is-loading="isLoading"
        :readonly="props.isLoading || !props.editing"
      />
    </v-form>

    <div
      class="d-flex justify-space-between flex-shrink-0"
      v-if="props.editing"
    >
      <!-- EDIT MODE -->
      <v-btn
        variant="text"
        v-if="props.showCancelButton"
        :data-testid="props.cancelButtonTestId"
        :disabled="isLoading"
        @click="cancel"
      >
        Annuler
      </v-btn>

      <v-btn
        color="primary"
        :data-testid="props.saveButtonTestId"
        :disabled="!isDirty || isDisabled"
        @click="save"
      >
        {{ props.actionName }}
      </v-btn>
    </div>
  </div>
  <confirm-dialog
    text="Des changements ont été effectués. Voulez-vous vraiment quitter sans sauvegarder ?"
    title="Changements non sauvegardés"
    v-model:open="modal"
    @no="modal = false"
    @yes="cancel"
  />
</template>
