type RemoveUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};

/**
 *  Removes undefined properties from an object.
 *  This is useful for cleaning up objects before sending them to an API or storing them in a database.
 *  It ensures that only defined properties are included in the resulting object.
 *
 * @template T - The type of the input object.
 * @param obj - The object to be cleaned.
 * @returns A new object with all undefined properties removed.
 */
export const cleanObject = <T extends object>(obj: T): RemoveUndefined<T> => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => !!value)) as RemoveUndefined<T>;
};
