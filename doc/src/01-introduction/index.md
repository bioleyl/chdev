# Présentation du projet CHDev

## Qu'est-ce que CHDev ?

CHDev est une application web complète permettant la gestion de **prestations**, de **factures** et de **lignes de factures**. Elle est composée de deux parties principales :

- **Backend** : un serveur API (Express + SQLite) qui gère les données
- **Frontend** : une interface web (Vue 3 + Vuetify) que l'utilisateur voit dans son navigateur

## Architecture globale

```
chdev/
├── common/          ← Code partagé (schémas de validation, types)
├── backend/         ← Serveur API (Express + TypeORM + SQLite)
├── frontend/        ← Interface web (Vue 3 + Vite + Vuetify)
├── electron/        ← Version desktop (en cours)
├── doc/             ← Cette documentation
└── package.json     ← Configuration racine (monorepo)
```

## Monorepo — Un seul dépôt, plusieurs packages

En WinDev, vous avez l'habitude d'avoir une application avec ses fichiers, ses classes, ses formulaires dans un seul projet. Ici, on utilise un **monorepo** : un seul dépôt Git qui contient plusieurs **packages** (sous-projets) qui communiquent entre eux.

### Pourquoi un monorepo ?

| Avantage | Explication |
|----------|-------------|
| **Schémas partagés** | Les règles de validation (Zod) sont dans `common/` et utilisées par le backend ET le frontend |
| **Une seule version** | Le risque que le frontend et le backend aient des versions différentes d'un même type est éliminé. |
| **Un seul `git clone`** | Tout est accessible immédiatement |

### npm workspaces

Le fichier `package.json` à la racine déclare les **workspaces** :

```json
{
  "workspaces": ["common", "backend", "frontend", "electron", "doc"]
}
```

Cela signifie que chaque dossier listé est un package indépendant avec son propre `package.json`, mais npm les gère comme un tout. Quand le frontend a besoin de `@chdev/common`, npm le trouve directement dans le dossier `common/` — pas besoin de publier sur un registre.

### Commandes utiles

```bash
# Lancer le backend en mode développement
npm run dev:api

# Lancer le frontend en mode développement
npm run dev:web

# Lancer les deux en parallèle
npm run dev

# Lancer la documentation
npm run doc:dev

# Linter et formater tout le code
npm run lint
```

Chaque workspace a aussi ses propres commandes :

```bash
# Exécuter une commande dans un workspace spécifique
npm --workspace backend run db:migrate
npm --workspace frontend run build
```

## Prochaines étapes

Si vous voulez démarrer immédiatement, consultez le **[guide de démarrage rapide](./getting-started.md)** qui vous explique comment lancer l'application en local, exécuter les migrations et vous connecter.

Si vous ne connaissez pas l'écosystème JavaScript/Node.js, commencez par les pages suivantes :

1. **[Git](./git.md)** — Le contrôle de version pour suivre vos modifications
2. **[Node.js et npm](./node-js.md)** — Comprendre l'environnement d'exécution et le gestionnaire de paquets
3. **[TypeScript](./typescript.md)** — Le langage utilisé dans ce projet
4. **[Visual Studio Code](./vscode.md)** — Votre environnement de développement
5. **[Linting et Formatting](./linting-formatting.md)** — Les outils de qualité de code
6. **[Zod](./zod.md)** — La bibliothèque de validation partagée

> 💡 **Section IA** : Si vous utilisez un agent d'IA (pi, Claude Code, Cursor…) pour travailler sur ce projet, consultez la [section IA](../04-ai/) pour comprendre les concepts de modèles, agents, skills, MCP et bonnes pratiques.

> 💡 **Section Electron** : Pour lancer CHDev en application de bureau (Windows, Linux), consultez la [section Electron](../05-electron/) pour comprendre l'architecture et créer les installateurs.
