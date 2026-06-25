import { describe, expect, it } from 'vitest';
import { buildOrder } from '../../helpers/build-order.helper.js';

describe('Helper - buildOrder', () => {
  it('should return undefined when sortBy is undefined', () => {
    const result = buildOrder(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined when sortBy is empty string', () => {
    const result = buildOrder('');
    expect(result).toBeUndefined();
  });

  it('should return simple order object for single column', () => {
    const result = buildOrder('label', 'ASC');
    expect(result).toEqual({ label: 'ASC' });
  });

  it('should return simple order object with DESC direction', () => {
    const result = buildOrder('label', 'DESC');
    expect(result).toEqual({ label: 'DESC' });
  });

  it('should default to ASC when sortDir is not provided', () => {
    const result = buildOrder('label');
    expect(result).toEqual({ label: 'ASC' });
  });

  it('should build nested object for two-level dot notation', () => {
    const result = buildOrder('client.companyName', 'ASC');
    expect(result).toEqual({ client: { companyName: 'ASC' } });
  });

  it('should build nested object for two-level dot notation with DESC', () => {
    const result = buildOrder('client.companyName', 'DESC');
    expect(result).toEqual({ client: { companyName: 'DESC' } });
  });

  it('should build nested object for three-level dot notation', () => {
    const result = buildOrder('client.address.city', 'ASC');
    expect(result).toEqual({ client: { address: { city: 'ASC' } } });
  });

  it('should build nested object for three-level dot notation with DESC', () => {
    const result = buildOrder('client.address.city', 'DESC');
    expect(result).toEqual({ client: { address: { city: 'DESC' } } });
  });

  it('should handle single part sort with multiple columns', () => {
    const result1 = buildOrder('label', 'ASC');
    const result2 = buildOrder('createdAt', 'DESC');
    expect(result1).toEqual({ label: 'ASC' });
    expect(result2).toEqual({ createdAt: 'DESC' });
  });
});
