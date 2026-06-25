import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnvHelper, projectRoot } from '../../helpers/env.helper.js';

describe('Helper - EnvHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the environment variable when it exists', () => {
    vi.spyOn(process, 'env', 'get').mockReturnValue({ TEST_VAR: 'test-value' } as NodeJS.ProcessEnv);
    const result = EnvHelper.getVariable('TEST_VAR');
    expect(result).toBe('test-value');
  });

  it('should return empty string as default when variable does not exist', () => {
    vi.spyOn(process, 'env', 'get').mockReturnValue({} as NodeJS.ProcessEnv);
    const result = EnvHelper.getVariable('NONEXISTENT');
    expect(result).toBe('');
  });

  it('should return provided default when variable does not exist', () => {
    vi.spyOn(process, 'env', 'get').mockReturnValue({} as NodeJS.ProcessEnv);
    const result = EnvHelper.getVariable('NONEXISTENT', 'default-value');
    expect(result).toBe('default-value');
  });

  it('should return empty string when env var exists but is empty', () => {
    vi.spyOn(process, 'env', 'get').mockReturnValue({ EMPTY_VAR: '' } as NodeJS.ProcessEnv);
    const result = EnvHelper.getVariable('EMPTY_VAR');
    expect(result).toBe('');
  });

  it('should resolve a project path', () => {
    const result = EnvHelper.resolveProjectPath('backend/data/chdev.db');
    expect(result).toContain('chdev.db');
  });
});

describe('Helper - projectRoot', () => {
  it('should be a string path', () => {
    expect(typeof projectRoot).toBe('string');
  });

  it('should end with the project root directory', () => {
    expect(projectRoot).toContain('chdev');
  });
});
