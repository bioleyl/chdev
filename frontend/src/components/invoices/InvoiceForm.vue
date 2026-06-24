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
      <div
        class="d-flex justify-end mb-4"
        v-if="!isLineFormOpen"
      >
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateLineForm"
        >
          Ajouter une ligne
        </v-btn>
      </div>

      <v-slide-x-transition mode="out-in">
        <InvoiceLineTable
          key="table"
          v-if="!isLineFormOpen"
          :lines="lineItems"
          @delete="removeLine"
          @edit="openEditLineForm"
        />

        <InvoiceLineForm
          v-else
          :key="lineFormKey"
          :editing="editingLineIndex !== null"
          :initial-values="lineFormInitialValues"
          @cancel="closeLineForm"
          @save="saveLine"
        />
      </v-slide-x-transition>
    </v-window-item>
  </v-window>

  <div
    class="d-flex justify-space-between pa-4"
    v-if="tab === 'header'"
  >
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
  import { computed, ref } from 'vue';
  import ClientSelect from '@/components/clients/ClientSelect.vue';
  import InvoiceLineForm from '@/components/invoices/InvoiceLineForm.vue';
  import InvoiceLineTable from '@/components/invoices/InvoiceLineTable.vue';
  import { useZodForm } from '../../composables/useZodForm.js';
  import type { CreateInvoiceInput, CreateInvoiceLineInput, UpdateInvoiceInput } from '@chdev/common';
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
  const isLineFormOpen = ref<boolean>(false);
  const editingLineIndex = ref<number | null>(null);
  const lineFormKey = ref<number>(0);
  const lineFormInitialValues = ref<CreateInvoiceLineInput>(createEmptyLine());

  const isLoading = ref<boolean>(false);

  const lineItems = computed<Array<CreateInvoiceLineInput>>(() => {
    if (!Array.isArray(form.lines)) {
      return [];
    }

    return form.lines.map((line) => normalizeLine(line));
  });

  function createEmptyLine(): CreateInvoiceLineInput {
    return {
      prestationId: 0,
      quantity: 1,
      unitPrice: 0,
      description: '',
    };
  }

  function normalizeLine(
    line: CreateInvoiceLineInput & {
      prestation?: {
        label: string;
        description?: string;
      };
    }
  ): CreateInvoiceLineInput {
    return {
      prestationId: line.prestationId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      description: line.description || line.prestation?.description || line.prestation?.label || '',
    };
  }

  function ensureLineArray(): void {
    if (!Array.isArray(form.lines)) {
      form.lines = [];
    }
  }

  function openCreateLineForm(): void {
    editingLineIndex.value = null;
    lineFormInitialValues.value = createEmptyLine();
    lineFormKey.value += 1;
    isLineFormOpen.value = true;
  }

  function openEditLineForm(index: number): void {
    ensureLineArray();
    if (!form.lines) {
      return;
    }

    const existingLine = form.lines[index];
    if (!existingLine) {
      return;
    }

    editingLineIndex.value = index;
    lineFormInitialValues.value = normalizeLine(existingLine);
    lineFormKey.value += 1;
    isLineFormOpen.value = true;
  }

  function closeLineForm(): void {
    isLineFormOpen.value = false;
    editingLineIndex.value = null;
  }

  function saveLine(line: CreateInvoiceLineInput): void {
    ensureLineArray();
    if (!form.lines) {
      return;
    }

    if (editingLineIndex.value === null) {
      form.lines.push(line);
    } else {
      form.lines.splice(editingLineIndex.value, 1, line);
    }

    closeLineForm();
  }

  function removeLine(index: number): void {
    ensureLineArray();
    if (!form.lines) {
      return;
    }
    form.lines.splice(index, 1);
  }

  const onSubmit = async () => {
    const result = validate();
    if (!result.success) {
      const hasLineError = Object.keys(result.errors).some((key) => key.startsWith('lines'));
      if (hasLineError) {
        tab.value = 'lines';
      }
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
