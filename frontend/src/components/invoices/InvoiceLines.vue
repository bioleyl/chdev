<template>
  <div>
    <h3>Invoice Lines</h3>
    <div
      class="line-item"
      v-for="(line, index) in formData.lines"
      :key="index"
    >
      <PrestationAutocomplete
        label="Prestation"
        :errors="lineErrors[index].prestationId"
        :model-value="line.prestationId"
        @update:model-value="onPrestationSelected(index, $event)"
      />
      <v-number-input
        label="Quantity"
        v-model.number="line.quantity"
        :error-messages="lineErrors[index].quantity"
      />
      <v-number-input
        label="Price"
        v-model.number="line.unitPrice"
        :error-messages="lineErrors[index].unitPrice"
      />
      <v-btn
        icon
        @click="removeLine(index)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
    <v-btn @click="addLine">Add Line</v-btn>
  </div>
</template>

<script
  lang="ts"
  setup
>
  import { computed } from 'vue';
  import PrestationAutocomplete from '@/components/prestations/PrestationAutocomplete.vue';
  import { PrestationService } from '@/services/prestation.service';
  import type { CreateInvoiceInput } from '@chdev/common';

  const props = defineProps<{
    formData: CreateInvoiceInput;
    errors: Record<string, string | undefined>;
  }>();

  const lineErrors = computed(() =>
    props.formData.lines.map((_, index) => ({
      prestationId: props.errors[`lines.${index}.prestationId`],
      quantity: props.errors[`lines.${index}.quantity`],
      unitPrice: props.errors[`lines.${index}.unitPrice`],
    }))
  );

  function addLine() {
    if (!props.formData.lines) {
      props.formData.lines = [];
    }
    props.formData.lines.push({ prestationId: 0, quantity: 1, unitPrice: 0 });
  }

  function removeLine(index: number) {
    props.formData.lines.splice(index, 1);
  }

  async function onPrestationSelected(index: number, prestationId: number | undefined) {
    const line = props.formData.lines[index];
    if (!line || !prestationId) {
      line.unitPrice = 0;
      return;
    }

    line.prestationId = prestationId;
    const prestation = await PrestationService.getById(prestationId);
    if (prestation) {
      line.unitPrice = prestation.unitPrice;
    }
  }
</script>

<style scoped>
  .line-item {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;
  }
</style>
