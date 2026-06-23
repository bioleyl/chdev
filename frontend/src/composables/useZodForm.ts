import { computed, reactive, toRaw, watch } from 'vue';
import type { z } from 'zod';

export function useZodForm<TSchema extends z.ZodTypeAny>(schema: TSchema, initial: z.input<TSchema>) {
  const rawInitial = toRaw(initial);

  const original = structuredClone(rawInitial);

  const form = reactive(structuredClone(rawInitial));

  const errors = reactive<Record<string, string>>({}) as Record<string, string>;

  const isDirty = computed(() => {
    return !deepEqual(form, original);
  });

  function setupErrorReset() {
    for (const key in form) {
      watch(
        () => form[key],
        () => {
          if (errors[key]) {
            errors[key] = '';
          }
        }
      );
    }
  }

  function reset() {
    const fresh = structuredClone(original);

    for (const key in form) {
      form[key] = fresh[key];
    }

    clearErrors();
  }

  function clearErrors() {
    for (const key in errors) {
      errors[key] = '';
    }
  }

  function validate() {
    clearErrors();

    const result = schema.safeParse(form);

    if (result.success) {
      return {
        success: true as const,
        data: result.data, // fully typed z.output<TSchema>
        errors: {},
      };
    }

    const flat = toFlatErrors(result.error.issues);
    Object.assign(errors, flat);

    return {
      success: false as const,
      data: null,
      errors: flat,
    };
  }

  function validateField(field: keyof z.output<TSchema>) {
    const result = schema.safeParse(form);

    const issue = result.success ? undefined : result.error.issues.find((i) => i.path[0] === field);

    errors[field as string] = issue?.message ?? '';
  }

  function toFlatErrors(issue: Array<z.ZodIssue>) {
    const flat: Record<string, string> = {};

    for (const i of issue) {
      const path = i.path.join('.');
      if (!flat[path]) {
        flat[path] = i.message;
      }
    }

    return flat;
  }

  function deepEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  setupErrorReset();

  return {
    form,
    errors,
    validate,
    validateField,
    reset,
    isDirty,
  };
}
