import { describe, expect, it } from 'vitest';
import { sanitizeFilename } from '../../services/invoice-pdf.service.js';

describe('Service - Invoice PDF', () => {
  describe('sanitizeFilename', () => {
    it('should remove invalid Windows filename characters', () => {
      const result = sanitizeFilename('file<>name');
      expect(result).toBe('file__name');
    });

    it('should remove colon from filename', () => {
      const result = sanitizeFilename('2024:00:01');
      expect(result).toBe('2024_00_01');
    });

    it('should remove double quotes from filename', () => {
      const result = sanitizeFilename('"quoted"');
      expect(result).toBe('_quoted_');
    });

    it('should remove backslash from filename', () => {
      const result = sanitizeFilename('file\\name');
      expect(result).toBe('file_name');
    });

    it('should remove forward slash from filename', () => {
      const result = sanitizeFilename('path/name');
      expect(result).toBe('path_name');
    });

    it('should remove pipe from filename', () => {
      const result = sanitizeFilename('file|name');
      expect(result).toBe('file_name');
    });

    it('should remove asterisk from filename', () => {
      const result = sanitizeFilename('file*name');
      expect(result).toBe('file_name');
    });

    it('should remove question mark from filename', () => {
      const result = sanitizeFilename('file?name');
      expect(result).toBe('file_name');
    });

    it('should replace all invalid characters', () => {
      const result = sanitizeFilename('<>:"/\\|?*');
      expect(result).toBe('_________');
    });

    it('should return unchanged filename when no invalid characters', () => {
      const result = sanitizeFilename('2024-0001');
      expect(result).toBe('2024-0001');
    });

    it('should handle mixed valid and invalid characters', () => {
      const result = sanitizeFilename('invoice-2024-00:01.pdf');
      expect(result).toBe('invoice-2024-00_01.pdf');
    });

    it('should handle empty string', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('');
    });

    it('should handle string with only invalid characters', () => {
      const result = sanitizeFilename('<>');
      expect(result).toBe('__');
    });
  });
});
