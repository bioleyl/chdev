<template>
  <div class="wrapper">
    <img
      alt="Logo"
      class="mx-auto mb-4"
      src="/image.png"
      style="max-width: 200px;"
    >
    <v-card
      class="elevation-12"
      style="max-width: 400px; width: 100%;"
    >
      <v-toolbar
        color="primary"
        dark
        flat
      >
        <v-toolbar-title>Login</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <LoginForm
          :initial-values="defaultLoginInput()"
          :is-submitting="login.loading.value"
          @submit="onLoginSubmit"
        />
        <v-alert
          class="mt-4"
          type="error"
          v-if="login.error.value"
        >
          {{ login.error.value }}
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script
  lang="ts"
  setup
>
  import { useRouter } from 'vue-router';
  import LoginForm from '@/components/auth/LoginForm.vue';
  import { useLoginForm } from '@/composables/useLoginForm';
  import { AuthService } from '../services/auth.service';
  import type { LoginInput } from '@chdev/common';

  const router = useRouter();
  const { defaultLoginInput, login } = useLoginForm();

  const onLoginSubmit = async (values: LoginInput) => {
    try {
      const result = await login.action(values);
      if (result) {
        await router.push({ name: 'invoices' });
      }
    } catch (error) {
      console.error('Login failed:', error);
      return;
    }
  };
</script>

<style scoped>
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    min-height: 100vh;
    position: absolute;
    margin: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
