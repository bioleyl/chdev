import { execSync } from 'node:child_process';
import { existsSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const projectRoot = join(root, '..');

// WSL2 workaround: ensure app-builder-bin binary exists in builder-util's node_modules
const binSrc = join(projectRoot, 'node_modules', 'app-builder-bin', 'linux', 'x64', 'app-builder');
const binDestDir = join(projectRoot, 'node_modules', 'builder-util', 'node_modules', 'app-builder-bin', 'linux', 'x64');
const binDest = join(binDestDir, 'app-builder');

if (existsSync(binSrc)) {
  mkdirSync(binDestDir, { recursive: true });
  cpSync(binSrc, binDest, { force: true });
  console.log('Copied app-builder binary for WSL2 compatibility');
} else {
  console.error('app-builder-bin not found, run: npm install --ignore-scripts');
  process.exit(1);
}

// Run electron-builder from the installed package
try {
  execSync('npx electron-builder --config electron-builder.config.js', {
    cwd: root,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('electron-builder failed');
  process.exit(1);
}
