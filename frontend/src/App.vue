<script
  lang="ts"
  setup
>
  import AppBar from '@/components/common/AppBar.vue';
</script>

<template>
  <v-app>
    <AppBar />

    <v-main>
      <v-container
        class="pa-4"
        fluid
      >
        <router-view />
      </v-container>
    </v-main>

    <v-footer
      app
      class="bg-transparent py-2"
    >
      <span class="text-caption text-medium-emphasis">© {{ new Date().getFullYear() }} ChDev</span>
    </v-footer>
  </v-app>
</template>
