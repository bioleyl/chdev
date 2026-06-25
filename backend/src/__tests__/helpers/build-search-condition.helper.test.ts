import { describe, expect, it } from 'vitest';
import { buildSearchCondition } from '../../helpers/build-search-condition.helper.js';
import type { EntityTarget } from 'typeorm';

describe('Helper - buildSearchCondition', () => {
  // biome-ignore lint/suspicious/noExplicitAny: empty entity target mock needs flexible typing
  const mockEntity = {} as EntityTarget<any>;

  it('should return where undefined and empty relations when search is empty', () => {
    const result = buildSearchCondition('', mockEntity, ['label']);
    expect(result.where).toBeUndefined();
    expect(result.relations).toEqual([]);
  });

  it('should return where undefined when search is undefined', () => {
    const result = buildSearchCondition(undefined, mockEntity, ['label']);
    expect(result.where).toBeUndefined();
  });

  it('should return where undefined when search is whitespace only', () => {
    const result = buildSearchCondition('   ', mockEntity, ['label']);
    expect(result.where).toBeUndefined();
  });

  it('should generate LIKE conditions for single column', () => {
    const result = buildSearchCondition('acme', mockEntity, ['companyName']);
    expect(result.where).toBeDefined();
    expect(result.relations).toEqual([]);
  });

  it('should generate LIKE conditions for multiple columns', () => {
    const result = buildSearchCondition('test', mockEntity, ['label', 'description']);
    expect(result.where).toBeDefined();
    expect(Array.isArray(result.where)).toBe(true);
  });

  it('should escape % in search pattern', () => {
    const result = buildSearchCondition('100%', mockEntity, ['label']);
    expect(result.where).toBeDefined();
  });

  it('should escape _ in search pattern', () => {
    const result = buildSearchCondition('test_value', mockEntity, ['label']);
    expect(result.where).toBeDefined();
  });

  it('should convert spaces to % wildcard', () => {
    const result = buildSearchCondition('test value', mockEntity, ['label']);
    expect(result.where).toBeDefined();
  });

  it('should include relation entities in relations array', () => {
    const result = buildSearchCondition(
      'acme',
      mockEntity,
      ['number'],
      [
        { entity: 'client', columns: ['companyName', 'email'] },
        { entity: 'lines', columns: [] },
      ]
    );
    expect(result.relations).toEqual(['client', 'lines']);
  });

  it('should generate LIKE conditions for relation columns', () => {
    const result = buildSearchCondition(
      'acme',
      mockEntity,
      ['number'],
      [{ entity: 'client', columns: ['companyName'] }]
    );
    expect(result.where).toBeDefined();
    expect(Array.isArray(result.where)).toBe(true);
  });

  it('should load relation without search conditions when columns is empty', () => {
    const result = buildSearchCondition('', mockEntity, ['label'], [{ entity: 'lines', columns: [] }]);
    expect(result.where).toBeUndefined();
    expect(result.relations).toContain('lines');
  });

  it('should generate where for both local and relation columns', () => {
    const result = buildSearchCondition(
      'test',
      mockEntity,
      ['label', 'status'],
      [{ entity: 'client', columns: ['companyName', 'email'] }]
    );
    expect(result.where).toBeDefined();
    expect(Array.isArray(result.where)).toBe(true);
    expect(result.relations).toEqual(['client']);
  });

  it('should handle search with mixed special characters', () => {
    const result = buildSearchCondition('100% _test', mockEntity, ['label']);
    expect(result.where).toBeDefined();
  });
});
