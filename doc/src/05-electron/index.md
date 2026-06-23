# Electron — Vue d'ensemble

## Qu'est-ce qu'Electron ?

Electron est un framework qui permet de créer des **applications de bureau** (desktop) avec des technologies web (HTML, CSS, JavaScript). Il combine **Chromium** (le moteur du navigateur Google Chrome) et **Node.js** (l'environnement d'exécution JavaScript côté serveur) dans une seule application.

> **Analogie WinDev** : Electron ≈ transformer votre page web WinDev en un exécutable `.exe` ou `.deb`. Mais au lieu de se limiter à du 4D, Electron utilise des pages web complètes avec JavaScript pour toute la logique.

En pratique, Electron encapsule votre application web (celle que vous voyez dans le navigateur) dans une fenêtre native de bureau. L'utilisateur final ne voit pas son navigateur — il voit une fenêtre d'application avec un menu, une barre de titre, et les boutons minimiser/agrander/fermer.

### Pourquoi Electron ?

| Avantage | Explication |
|----------|-------------|
| **Une seule codebase** | Le même frontend (Vue 3 + Vuetify) fonctionne dans le navigateur ET en application de bureau |
| **Accès aux fonctionnalités natives** | Fichiers du système, notifications, barre des tâches — via Node.js |
| **Multiplateforme** | Un seul build produit des installateurs pour Linux (AppImage, deb), Windows (NSIS), et macOS |
| **Communauté massive** | VSCode, Slack, Discord, Figma — tous sont des applications Electron |

### Comment ça fonctionne — Architecture Electron

```
┌─────────────────────────────────────────────────────────┐
│                    Fenêtre de l'application              │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Chromium (Render Process)             │  │
│  │   Vue 3 + Vuetify + HTML + CSS                    │  │
│  │   C'est VOTRE frontend qui tourne dans le navigateur│  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │ IPC (Communication)           │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │          Node.js (Main Process)                    │  │
│  │   main.ts — crée la fenêtre, gère le cycle de vie  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

Electron fonctionne avec **deux processus** :

1. **Le processus principal (`main`)** : C'est le "chef d'orchestre". Il crée les fenêtres, gère le cycle de vie de l'application et a accès au système de fichiers via Node.js.
2. **Le processus de rendu (`renderer`)** : C'est votre application web (Vue 3 + Vuetify) qui s'exécute dans un moteur Chromium. C'est ce que l'utilisateur voit et interagit.

> **Analogie WinDev** : Le processus principal ≈ le code logique de votre application WinDev (les procédures, les événements). Le processus de rendu ≈ l'affichage de vos formulaires et pages web.

## Electron dans CHDev

Dans le projet CHDev, Electron sert à transformer l'application web (qui tourne dans un navigateur) en une **application de bureau installable**. Le frontend Vue 3/Vuetify n'est **pas modifié** — il est exactement le même code.

```
chdev/
├── frontend/        ← Même code, utilisé dans le navigateur ET dans Electron
├── electron/        ← Couche desktop (main.ts, preload.ts, configuration)
└── package.json     ← workspace: "electron"
```

### Les fichiers de l'workspace Electron

| Fichier | Rôle |
|---------|------|
| `main.ts` | Processus principal — crée la fenêtre, charge le frontend |
| `preload.ts` | Pont sécurisé entre le processus principal et le rendu |
| `electron-builder.config.js` | Configuration des installateurs (deb, AppImage, NSIS) |
| `tsconfig.json` | Configuration TypeScript pour les fichiers Electron |
| `package.json` | Dépendances (electron, electron-builder) et scripts |
| `scripts/package.mjs` | Script de build avec correction WSL2 |

## Démarrer Electron

```bash
# Mode développement (charge le dev server Vite sur localhost:5173)
npm --workspace electron run dev

# Compiler TypeScript
npm --workspace electron run build

# Lancer l'application打包ée
npm --workspace electron run start

# Créer les installateurs
npm --workspace electron run package
```

> 💡 **Conseil** : En développement, Electron charge le frontend via `http://localhost:5173` (le serveur Vite). Cela signifie que vous pouvez modifier le frontend et voir les changements en temps réel dans la fenêtre Electron — exactement comme dans un navigateur.

## Prochaines étapes

- **[Architecture Electron](./architecture.md)** — Comprendre les fichiers `main.ts`, `preload.ts` et la communication IPC
- **[Builder et packaging](./packaging.md)** — Compiler et créer les installateurs pour Linux, Windows et macOS
