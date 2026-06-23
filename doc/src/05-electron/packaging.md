# Builder et packaging — Guide pas-à-pas

Ce guide vous montre comment compiler TypeScript et créer les installateurs de l'application de bureau CHDev.

## Comprendre le cycle de build

Avant de lancer les commandes, voici le flux complet :

```
Code source (TS) → TypeScript compile → Fichiers JS (dist/)
                                        → electron-builder → Installateurs
```

Il y a **deux étapes** :

1. **Compilation TypeScript** : Les fichiers `.ts` sont transformés en `.js` par TypeScript
2. **Empaquetage** : `electron-builder` rassemble les fichiers JS, le frontend compilé, et crée les installateurs

## Étape 1 — Compiler le frontend

L'application Electron utilise le frontend Vue 3. Il faut d'abord le compiler pour la production.

**Fichier** : `frontend/`

```bash
npm --workspace frontend run build
```

Cela crée le dossier `frontend/dist/` contenant les fichiers HTML, CSS et JavaScript optimisés pour la production (minifiés).

> 💡 **Conseil** : Cette étape est la même que celle que vous feriez pour déployer l'application web dans un navigateur. Le même code, le même build.

## Étape 2 — Compiler les fichiers Electron

Ensuite, on compile les fichiers TypeScript d'Electron (`main.ts` et `preload.ts`).

**Fichier** : `electron/`

```bash
npm --workspace electron run build
```

Cela crée le dossier `electron/dist/` :

```
electron/dist/
├── main.js           ← Processus principal compilé
├── main.js.map       ← Source map (pour le débogage)
├── preload.js        ← Pont sécurisé compilé
└── preload.js.map    ← Source map
```

> **Analogie WinDev** : La compilation TypeScript ≈ la compilation WinDev. Vous écrivez dans un langage plus riche (TypeScript), et l'outil le transforme en quelque chose d'exécutable (JavaScript).

## Étape 3 — Créer les installateurs

Maintenant que tout est compilé, on lance `electron-builder` pour créer les installateurs.

**Fichier** : `electron/`

```bash
npm --workspace electron run package
```

Cette commande exécute `scripts/package.mjs` qui :

1. Copie le binaire `app-builder` pour la compatibilité WSL2 (si applicable)
2. Lance `electron-builder` avec la configuration de `electron-builder.config.js`

Les installateurs sont déposés dans `electron/dist/release/` :

```
electron/dist/release/
├── ChDev-0.1.0.AppImage          ← Linux (universel)
├── chdev_0.1.0-1_amd64.deb       ← Linux (Debian/Ubuntu)
└── ChDev Setup 0.1.0.exe         ← Windows (NSIS)
```

> 💡 **Conseil** : Vous n'avez pas besoin de lancer ces trois formats en même temps. `electron-builder` cible automatiquement la plateforme sur laquelle vous êtes : sous Linux, il produit les formats Linux ; sous Windows, il produit le format Windows.

## Mode développement vs production

### Mode développement (`npm run dev`)

```bash
npm --workspace electron run dev
```

En mode développement :

- TypeScript est compilé en temps réel (`tsc`)
- Electron charge le frontend via `http://localhost:5173` (le serveur Vite)
- Les DevTools de Chromium sont ouverts automatiquement
- **Aucun installateur n'est créé**

C'est le mode pour le développement : vous modifiez le frontend, et les changements apparaissent immédiatement dans la fenêtre Electron (grâce au hot reload de Vite).

### Mode production (`npm run package`)

En mode production :

- Le frontend est compilé pour la production (minifié, optimisé)
- Electron charge les fichiers locaux de `frontend/dist/`
- Les installateurs sont créés avec les fichiers compilés
- **Les DevTools ne sont pas ouverts** (sauf si vous les ouvrez manuellement)

## Tester l'application Electron

### En développement

```bash
# Dans un terminal — lancer le serveur Vite du frontend
npm run dev:web

# Dans un autre terminal — lancer Electron
npm --workspace electron run dev
```

### Installer et tester un paquet Linux (deb)

```bash
# Installer le paquet .deb
sudo dpkg -i electron/dist/release/chdev_0.1.0-1_amd64.deb

# Lancer l'application
chdev

# Si des dépendances sont manquantes :
sudo apt-get install -f
```

### Tester le paquet Windows

Sous Windows, double-cliquez sur `ChDev Setup 0.1.0.exe` pour lancer l'installateur. Suivez les instructions, puis lancez l'application depuis le menu Démarrer.

## Déboguer en production

Si l'application se comporte différemment en production qu'en développement, vous pouvez ouvrir les DevTools manuellement :

1. Lancez l'application
2. Appuyez sur `Ctrl+Shift+I` (Linux/Windows) ou `Cmd+Option+I` (macOS)
3. L'onglet **Console** affiche les erreurs JavaScript
4. L'onglet **Network** affiche les requêtes

## Checklist de build

- [ ] Le frontend compile sans erreur (`npm --workspace frontend run build`)
- [ ] Les fichiers Electron compile sans erreur (`npm --workspace electron run build`)
- [ ] Les installateurs sont créés dans `electron/dist/release/`
- [ ] L'application démarre correctement après installation
- [ ] La navigation entre les pages fonctionne
- [ ] Les appels API au backend fonctionnent (le backend doit être en cours d'exécution)

## Résultat

Après un build réussi, vous avez :

| Plateforme | Format | Installation |
|------------|--------|--------------|
| **Linux** | AppImage | Exécutable autonome, aucun besoin d'installation |
| **Linux** | `.deb` | `sudo dpkg -i` sur Debian/Ubuntu |
| **Windows** | `.exe` | Installateur NSIS avec wizard |

> 💡 **Conseil** : L'AppImage est le format le plus portable sous Linux — il fonctionne sur presque toutes les distributions sans installation. Le `.deb` est idéal pour les utilisateurs Ubuntu/Debian qui préfèrent les paquets système.

## Ressources pour aller plus loin

- [Documentation officielle Electron](https://www.electronjs.org/docs/latest)
- [Documentation electron-builder](https://www.electron.build/)
- [Guide : First Electron App (Electron docs)](https://www.electronjs.org/docs/latest/tutorial/quick-start)
