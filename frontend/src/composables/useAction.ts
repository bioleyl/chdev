import { ref } from 'vue';

export function useAction<TArgs extends Array<unknown>, TApiResult, TResult = TApiResult>(
  fn: (...args: TArgs) => Promise<TApiResult>,
  options?: {
    map?: (value: TApiResult) => TResult;
  }
) {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const data = ref<TResult | null>(null);

  const clearError = () => {
    error.value = null;
  };

  const action = async (...args: TArgs): Promise<TResult> => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fn(...args);
      const mapped = options?.map ? options.map(res) : (res as unknown as TResult);

      data.value = mapped;
      return mapped;
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    action,
    clearError,
    loading,
    error,
    data,
  };
}
