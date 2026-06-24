<template>
  <GenericDrawer
    title="Détails du client"
    v-model="internalDrawer"
    :details="details"
  >
    <template v-slot:actions>
      <v-btn
        color="primary"
        prepend-icon="mdi-file-document-plus"
        variant="tonal"
        v-if="props.client"
        @click="createInvoice"
      >
        Créer une facture
      </v-btn>
    </template>
  </GenericDrawer>
</template>

<script
  lang="ts"
  setup
>
  import { computed } from 'vue';
  import GenericDrawer from '../common/GenericDrawer.vue';
  import type { Client } from '@chdev/common';

  const props = defineProps<{
    modelValue: boolean;
    client: Client | null;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    cancel: [];
    createInvoice: [client: Client];
  }>();

  const internalDrawer = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  });

  const details = computed(() => {
    if (!props.client) {
      return [];
    }

    const items: Array<{ name: string; value: string | number; icon?: string }> = [
      {
        name: 'Raison sociale',
        value: props.client.companyName,
        icon: 'mdi-account',
      },
      {
        name: 'Email',
        value: props.client.email || '—',
        icon: 'mdi-email',
      },
      {
        name: 'Téléphone',
        value: props.client.phone || '—',
        icon: 'mdi-phone',
      },
      {
        name: 'Adresse',
        value:
          [props.client.address, `${props.client.zipCode} ${props.client.city}`, props.client.country]
            .filter(Boolean)
            .join(', ') || '—',
        icon: 'mdi-map-marker',
      },
    ];

    if (props.client.notes) {
      items.push({
        name: 'Notes',
        value: props.client.notes,
        icon: 'mdi-note',
      });
    }

    return items;
  });

  function createInvoice(): void {
    if (props.client) {
      emit('createInvoice', props.client);
    }
  }
</script>
