import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_TOKEN_FILE = path.resolve(__dirname, '..', '..', '.auth', 'token.json');

interface AuthToken {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Read the cached auth token from the file created by global.setup.ts.
 * Returns null if the file doesn't exist (global setup didn't run or failed).
 */
export function readAuthToken(): AuthToken | null {
  try {
    const data = fs.readFileSync(AUTH_TOKEN_FILE, 'utf-8');
    return JSON.parse(data) as AuthToken;
  } catch {
    return null;
  }
}
