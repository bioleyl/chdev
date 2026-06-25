import { describe, expect, it, vi } from 'vitest';
import { buildTableLayout, computeRowHeight } from '../../helpers/pdf-table.helper.js';

describe('Helper - PDF Table', () => {
  const mockColumns = [
    { label: 'Name', align: 'left' as const, width: 0.5 },
    { label: 'Price', align: 'right' as const, width: 0.5 },
  ];

  it('should compute column positions and widths', () => {
    const mockDoc = {
      page: { width: 612 },
    };

    // biome-ignore lint/suspicious/noExplicitAny: mock doc doesn't match PDF document type
    const layout = buildTableLayout(mockDoc as any, 100, mockColumns);

    expect(layout.x).toHaveLength(2);
    expect(layout.w).toHaveLength(2);
    expect(layout.align).toEqual(['left', 'right']);
    expect(layout.contentW).toBeGreaterThan(0);
    expect(layout.headerY).toBe(100);
  });

  it('should handle single column layout', () => {
    const mockDoc = {
      page: { width: 612 },
    };

    // biome-ignore lint/suspicious/noExplicitAny: mock doc doesn't match PDF document type
    const layout = buildTableLayout(mockDoc as any, 50, [{ label: 'Single', align: 'left' as const, width: 1.0 }]);

    expect(layout.x).toHaveLength(1);
    expect(layout.w).toHaveLength(1);
    expect(layout.headerY).toBe(50);
  });

  it('should handle three column layout', () => {
    const mockDoc = {
      page: { width: 612 },
    };

    // biome-ignore lint/suspicious/noExplicitAny: mock doc doesn't match PDF document type
    const layout = buildTableLayout(mockDoc as any, 80, [
      { label: 'A', align: 'left' as const, width: 0.3 },
      { label: 'B', align: 'center' as const, width: 0.4 },
      { label: 'C', align: 'right' as const, width: 0.3 },
    ]);

    expect(layout.x).toHaveLength(3);
    expect(layout.w).toHaveLength(3);
    expect(layout.align).toEqual(['left', 'center', 'right']);
  });

  it('should compute row height based on text', () => {
    const mockDoc = {
      heightOfString: vi.fn().mockReturnValue(15),
    };

    // biome-ignore lint/suspicious/noExplicitAny: mock doc doesn't match PDF document type
    const height = computeRowHeight(mockDoc as any, 'Test text', 200);

    expect(height).toBe(26); // clamped to minimum
  });

  it('should return minimum height of 26 when text height is small', () => {
    const mockDoc = {
      heightOfString: vi.fn().mockReturnValue(5),
    };

    // biome-ignore lint/suspicious/noExplicitAny: mock doc doesn't match PDF document type
    const height = computeRowHeight(mockDoc as any, 'A', 200);

    expect(height).toBe(26);
  });

  it('should handle empty text for row height', () => {
    const mockDoc = {
      heightOfString: vi.fn().mockReturnValue(0),
    };

    // biome-ignore lint/suspicious/noExplicitAny: mock doc doesn't match PDF document type
    const height = computeRowHeight(mockDoc as any, '', 200);

    expect(height).toBe(26); // minimum
  });
});
