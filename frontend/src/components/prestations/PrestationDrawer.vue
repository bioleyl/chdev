<template>
  <v-navigation-drawer
    location="right"
    width="500"
    v-model="isOpen"
  >
    <v-card
      flat
      full-height
      v-if="selectedPrestation"
    >
      <v-card-title>
        <h3>Détails de la prestation</h3>
      </v-card-title>
      <v-card-text>
        <prestation-form
          :editing="false"
          :initial-values="selectedPrestation"
          :schema="createPrestationSchema"
        />
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script
  lang="ts"
  setup
>
  import { createPrestationSchema } from '@chdev/common';
  import { watch } from 'vue';
  import PrestationForm from './PrestationForm.vue';
  import type { Prestation } from '@chdev/common';

  const selectedPrestation = defineModel<Prestation | null>('prestation');
  const isOpen = defineModel<boolean>('isOpen', { required: true });

  watch(isOpen, (newValue) => {
    if (!newValue) {
      selectedPrestation.value = null;
    }
  });
</script>
