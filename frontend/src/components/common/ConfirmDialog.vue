<script
  lang="ts"
  setup
>
  const open = defineModel<boolean>('open', {
    default: false,
  });

  defineProps<{
    text: string;
    title?: string;
  }>();

  const emit = defineEmits<{
    (e: 'yes'): void;
    (e: 'no'): void;
  }>();
</script>

<template>
  <v-dialog v-model="open">
    <v-card
      class="pa-4"
      max-width="500"
      :text="text"
      :title="title"
    >
      <template v-slot:actions>
        <v-btn
          text
          @click="emit('no')"
          >Non</v-btn
        >
        <v-btn
          color="primary"
          @click="emit('yes')"
          >Oui</v-btn
        >
      </template>
    </v-card>
  </v-dialog>
</template>
