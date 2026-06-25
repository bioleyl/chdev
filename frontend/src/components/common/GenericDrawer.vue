<template>
  <v-navigation-drawer
    v-model="internalModel"
    :data-testid="props.dataTestId"
    :location="location"
    :width="width"
  >
    <v-card flat>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDrawer"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-list
          dense
          v-if="props.details.length > 0"
        >
          <v-list-item
            class="detail-item"
            v-for="(item, index) in props.details"
            :key="`${item.name}-${index}`"
          >
            <template
              v-if="item.icon"
              v-slot:prepend
            >
              <v-icon
                size="small"
                :icon="item.icon"
              ></v-icon>
            </template>
            <div class="detail-row">
              <span class="detail-label">{{ item.name }}</span>
              <span class="detail-value">{{ item.value }}</span>
            </div>
          </v-list-item>
        </v-list>

        <slot v-else />
      </v-card-text>

      <template v-if="hasActions">
        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <slot name="actions" />
        </v-card-actions>
      </template>
    </v-card>
  </v-navigation-drawer>
</template>

<script
  lang="ts"
  setup
>
  import { computed, useSlots } from 'vue';

  type DrawerDetailItem = {
    name: string;
    value: string | number;
    icon?: string;
  };

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      title: string;
      details?: Array<DrawerDetailItem>;
      width?: number | string;
      location?: 'left' | 'right' | 'top' | 'bottom';
      dataTestId?: string;
    }>(),
    {
      details: () => [],
      width: 400,
      location: 'right',
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

  const slots = useSlots();

  const internalModel = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  });

  const hasActions = computed(() => slots.actions !== undefined);

  function closeDrawer(): void {
    emit('update:modelValue', false);
  }
</script>

<style scoped>
  .detail-item {
    align-items: flex-start;
  }

  .detail-row {
    display: flex;
    width: 100%;
    gap: 12px;
    align-items: flex-start;
  }

  .detail-label {
    flex: 0 0 120px;
    min-width: 120px;
    white-space: nowrap;
    align-self: center;
  }

  .detail-value {
    align-self: center;
    flex: 1 1 auto;
    min-width: 0;
    display: block;
    text-align: right;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.35;
  }

  @media (max-width: 420px) {
    .detail-label {
      flex-basis: 96px;
      min-width: 96px;
    }
  }
</style>
