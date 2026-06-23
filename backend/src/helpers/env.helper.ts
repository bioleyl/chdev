import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the project root (monorepo root) from the backend directory.
// Works on all platforms: Unix, macOS, and Windows.
export const projectRoot = resolve(__dirname, '../..');

export class EnvHelper {
  static getVariable(name: string, defaultValue: string = ''): string {
    return process.env[name] || defaultValue; // NOSONAR Nullish coalescing operator will not work here as process.env[name] can be an empty string
  }

  /**
   * Resolve a path relative to the project root, using platform-agnostic path separators.
   * This is critical for Windows compatibility where path separators differ.
   *
   * @example
   *   resolveProjectPath('backend/data/chdev.db')  →  'C:\\path\\to\\chdev\\backend\\data\\chdev.db'
   */
  static resolveProjectPath(relativePath: string): string {
    return resolve(projectRoot, relativePath);
  }
}
