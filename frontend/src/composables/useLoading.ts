import { ref } from 'vue';

export function useLoading() {
  const isLoading = ref(false);

  async function withLoading<T>(promise: Promise<T>): Promise<T> {
    isLoading.value = true;
    try {
      return await promise;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    withLoading,
  };
}
