<template>
  <v-navigation-drawer
    location="right"
    width="400"
    v-model="internalDrawer"
  >
    <v-card
      flat
      v-if="client"
    >
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">Détails du client</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDrawer"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-list dense>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-account"
                size="small"
              ></v-icon>
            </template>
            <v-list-item-title>Raison sociale</v-list-item-title>
            <template v-slot:append>
              <v-list-item-subtitle>{{ client.companyName }}</v-list-item-subtitle>
            </template>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-email"
                size="small"
              ></v-icon>
            </template>
            <v-list-item-title>Email</v-list-item-title>
            <template v-slot:append>
              <v-list-item-subtitle>{{ client.email || '—' }}</v-list-item-subtitle>
            </template>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-phone"
                size="small"
              ></v-icon>
            </template>
            <v-list-item-title>Téléphone</v-list-item-title>
            <template v-slot:append>
              <v-list-item-subtitle>{{ client.phone || '—' }}</v-list-item-subtitle>
            </template>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon
                icon="mdi-map-marker"
                size="small"
              ></v-icon>
            </template>
            <v-list-item-title>Adresse</v-list-item-title>
            <template v-slot:append>
              <v-list-item-subtitle>
                {{ [client.address, client.zipCode, client.city, client.country].filter(Boolean).join(', ') || '—' }}
              </v-list-item-subtitle>
            </template>
          </v-list-item>

          <v-list-item v-if="client.notes">
            <template v-slot:prepend>
              <v-icon
                icon="mdi-note"
                size="small"
              ></v-icon>
            </template>
            <v-list-item-title>Notes</v-list-item-title>
            <template v-slot:append>
              <v-list-item-subtitle>{{ client.notes }}</v-list-item-subtitle>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          color="primary"
          prepend-icon="mdi-file-document-plus"
          variant="tonal"
          @click="createInvoice"
        >
          Créer une facture
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script
  lang="ts"
  setup
>
  import { computed } from 'vue';
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

  function closeDrawer(): void {
    emit('update:modelValue', false);
  }

  function createInvoice(): void {
    if (props.client) {
      emit('createInvoice', props.client);
    }
  }
</script>
