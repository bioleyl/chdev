<script
  lang="ts"
  setup
>
  import SearchAutocomplete from '@/components/common/SearchAutocomplete.vue';
  import { ClientService } from '@/services/client.service.js';
  import type { Client } from '@chdev/common';

  const modelValue = defineModel<number | undefined>({ required: true });

  const props = withDefaults(
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

  function itemTitle(item: Client) {
    return item.companyName;
  }

  async function searchClients(search: string) {
    return ClientService.getAllPaginated({
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
    :disabled="props.disabled"
    :errors="props.errors"
    :fetch-by-id="ClientService.getById"
    :item-title="itemTitle"
    :label="props.label"
    :readonly="props.readonly"
    :search="searchClients"
  />
</template>
