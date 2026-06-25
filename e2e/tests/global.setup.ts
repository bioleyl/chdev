import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_DIR = path.resolve(__dirname, '..', '.auth');
const AUTH_TOKEN_FILE = path.join(AUTH_DIR, 'token.json');

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';

export default async function main(): Promise<void> {
  const api = await request.newContext({ baseURL: 'http://localhost:3000' });

  try {
    const response = await api.post('/api/auth/login', {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });

    if (response.status() !== 200) {
      throw new Error(`Login failed with status ${response.status()}: ${await response.text()}`);
    }

    const body = (await response.json()) as { token: string; user: { id: number; email: string; role: string } };

    // Ensure auth directory exists
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    // Save token to file for test files to read
    fs.writeFileSync(AUTH_TOKEN_FILE, JSON.stringify(body, null, 2));
    console.log('[e2e] Auth token saved successfully');
  } finally {
    await api.dispose();
  }
}

main().catch((err) => {
  console.error('[e2e] Auth setup failed:', err.message);
  process.exit(1);
});
