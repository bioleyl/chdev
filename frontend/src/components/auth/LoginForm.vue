<template>
  <generic-form
    action-name="Login"
    :editing="true"
    :initial-values="props.initialValues"
    :is-loading="props.isSubmitting"
    :save-button-test-id="'login-submit-button'"
    :schema="loginSchema"
    :show-cancel-button="false"
    @submit="emit('submit', $event)"
  >
    <template #default="{ form, errors, disabled }">
      <v-text-field
        data-testid="login-email-field"
        label="Email"
        name="email"
        prepend-icon="mdi-account"
        v-model="form.email"
        :disabled="disabled"
        :error-messages="errors.email"
      />
      <v-text-field
        data-testid="login-password-field"
        label="Password"
        name="password"
        prepend-icon="mdi-lock"
        type="password"
        v-model="form.password"
        :disabled="disabled"
        :error-messages="errors.password"
      />
    </template>
  </generic-form>
</template>

<script
  lang="ts"
  setup
>
  import { loginSchema } from '@chdev/common';
  import GenericForm from '../common/GenericForm.vue';
  import type { LoginInput } from '@chdev/common';

  const props = defineProps<{
    initialValues: LoginInput;
    isSubmitting: boolean;
  }>();

  const emit = defineEmits<(e: 'submit', value: LoginInput) => void>();
</script>
