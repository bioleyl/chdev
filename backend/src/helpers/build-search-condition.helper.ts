import { Raw } from 'typeorm';
import type { EntityTarget, FindManyOptions, FindOptionsWhere } from 'typeorm';

/**
 * Configuration for searching on a relation's columns.
 *
 * Pass `columns: []` to load the relation without adding search conditions.
 */
export interface RelationSearchConfig {
  /** Name of the relation property on the entity (e.g. `'client'`, `'lines'`) */
  entity: string;
  /** Column names on the relation to search on. Empty array = load only. */
  columns: Array<string>;
}

/** Result of {@link buildSearchCondition}. */
export interface SearchConditionResult<Entity> {
  /** Array of OR'd `WHERE` conditions. `undefined` when no search filter applies. */
  where: FindManyOptions<Entity>['where'];
  /** Relation names that must be eager-loaded for the `WHERE` clauses to work. */
  relations: Array<string>;
}

/**
 * Builds a TypeORM `where` clause that matches the search string against
 * the specified columns using case-insensitive `LIKE` at the database level.
 * Supports searching on relation columns.
 *
 * @param search - The search string (may contain wildcards). If empty/undefined, returns `{ where: undefined, relations }`.
 * @param _entity - The TypeORM entity class (used for type inference of column names).
 * @param columns - Column names to search on, type-safe against the entity's keys.
 * @param relations - Optional relation search configs. Pass `columns: []` to load the relation
 *   without adding search conditions.
 *
 * @example
 * ```ts
 * // Search only on local columns
 * const { where, relations } = buildSearchCondition('acme', Example, ['name', 'description']);
 * repo.find({ where, relations, skip: 0, take: 10 });
 *
 * // Search on relation columns
 * const { where, relations } = buildSearchCondition(
 *   'acme',
 *   InvoiceEntity,
 *   ['number', 'status'],
 *   [
 *     { entity: 'client', columns: ['companyName', 'email', 'city'] },
 *     { entity: 'lines', columns: [] },  // load only
 *   ]
 * );
 * repo.find({ where, relations, skip: 0, take: 10 });
 * ```
 */
export function buildSearchCondition<Entity>(
  search: string | undefined,
  _entity: EntityTarget<Entity>,
  columns: Array<keyof Entity & string>,
  relations?: Array<RelationSearchConfig>
): SearchConditionResult<Entity> {
  const resultRelations = relations?.map((r) => r.entity) ?? [];

  if (!search?.trim()) {
    return { where: undefined, relations: resultRelations };
  }

  const pattern = `%${search.trim().replace(/[%_]/g, '\\$&').replace(/[ ]/g, '%')}%`;

  const options: Array<FindOptionsWhere<Entity>> = [];

  // Local columns
  for (const col of columns) {
    options.push({
      [col]: Raw((alias) => `${alias} LIKE :search ESCAPE '\\'`, {
        search: pattern,
      }),
    } as FindOptionsWhere<Entity>);
  }

  // Relation columns
  if (relations) {
    for (const rel of relations) {
      for (const col of rel.columns) {
        options.push({
          [rel.entity]: {
            [col]: Raw((alias) => `${alias} LIKE :search ESCAPE '\\'`, {
              search: pattern,
            }),
          },
        } as FindOptionsWhere<Entity>);
      }
    }
  }

  return {
    where: options.length > 0 ? options : undefined,
    relations: resultRelations,
  };
}
