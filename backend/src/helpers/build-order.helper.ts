/**
 * Converts a dot-notation sort key (e.g. `'client.companyName'`)
 * into a nested object that TypeORM understands: `{ client: { companyName: 'ASC' } }`.
 */
export function buildOrder(
  sortBy: string | undefined,
  sortDir: 'ASC' | 'DESC' = 'ASC'
): Record<string, unknown> | undefined {
  if (!sortBy) {
    return undefined;
  }

  const parts = sortBy.split('.');
  if (parts.length === 1) {
    return { [parts[0]]: sortDir };
  }

  // Build nested: 'client.companyName' → { client: { companyName: 'ASC' } }
  const nested: Record<string, unknown> = {};
  let current = nested;
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    if (isLast) {
      current[parts[i]] = sortDir;
    } else {
      current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
  }
  return nested;
}
