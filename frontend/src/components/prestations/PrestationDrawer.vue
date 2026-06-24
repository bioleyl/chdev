<template>
  <GenericDrawer
    title="Détails de la prestation"
    v-model="internalDrawer"
    :details="details"
  />
</template>

<script
  lang="ts"
  setup
>
  import { computed } from 'vue';
  import GenericDrawer from '../common/GenericDrawer.vue';
  import type { Prestation } from '@chdev/common';

  const props = defineProps<{
    modelValue: boolean;
    prestation: Prestation | null;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

  const internalDrawer = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  });

  const details = computed(() => {
    if (!props.prestation) {
      return [];
    }

    const items: Array<{ name: string; value: string | number; icon?: string }> = [
      {
        name: 'Libellé',
        value: props.prestation.label,
        icon: 'mdi-tag',
      },
      {
        name: 'Prix unitaire',
        value: `${props.prestation.unitPrice.toFixed(2)} €`,
        icon: 'mdi-currency-usd',
      },
      {
        name: 'Unité',
        value: props.prestation.unit,
        icon: 'mdi-format-unit',
      },
      {
        name: 'Créée le',
        value: formatDate(props.prestation.createdAt),
        icon: 'mdi-clock-outline',
      },
    ];

    if (props.prestation.description) {
      items.splice(1, 0, {
        name: 'Description',
        value: props.prestation.description,
        icon: 'mdi-text',
      });
    }

    return items;
  });

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
</script>
