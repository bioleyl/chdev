# Visual Studio Code — Votre environnement de développement

## Qu'est-ce que VS Code ?

**Visual Studio Code** (ou **VS Code**) est un éditeur de code gratuit développé par Microsoft. C'est un logiciel que vous installez sur votre ordinateur pour écrire, modifier et naviguer dans le code source du projet.

> **Analogie WinDev** : VS Code ≈ WinDev lui-même. WinDev est un environnement de développement complet (éditeur, compilateur, débogueur, base de données). VS Code est un éditeur de code que vous personnalisez avec des extensions pour obtenir un environnement similaire.

### Pourquoi VS Code ?

| Aspect | Dans WinDev | Dans VS Code |
|--------|-------------|--------------|
| Édition de code | Éditeur intégré avec coloration syntaxique | Éditeur intégré avec coloration syntaxique |
| Exécution du code | Clic sur le bouton "Exécuter" | Terminal intégré ou commandes |
| Base de données | Navigateur HFSQL intégré | Extensions (Database Client, etc.) |
| Outils intégrés | Tous les outils sont pré-configurés | Extensions à installer selon vos besoins |
| Personnalisation | Thèmes et options | Thèmes, extensions, paramètres personnalisables |

> 💡 **Note** : VS Code est **gratuit** et fonctionne sur Windows, macOS et Linux. Téléchargez-le sur [code.visualstudio.com](https://code.visualstudio.com/).

---

## Configuration du projet

Le dossier `.vscode/` à la racine du projet contient des fichiers de configuration qui s'appliquent automatiquement quand vous ouvrez le projet dans VS Code.

### `.vscode/settings.json`

Ce fichier configure le comportement de VS Code spécifiquement pour ce projet :

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "files.eol": "\n"
}
```

### Que fait cette configuration ?

| Paramètre | Ce que ça fait | Analogie WinDev |
|-----------|----------------|-----------------|
| `editor.defaultFormatter` | Utilise Biome pour formater le code | Le formatage automatique du code WinDev |
| `editor.formatOnSave` | Formate le code à chaque `Ctrl+S` | Reformatage automatique |
| `source.fixAll.biome` | Corrige automatiquement les erreurs de linting | L'analyseur de code qui corrige les erreurs |
| `source.organizeImports.biome` | Trie et nettoie les imports | Tri automatique des imports |
| `files.eol` | Force les sauts de ligne `\n` (Unix) | Uniformise les sauts de ligne |

> **Conseil** : Vous n'avez rien à configurer manuellement — ces paramètres s'appliquent automatiquement dès que vous ouvrez le projet. VS Code affiche une notification demandant d'accepter les paramètres du dossier `.vscode/`.

### Les extensions

Ce projet recommande les extensions suivantes :

| Extension | Identifiant | À quoi ça sert |
|-----------|-------------|----------------|
| **Biome** | `biomejs.biome` | Linter + formateur — applique les règles de code |
| **ESLint** | `dbaeumer.vscode-eslint` | Linter JavaScript/TypeScript (si présent dans le projet) |
| **Vue - Official** | `Vue.volar` | Support des fichiers `.vue` (IntelliSense, typage, snippets) |
| **TypeScript Vue** | `Vue.volar` (inclus) | Vérification de type pour les `.vue` |
| **GitLens** | `eamodio.gitlens` | Affiche qui a modifié chaque ligne et quand |
| **Prettier** | `esbenp.prettier-vscode` | Formateur (utilisé en fallback pour les fichiers `.vue`) |

> 💡 **Conseil** : Quand vous ouvrez le projet, VS Code peut proposer d'installer les extensions recommandées. Cliquez sur **Installer** pour les ajouter automatiquement.

---

## Le terminal intégré

VS Code inclut un **terminal** directement dans l'interface. Pas besoin d'ouvrir une fenêtre de commande séparée.

### Ouvrir le terminal

- **Raccourci** : `Ctrl+`` (accent grave)
- **Menu** : `Terminal > Nouveau terminal`

### Commandes fréquentes

```bash
# Lancer le projet en développement
npm run dev

# Lancer uniquement le backend
npm run dev:api

# Lancer uniquement le frontend
npm run dev:web

# Linter et formater le code
npm run lint
```

> **Analogie WinDev** : Le terminal intégré ≈ la fenêtre de commande WinDev. C'est ici que vous tapez les commandes `npm run ...` pour lancer le projet, faire des migrations, etc.

---

## Naviguer dans le code

### Explorer les fichiers

Le **panneau latéral gauche** (l'Explorateur) affiche la structure du projet :

```
chdev/
├── common/          ← Schémas de validation Zod, types partagés
├── backend/         ← API Express
│   └── src/
│       ├── controllers/
│       ├── entities/
│       └── repositories/
├── frontend/        ← Interface Vue 3
│   └── src/
│       ├── components/
│       ├── views/
│       └── router/
├── electron/        ← Application desktop
└── doc/             ← Cette documentation
```

### Rechercher du code

- **Dans le projet entier** : `Ctrl+Shift+F` — recherche textuelle dans tous les fichiers
- **Dans un fichier** : `Ctrl+F` — recherche dans le fichier ouvert
- **Symbole** : `Ctrl+Shift+O` — rechercher une fonction, une classe, une interface

> 💡 **Conseil** : La recherche par symbole (`Ctrl+Shift+O`) est très utile pour trouver rapidement une fonction ou une interface dans un fichier.

### Aller à la définition

- **Raccourci** : `F12` ou **clic gauche** sur un nom de fonction/type
- **Retour en arrière** : `Ctrl+-` (ou `Alt+←`)

> **Analogie WinDev** : Aller à la définition ≈ le raccourci `F2` (rechercher une procédure/fonction). Ici, c'est automatique — VS Code sait où est chaque fonction.

---

## Exécuter les scripts

### Lancer le serveur de développement

Le projet se lance avec la commande `npm run dev`, qui démarre **trois serveurs en parallèle** :

```
npm run dev
├── backend  → http://localhost:3000/api
├── frontend → http://localhost:5173
└── (si Electron) electron
```

> 💡 **Conseil** : Vous pouvez aussi lancer le backend et le frontend séparément avec `npm run dev:api` et `npm run dev:web` si vous travaillez sur l'un des deux uniquement.

### Les scripts disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| `npm run dev` | `run-p dev:*` | Démarre backend + frontend en même temps |
| `npm run dev:api` | `backend dev` | Démarre le serveur API Express |
| `npm run dev:web` | `frontend dev` | Démarre le serveur de développement Vue + Vite |
| `npm run build` | Multi | Compile tout le projet |
| `npm run lint` | `biome check --fix` | Linter + formateur (correction automatique) |

### Commandes spécifiques aux workspaces

```bash
# Migration de la base de données (backend)
npm --workspace backend run db:migrate

# Construction du frontend
npm --workspace frontend run build

# Construction de la doc
npm --workspace doc run dev
```

> **Analogie WinDev** : `npm --workspace` ≈ lancer une procédure spécifique dans WinDev. Au lieu de tout lancer d'un coup, vous exécutez uniquement ce dont vous avez besoin.

---

## Productivité — Raccourcis essentiels

### Navigation

| Raccourci | Action | Analogie WinDev |
|-----------|--------|-----------------|
| `Ctrl+P` | Ouvrir un fichier rapidement | `F2` + saisie du nom de fichier |
| `Ctrl+Shift+F` | Rechercher dans le projet entier | Recherche dans les fichiers |
| `F12` | Aller à la définition | `F2` sur un identifiant |
| `Ctrl+G` | Aller à une ligne | Saisie du numéro de ligne |

### Édition

| Raccourci | Action | Analogie WinDev |
|-----------|--------|-----------------|
| `Ctrl+S` | Sauvegarder et formater le code | Le fichier se sauvegarde automatiquement |
| `Ctrl+/` | Commenter/décommenter la ligne | Commentaire de ligne |
| `Alt+Up/Down` | Dupliquer la ligne ou le bloc | Copier-coller de lignes |
| `Ctrl+D` | Sélectionner l'occurrence suivante | Sélectionner le suivant |

### Multi-curseur

- **Sélection multiple** : `Alt+Clic` pour placer plusieurs curseurs
- **Sélection de toutes les occurrences** : Sélectionnez un mot, puis `Ctrl+Shift+L` pour l'ajouter à tous les endroits où il apparaît

> 💡 **Conseil** : Le multi-curseur est extrêmement utile pour renommer une variable ou un paramètre partout dans un fichier en une seule opération.

---

## Débogage

VS Code dispose d'un **débogueur** intégré, mais le projet CHDev utilise principalement la console pour le développement.

### Console du navigateur (Frontend)

1. Ouvrez le frontend (`npm run dev:web`)
2. Dans le navigateur, ouvrez les **outils de développement** (`F12`)
3. L'onglet **Console** affiche les `console.log()` et les erreurs JavaScript

### Console du terminal (Backend)

Le terminal VS Code affiche les logs du serveur backend en temps réel quand vous lancez `npm run dev`. Les erreurs et requêtes HTTP y sont visibles.

---

## Exercices pratiques

Ces exercices vous permettent de vous familiariser avec VS Code dans le contexte du projet CHDev.

---

### Exercice 1 — Ouvrir et naviguer dans le projet

1. Installez VS Code si ce n'est pas déjà fait
2. Ouvrez le dossier du projet : `Fichier > Ouvrir un dossier` → sélectionnez le dossier `chdev`
3. Naviguez dans l'arborescence et trouvez le fichier `backend/src/index.ts`
4. Ouvrez-le et utilisez `Ctrl+P` pour ouvrir rapidement `frontend/src/App.vue`

<details>
<summary>🔽 Voir la solution</summary>

- **Étape 2** : `Ctrl+K Ctrl+O` (ou `Fichier > Ouvrir un dossier`)
- **Étape 3** : Utilisez la barre de recherche de fichiers (`Ctrl+P`) et tapez `backend/src/index` — VS Code filtre les fichiers en temps réel
- **Étape 4** : Tapez `frontend/src/App.vue` dans `Ctrl+P` — vous devriez voir le fichier apparaître

</details>

---

### Exercice 2 — Formater un fichier

1. Ouvrez n'importe quel fichier `.ts` dans le projet (par exemple dans `backend/src/`)
2. Modifiez le code en retirant des espaces ou en désorganisant les imports
3. Appuyez sur `Ctrl+S` pour sauvegarder
4. Observez ce qui se passe

<details>
<summary>🔽 Voir la solution</summary>

À la sauvegarde (`Ctrl+S`), **Biome** format automatiquement le fichier :
- Les imports sont triés alphabétiquement
- Le code est indenté correctement (2 espaces)
- Les guillemets sont uniformisés
- Les lignes trop longues sont coupées

C'est la configuration `editor.formatOnSave` qui active ce comportement.

</details>

---

### Exercice 3 — Rechercher dans le projet

1. Utilisez `Ctrl+Shift+F` pour rechercher le mot `Prestation`
2. Observez le nombre de résultats — dans quelles parties du projet apparaît ce mot ?
3. Essayez de trouver où est définie l'interface `PrestationResponse`

<details>
<summary>🔽 Voir la solution</summary>

- Le mot `Prestation` apparaît dans le **backend** (entité, contrôleur, routes) et dans le **frontend** (composants, types)
- Pour trouver l'interface, utilisez `Ctrl+Shift+O` (recherche de symboles) et tapez `PrestationResponse` — cela filtre uniquement les déclarations de types et fonctions

</details>

---

### Exercice 4 — Exécuter le projet

1. Ouvrez le terminal intégré avec `Ctrl+``
2. Tapez `npm run dev` et appuyez sur `Entrée`
3. Observez les logs dans le terminal — le backend et le frontend démarrent-ils ?
4. Ouvrez votre navigateur et allez sur `http://localhost:5173`

<details>
<summary>🔽 Voir la solution</summary>

La commande `npm run dev` lance les deux serveurs en parallèle :
- **Backend** : Affiche `Serveur Express démarré sur http://localhost:3000/api`
- **Frontend** : Affiche `VITE v... ready in ... ms` et indique l'URL (souvent `http://localhost:5173`)
- Dans le navigateur, vous devriez voir l'interface CHDev

> 💡 **Astuce** : Si un des serveurs ne démarre pas, vérifiez les messages d'erreur dans le terminal — ils indiquent généralement le problème (port déjà utilisé, dépendance manquante, etc.)

</details>

---

## Ressources pour aller plus loin

- [Documentation officielle VS Code](https://code.visualstudio.com/docs)
- [Raccourcis clavier VS Code](https://code.visualstudio.com/docs/getstarted/keybindings)
- [Guide de démarrage — VS Code](https://code.visualstudio.com/docs/introvideos/tours)
- [Extensions recommandées par le projet](https://code.visualstudio.com/docs/editor/extension-marketplace)
