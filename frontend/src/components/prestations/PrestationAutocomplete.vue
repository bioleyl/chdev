<script
  lang="ts"
  setup
>
  import SearchAutocomplete from '@/components/common/SearchAutocomplete.vue';
  import { PrestationService } from '@/services/prestation.service.js';
  import type { Prestation } from '@chdev/common';

  const modelValue = defineModel<number | undefined>({ required: true });
  const { errors, label, readonly, disabled } = withDefaults(
    defineProps<{
      errors?: string | Array<string>;
      label: string;
      readonly?: boolean;
      disabled?: boolean;
    }>(),
    {
      readonly: false,
      disabled: false,
    }
  );

  function itemTitle(item: Prestation) {
    return item.label;
  }

  async function searchPrestations(search: string) {
    return PrestationService.getAllPaginated({
      search,
      page: 1,
      itemsPerPage: 10,
    });
  }
</script>

<template>
  <SearchAutocomplete
    item-value="id"
    v-model="modelValue"
    :disabled="disabled"
    :errors="errors"
    :fetch-by-id="PrestationService.getById"
    :item-title="itemTitle"
    :label="label"
    :readonly="readonly"
    :search="searchPrestations"
  />
</template>
