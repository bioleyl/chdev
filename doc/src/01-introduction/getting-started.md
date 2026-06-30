# Démarrage rapide — Guide pas-à-pas

Ce guide vous accompagne pas à pas pour lancer l'application CHDev en local, sur votre propre machine. À la fin, vous aurez un serveur API fonctionnel, une interface web ouverte dans votre navigateur, et les données de démonstration chargées en base.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

| Logiciel | Version minimum | Pourquoi ? |
| ---------- | ---------------- | ------------ |
| **Git** | Dernière version | Pour cloner le projet |
| **Node.js** | 24 | L'environnement d'exécution JavaScript |
| **npm** | 10+ (fourni avec Node.js) | Pour installer les dépendances |
| **Un navigateur web** | Chrome, Firefox, Edge | Pour voir l'interface |

## Prérequis avant la formation

Avant de commencer la formation, assurez-vous d'avoir préparé votre environnement :

| Action | Comment |
| -------- | -------- |
| **Créer un compte GitHub** | [Inscrivez-vous gratuitement](https://github.com/signup) |
| **Installer Git** | [git-scm.com](https://git-scm.com/) — vérifiez avec `git --version` |
| **Installer npm** | Inclus avec Node.js — vérifiez avec `node --version` (24+) et `npm --version` (10+) |
| **Installer VS Code** | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Installer les extensions VS Code** | Biome (`biomejs.biome`), Vue - Official (`Vue.volar`), GitLens (`eamodio.gitlens`) — voir la page [VS Code](./vscode.md) |

---

> **Analogie WinDev** : Git ≈ la fonction GDS (Gestionnaire de Sources) de WinDev qui sauvegarde des copies de votre projet et historise vos modifications de code. Node.js ≈ l'exécutable WinDev qui fait tourner votre programme. npm ≈ le gestionnaire de bibliothèques WinDev.

---

## Étape 1 — Cloner le projet

Ouvrez un terminal et exécutez :

```bash
git clone https://github.com/bioleyl/chdev.git
cd chdev
```

Cela télécharge une copie complète du projet dans le dossier `chdev/`.

---

## Étape 2 — Installer les dépendances

```bash
npm install
```

Cette commande lit le fichier `package.json` à la racine et télécharge toutes les bibliothèques dans le dossier `node_modules`.

> **Analogie WinDev** : `npm install` ≈ l'étape de restauration des dépendances automatique à l'ouverture d'un projet.

Le processus peut prendre quelques minutes. Une fois terminé, vous verrez un message indiquant que les paquets ont été installés.

---

## Étape 3 — Configurer le fichier d'environnement (.env)

Le fichier `.env` contient les **variables d'environnement** du backend : les informations de configuration qui ne doivent jamais être partagées (clés secrètes, mots de passe, paramètres de base de données). C'est le moyen que le backend utilise pour se configurer sans avoir de valeurs en dur dans le code.

> **Analogie WinDev** : `.env` ≈ le fichier de configuration `*.ini` où sont enregistrés les paramètres globaux de votre projet. C'est là que vous stockez les paramètres spécifiques à votre machine (chemins, mots de passe, ports) sans les mettre directement dans vos programmes.

### Comment créer le fichier `.env`

Le projet fournit un fichier modèle nommé `.env.example`. Pour créer votre fichier de configuration, exécutez (en **PowerShell**) :

```bash
cp backend/.env.example backend/.env
```

> **Note** : Cette commande fonctionne en **PowerShell**. Si vous utilisez **CMD**, utilisez à la place : `copy backend\.env.example backend\.env`.

> **Note** : Le fichier `.env` est **exclu du suivi Git** (il est dans `.gitignore`). C'est une règle de sécurité : les clés secrètes ne doivent jamais être commitées dans le dépôt. Chaque développeur a son propre fichier `.env` avec ses propres valeurs.

### Aperçu du contenu

Voici ce que contient votre fichier `.env` :

| Variable | Valeur par défaut | Rôle |
| ---------- | ------------------- | ------ |
| `PORT` | `3000` | Port sur lequel le serveur API écoute |
| `NODE_ENV` | `development` | Mode de l'application (`development`, `production`, `test`) |
| `DB_PATH` | *(non défini, utilise le défaut)* | Chemin personnalisé vers le fichier SQLite (optionnel) |
| `JWT_SECRET` | `dev-secret-change-in-production` | Clé secrète pour signer les jetons d'authentification |
| `JWT_EXPIRY` | `1h` | Durée de validité des jetons (1 heure) |

> ⚠️ **Important** : La variable `JWT_SECRET` doit être changée avant de déployer en production. Pour le développement local, la valeur par défaut est suffisante.

> 💡 **Conseil** : Vous n'avez pas besoin de modifier ces valeurs pour développer en local. Le fichier copié depuis `.env.example` fonctionne tel quel.

---

## Étape 4 — Exécuter les migrations

Une migration est un script qui crée ou modifie la structure de la base de données. C'est comme définir vos tables HFSQL dans WinDev — mais en version numérique et traçable.

```bash
npm --workspace backend run db:migrate
```

Vous devriez voir un message de succès :

```bash
Running migrations...
Migrations completed successfully.
```

> **Note** : La base de données est un fichier SQLite (`chdev.db`) situé dans `backend/data/`. Elle est créée automatiquement lors de la première migration.

---

## Étape 5 — Remplir la base de données (seed)

Le "seed" (amorçage) permet de pré-remplir la base de données avec des données de démonstration : utilisateurs, prestations, clients et factures.

```bash
npm --workspace backend run db:seed
```

Cela crée :

| Entité | Quantité | Description |
| -------- | ---------- | ------------- |
| **Utilisateurs** | 3 | Un par rôle (ADMIN, EDITOR, VIEWER) |
| **Prestations** | Variées | Services facturables |
| **Clients** | Variés | Clients de démonstration |
| **Factures** | Une par client | Liées aux prestations |

---

## Étape 6 — Construire les artefacts partagés

Le projet contient une workspace `common` qui regroupe le code partagé entre le backend et le frontend (schémas Zod, types TypeScript, constantes). Avant de lancer l'application, il faut la compiler pour que les autres workspaces puissent l'utiliser.

```bash
npm run build -w common
```

Cette commande transpile le TypeScript de `common` en JavaScript et place les fichiers compilés dans le dossier `dist/`. Les workspaces `backend` et `frontend` dépendent de ce résultat.

> **Analogie WinDev** : `npm run build -w common` ≈ compiler une bibliothèque partagée que vos programmes vont importer. Le code source reste en TypeScript, mais c'est le JavaScript compilé qui est réellement utilisé par le backend et le frontend.

---

## Étape 7 — Lancer l'application en mode développement

Le projet utilise un système de **workspaces** (espaces de travail npm). Les commandes raccourcies à la racine lancent les services en parallèle :

### Lancer uniquement le backend et le frontend

```bash
npm run dev
```

Cela démarre :

| Service           | Port                    | Description              |
|---------          |------                   |-------------             |
| **Backend (API)** | `http://localhost:3000` | Serveur Express + SQLite |
| **Frontend (Web)**| `http://localhost:5173` | Interface Vue 3 + Vuetify|

### Ouvrir l'interface

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur. L'application est prête à l'emploi.

> **Analogie WinDev** : `npm run dev` ≈ cliquer sur le bouton "Exécuter" en mode debug. Vous voyez immédiatement le résultat dans votre navigateur.

### Autres variantes de commandes

```bash
# Lancer aussi la documentation locale
npm run zdev:desktop

# Lancer uniquement le backend
npm run dev:api

# Lancer uniquement le frontend
npm run dev:web

# Lancer uniquement la documentation
npm run doc:dev
```

---

## Étape 8 — Se connecter

Trois utilisateurs ont été créés lors du seed, un par niveau d'accès :

| Rôle | Email | Mot de passe | Permissions |
|------|-------|-------------|-------------|
| **Administrateur** | `admin@admin.com` | `admin` | Accès complet : créer, modifier, supprimer |
| **Rédacteur** | `writer@writer.com` | `writer` | Créer et modifier |
| **Lecteur** | `viewer@viewer.com` | `viewer` | Lecture seule |

> 💡 **Conseil** : Testez chaque rôle pour comprendre comment les permissions influencent l'interface (certains boutons sont masqués selon le rôle).

---

## 🎯 Premiers pas dans la formation

Une fois l'application lancée et connectée, voici votre parcours recommandé :

### Si vous découvrez JavaScript / Node.js

1. **[Git — Contrôle de version](./git.md)** — Apprenez à suivre vos modifications
2. **[Node.js et npm](./node-js.md)** — Comprendre l'environnement d'exécution
3. **[TypeScript](./typescript.md)** — Le langage typé utilisé dans ce projet
4. **[Zod — Validation de schémas](./zod.md)** — La bibliothèque de validation partagée

### Si vous connaissez déjà l'écosystème

1. **[Backend — Vue d'ensemble](../02-backend/)** — Architecture du serveur API
2. **[Ajouter un endpoint](../02-backend/ajouter-un-endpoint)** — Guide pas-à-pas
3. **[Frontend — Vue d'ensemble](../03-frontend/)** — Architecture de l'interface
4. **[Ajouter une fonctionnalité](../03-frontend/ajouter-une-fonctionnalite)** — Guide pas-à-pas complet

---

## ❓ Dépannage rapide

| Problème | Solution |
|----------|----------|
| `node_modules` manquants après un clone | Relancez `npm install` |
| Le backend ne démarre pas (erreur `PORT` ou `JWT_SECRET`) | Vérifiez que `backend/.env` existe : `cp backend/.env.example backend/.env` |
| Base de données vide après le redémarrage | Relancez `npm --workspace backend run db:seed` |
| Le frontend ne se connecte pas au backend | Vérifiez que le backend est bien démarré sur le port 3000 |
| Erreurs TypeScript au démarrage | Assurez-vous d'avoir Node.js 24 : `node --version` |

---

## Checklist récapitulative

  ☐ Projet cloné avec `git clone`

  ☐ Dépendances installées avec `npm install`

  ☐ Fichier `.env` configuré (copié depuis `.env.example`)

  ☐ Migrations exécutées avec `npm --workspace backend run db:migrate`

  ☐ Base de données remplie avec `npm --workspace backend run db:seed`

  ☐ Artefacts partagés construits avec `npm run build -w common`

  ☐ Application lancée avec `npm run dev`

  ☐ Interface ouverte sur `http://localhost:5173`

  ☐ Connexion réussie avec un compte de démonstration

---

> 💡 **Pour aller plus loin** : Cette documentation est elle-même une workspace du projet. Si vous voulez la modifier et la relire en local, exécutez `npm run doc:dev` pour lancer le serveur de documentation sur `http://localhost:2500`.
