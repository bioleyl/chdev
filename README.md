# CHDev — Documentation & Formation

## 🚀 Commencer la documentation

Suivez ces étapes pour lancer la documentation locale sur votre machine.

### 1. Cloner le projet

Ouvrez un terminal et exécutez :

```bash
git clone https://github.com/bioleyl/chdev.git
```

> **Analogie WinDev** : `git clone` ≈ copier un répertoire projet WinDev. Cela télécharge une copie complète du projet sur votre ordinateur.

### 2. Installer les dépendances

```bash
cd chdev
npm install
```

`npm` est le gestionnaire de paquets de Node.js. Il lit le fichier `package.json` et télécharge toutes les bibliothèques nécessaires au projet dans le dossier `node_modules`.

> **Analogie WinDev** : `npm install` ≈ l'étape de restauration des dépendances lors de l'ouverture d'un projet WinDev.

### 3. Lancer la documentation

```bash
npm run doc:dev
```

Cela démarre le serveur de développement de [VitePress](https://vitepress.dev), un générateur de documentation statique. Ouvrez [http://localhost:2500](http://localhost:2500) dans votre navigateur.

> **Analogie WinDev** : C'est l'équivalent du bouton "Exécuter" en mode debug — vous voyez les modifications en temps réel dans votre navigateur.

---

## 📖 Structure de la documentation

La documentation est organisée en modules :

| Dossier | Contenu |
|---------|---------|
| `doc/src/01-introduction/` | Découverte de l'écosystème |
| `doc/src/02-backend/` | API Express + TypeORM |
| `doc/src/03-frontend/` | Interface Vue 3 + Vuetify |
| `doc/src/04-ai/` | Modèles, Agents et Skills IA |
| `doc/src/05-electron/` | Application de bureau |

## 🛠 Commander le build

Pour générer la version statique (production) :

```bash
npm run doc:build
```

Les fichiers générés se trouvent dans `doc/.vitepress/dist/`.

---

> 💡 **Conseil** : Le projet est un **monorepo** (plusieurs sous-projets dans un seul dépôt). Chaque module (backend, frontend, documentation) est une **workspace** npm indépendante, mais elles partagent un `package.json` racine qui orchestre tout.

---

## 🖥️ Développement Backend

Le backend utilise **Express.js** + **TypeORM** + **SQLite** (`better-sqlite3`).

### Lancer le backend

```bash
npm run build -w common    # Construire le package commun en premier
npm run dev:api             # Lancer le serveur de développement
```

Le serveur démarre sur `http://localhost:3000`.

### Migrations & données de test

```bash
cd backend
npm run db:migrate   # Appliquer les migrations
npm run db:seed      # Remplir la base avec des données de démonstration
```

### Compatibilité Windows

Le backend est entièrement compatible Windows. Consultez le guide complet : [backend/WINDOWS.md](./backend/WINDOWS.md).

**Points clés :**
- `better-sqlite3` nécessite [Python](https://www.python.org/downloads/) et les [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) pour compiler les modules natifs.
- Les numéros de facture utilisent `-` (pas `/`) pour éviter les conflits avec les noms de fichiers Windows.
- Les chemins de fichiers sont résolus de manière cross-platform via `path.resolve()`.
- Les fichiers `.env` ne doivent **jamais** être commités (déjà dans `.gitignore`).
