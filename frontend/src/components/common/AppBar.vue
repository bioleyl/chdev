<script
  lang="ts"
  setup
>
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { AuthService } from '@/services/auth.service';
  import type { Role } from '@chdev/common';

  const router = useRouter();
  const route = useRoute();

  const auth = ref<{
    isAuthenticated: () => boolean;
    user: { email: string; role: string } | null;
    hasPermission: (role: Role) => boolean;
  } | null>(null);

  watch(
    () => AuthService.isLoggedIn.value,
    () => {
      nextTick(() => {
        updateAuth();
      });
    }
  );

  function updateAuth() {
    auth.value = {
      isAuthenticated: AuthService.isAuthenticated,
      user: AuthService.getUser(),
      hasPermission: AuthService.hasPermission.bind(AuthService),
    };
  }

  function logout() {
    AuthService.logout();
    router.push({ name: 'login' });
  }

  onMounted(() => {
    updateAuth();
  });
</script>

<template>
  <v-app-bar
    color="primary"
    density="compact"
    v-if="route.name !== 'login' && auth"
  >
    <v-app-bar-title>
      <router-link
        style="text-decoration: none; color: inherit"
        to="/"
        >ChDev</router-link
      >
    </v-app-bar-title>
    <v-spacer />
    <v-btn
      to="/invoices"
      variant="text"
      v-if="auth.hasPermission('VIEWER')"
      >Invoices</v-btn
    >
    <v-btn
      to="/prestations"
      variant="text"
      v-if="auth.hasPermission('VIEWER')"
      >Prestations</v-btn
    >
    <v-btn
      to="/clients"
      variant="text"
      v-if="auth.hasPermission('VIEWER')"
      >Clients</v-btn
    >

    <template v-if="auth.isAuthenticated()">
      <v-divider
        class="mx-2"
        vertical
      />
      <v-chip
        color="surface"
        size="small"
        variant="outlined"
      >
        {{ auth.user?.role }}
      </v-chip>
      <span class="text-body-2 mx-2">{{ auth.user?.email }}</span>
      <v-btn
        size="small"
        variant="text"
        @click="logout"
        >Logout</v-btn
      >
    </template>
  </v-app-bar>
</template>
