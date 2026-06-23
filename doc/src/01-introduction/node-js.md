# Node.js et npm

## Node.js — Exécuter du JavaScript en dehors du navigateur

En WinDev, votre code s'exécute dans l'environnement WinDev. Ici, le langage est **JavaScript** (ou TypeScript, son sur-ensemble typé), et **Node.js** est l'environnement qui permet de l'exécuter sur un serveur, en ligne de commande, ou dans un processus — pas seulement dans un navigateur.

> **Analogie WinDev** : Node.js ≈ l'environnement d'exécution WinDev. C'est le "moteur" qui fait tourner votre code.

### Qu'est-ce que Node.js permet de faire ?

- Créer des **serveurs HTTP** (comme notre backend Express)
- Lire/écrire des **fichiers** sur le disque
- Se connecter à des **bases de données**
- Exécuter des **scripts** en ligne de commande

## npm — Le gestionnaire de paquets

**npm** (Node Package Manager) est l'outil qui permet d'installer, de gérer et de partager des bibliothèques de code. C'est l'équivalent de l'**App Store** pour les développeurs JavaScript.

> **Analogie WinDev** : npm ≈ le catalogue de composants tiers / extensions WinDev, mais avec des millions de paquets open-source.

### `package.json` — La carte d'identité d'un projet

Chaque package a un fichier `package.json` qui décrit :

```json
{
  "name": "@chdev/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "typeorm": "^0.3.22"
  },
  "devDependencies": {
    "typescript": "^5.7.3",
    "tsx": "^4.19.2"
  }
}
```

| Champ | Rôle |
|-------|------|
| `name` | Nom unique du package |
| `version` | Version (format semver : MAJEUR.MINEUR.PATCH) |
| `private: true` | Empêche la publication accidentelle sur npm |
| `type: "module"` | Utilise les imports ES modules (`import ... from ...`) au lieu de `require()` |
| `scripts` | Commandes raccourcis exécutables via `npm run <nom>` |
| `dependencies` | Bibliothèques nécessaires en production |
| `devDependencies` | Bibliothèques nécessaires uniquement au développement (TypeScript, linters, etc.) |

### `node_modules/` — Les dépendances installées

Quand vous faites `npm install`, toutes les dépendances déclarées dans `package.json` sont téléchargées dans le dossier `node_modules/`. **Ce dossier est ignoré par Git** (il est dans `.gitignore`).

> **Règle importante** : Ne modifiez jamais manuellement les fichiers dans `node_modules/`. Ce dossier est régénéré à chaque `npm install`.

### `package-lock.json` — Verrouillage des versions

Ce fichier est généré automatiquement par npm. Il fige les versions exactes de toutes les dépendances (y compris les dépendances de dépendances). Cela garantit que tous les développeurs du projet utilisent exactement les mêmes versions.

> **Règle importante** : Ne modifiez jamais `package-lock.json` à la main. Committez-le toujours dans Git.

## Les scripts npm

Les scripts dans `package.json` sont des raccourcis pour des commandes :

```bash
# Exécuter un script
npm run dev

# À la racine du projet (monorepo)
npm run dev:api    # Lance le backend
npm run dev:web    # Lance le frontend
npm run dev        # Lance les deux en parallèle
```

## Ressources pour aller plus loin

- [Documentation officielle Node.js](https://nodejs.org/fr/docs/)
- [Documentation officielle npm](https://docs.npmjs.com/)
- [The Net Ninja — Node.js Tutorial (YouTube)](https://www.youtube.com/playlist?list=PL4cUxeGkcC9hH1bAj--JXmO5Q8HcOmUqm)
