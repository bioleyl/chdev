# Architecture Electron — Guide détaillé

Cette page explique comment chaque fichier de l'workspace `electron/` fonctionne et interagit avec le reste du projet.

## Le processus principal (`main.ts`)

Le fichier `main.ts` est le **cœur** de l'application Electron. C'est le premier fichier exécuté — c'est lui qui crée la fenêtre et charge l'interface utilisateur.

**Fichier** : `electron/main.ts`

```typescript
import * as path from 'node:path';
import * as url from 'node:url';
import { app, BrowserWindow } from 'electron';

// Détermine si on est en mode développement ou production
const isDev = !app.isPackaged;

// Équivalent de __dirname avec les modules ES
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // En développement : charge le serveur Vite (localhost:5173)
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // En production : charge les fichiers compilés du frontend
    const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    mainWindow.loadURL(url.pathToFileURL(indexPath).href);
  }
}

// Quand Electron est prêt, crée la fenêtre
app.whenReady().then(() => {
  createWindow();

  // Sur macOS : recréer une fenêtre quand on clique sur l'icône
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sur Linux/Windows : quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  });
});
```

### Comprendre `createWindow()`

Cette fonction fait **trois choses** principales :

1. **Crée une `BrowserWindow`** : C'est une fenêtre native avec ses propres paramètres (taille, préférences de sécurité).
2. **Configure les `webPreferences`** : Ce sont les paramètres de sécurité et de fonctionnement du rendu.
3. **Charge le contenu** : Soit le serveur de développement Vite, soit les fichiers de production.

#### Les `webPreferences`

| Paramètre | Valeur | Signification |
|-----------|--------|---------------|
| `preload` | `preload.js` | Fichier exécuté AVANT le chargement du rendu (pont sécurisé) |
| `contextIsolation` | `true` | Isole le rendu du processus principal (sécurité) |
| `nodeIntegration` | `false` | Empêche le rendu d'utiliser Node.js directement (sécurité) |

> **Analogie WinDev** : `contextIsolation: true` ≈ fermer les portes de votre processus principal. Le rendu ne peut pas accéder directement aux variables globales ou aux fichiers du système. Il doit passer par un "intermédiaire" (le `preload`).

### Mode développement vs production

```
Mode développement                    Mode production
─────────────────                    ─────────────────
Electron → localhost:5173             Electron → fichiers dist/
(Vite dev server)                     (frontend compilé)
+ DevTools ouvert                     + Optimisé (minifié)
+ Hot reload activé                   + Plus rapide
```

En développement, `isDev` est `true`, donc Electron charge le serveur Vite et ouvre les DevTools. En production, `isDev` est `false`, et Electron charge directement les fichiers compilés du frontend.

## Le script de préchargement (`preload.ts`)

Le `preload.ts` est un **pont sécurisé** entre le processus principal et le processus de rendu. Il expose uniquement les fonctions que vous choisissez.

**Fichier** : `electron/preload.ts`

```typescript
import { contextBridge } from 'electron';

// Expose des APIs sécurisées au processus de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
```

### Pourquoi un `preload` ?

Quand `contextIsolation` est activé (`true`), le processus de rendu (votre Vue app) **ne peut pas** accéder directement à Node.js ni aux APIs Electron. Le `preload` est le seul moyen de passer des informations entre les deux.

```
main.ts (Processus principal)     preload.ts     renderer.ts (Processus de rendu)
         │                         │                      │
         │  exposeInMainWorld()    │                      │
         │────────────────────────►│                      │
         │                         │  electronAPI.xxx     │
         │                         │─────────────────────►│
```

> **Analogie WinDev** : Le `preload` ≈ une procédure partagée. Le processus principal définit ce qu'il "exporte", et le rendu peut appeler ces procédures sans avoir accès au reste.

Actuellement, le preload expose seulement `process.platform` (le système d'exploitation). Si vous avez besoin d'accéder au système de fichiers ou à d'autres fonctionnalités natives, vous ajoutez des méthodes ici.

## Le build config (`electron-builder.config.js`)

Ce fichier dit à `electron-builder` **comment créer les installateurs**.

**Fichier** : `electron/electron-builder.config.js`

```javascript
/** @type {import('electron-builder').Configuration} */
export default {
  appId: 'com.chdev.app',
  productName: 'ChDev',
  directories: {
    output: 'dist/release',
  },
  files: ['dist/**/*.js', 'dist/**/*.js.map', '!dist/**/*.map'],
  extraResources: [
    {
      from: '../frontend/dist',
      to: 'frontend/dist',
    },
  ],
  nodeGypRebuild: false,
  npmRebuild: false,
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'build',
    category: 'Utility',
  },
  deb: {
    packageCategory: 'Utility',
  },
  win: {
    target: ['nsis'],
    icon: 'build',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};
```

### Configuration expliquée

| Option | Valeur | Signification |
|--------|--------|---------------|
| `appId` | `'com.chdev.app'` | Identifiant unique de l'application |
| `productName` | `'ChDev'` | Nom affiché à l'utilisateur |
| `output` | `'dist/release'` | Où sont déposés les installateurs |
| `extraResources` | `../frontend/dist` | Copie les fichiers compilés du frontend dans le paquet |
| `linux.target` | `['AppImage', 'deb']` | Formats Linux |
| `win.target` | `['nsis']` | Format Windows (installateur graphique) |

#### `extraResources`

Cette option est **cruciale** : elle indique à `electron-builder` d'inclure les fichiers du frontend compilé (`frontend/dist`) dans le paquet final. Sans cela, l'application ne trouverait pas son interface.

```
Paquet final créé par electron-builder :
├── main.js              ← Processus principal (TS compilé)
├── preload.js           ← Pont sécurisé (TS compilé)
└── frontend/
    └── dist/            ← Votre application web compilée (Vite)
        ├── index.html
        ├── assets/
        └── ...
```

#### `nsis` — Configuration de l'installateur Windows

| Option | Valeur | Signification |
|--------|--------|---------------|
| `oneClick` | `false` | L'installateur montre des options (pas un clic unique) |
| `allowToChangeInstallationDirectory` | `true` | L'utilisateur peut choisir où installer |

## Le script de build (`scripts/package.mjs`)

Ce script gère une subtilité de `electron-builder` sous **WSL2** (environnement Linux pour Windows).

**Fichier** : `electron/scripts/package.mjs`

```javascript
import { execSync } from 'node:child_process';
import { existsSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const projectRoot = join(root, '..');

// WSL2 workaround: copy app-builder binary to the right location
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

// Run electron-builder
try {
  execSync('npx electron-builder --config electron-builder.config.js', {
    cwd: root,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('electron-builder failed');
  process.exit(1);
}
```

### Pourquoi ce workaround ?

Sous WSL2, le binaire `app-builder` (utilisé par `electron-builder` pour créer les paquets) se trouve dans un dossier différent de ce que `electron-builder` attend. Ce script le copie au bon endroit avant de lancer le build.

## Le fichier TypeScript (`tsconfig.json`)

**Fichier** : `electron/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "electron": ["../node_modules/electron"]
    },
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": ["main.ts", "preload.ts"],
  "exclude": ["dist", "node_modules"]
}
```

Ce fichier configure TypeScript pour compiler les fichiers Electron. La clé ici est `"outDir": "./dist"` — le résultat compilé va dans `electron/dist/`, et c'est ce dossier que `electron-builder` va empaqueter.

## Résumé

| Fichier | Rôle principal | Exécuté quand ? |
|---------|---------------|-----------------|
| `main.ts` | Crée la fenêtre, charge le frontend | Au lancement de l'app |
| `preload.ts` | Expose des APIs sécurisées au rendu | Au chargement de la fenêtre |
| `electron-builder.config.js` | Configuration des installateurs | Pendant le build (`npm run package`) |
| `scripts/package.mjs` | Build + workaround WSL2 | Pendant le build (`npm run package`) |
| `tsconfig.json` | Configuration TypeScript | À chaque `npm run build` |

## Prochaines étapes

- **[Builder et packaging](./packaging.md)** — Compiler et créer les installateurs pour Linux, Windows et macOS
