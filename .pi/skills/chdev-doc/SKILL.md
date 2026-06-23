---
name: chdev-doc
description: Rules and conventions for writing CHDev documentation in French. Activate when asked to create, modify, or write documentation for the chdev project.
---

# Rédaction de documentation CHDev

Ce skill définit les règles à suivre **chaque fois** que l'on rédige ou modifie de la documentation pour le projet CHDev.

---

## Principe fondamental : le lecteur

Le lecteur est un développeur **WinDev** qui découvre l'écosystème JavaScript/Node.js. Il connaît la programmation (variables, boucles, fonctions, bases de données) mais **ne connaît rien** au tooling JavaScript.

### Ce que le lecteur NE connaît PAS (à expliquer depuis zéro)

Tout ce qui relève du tooling est considéré comme **totalement inconnu** :

- **npm**, `package.json`, `node_modules`, `package-lock.json`, workspaces
- **Node.js** comme environnement d'exécution
- **TypeScript** (le compilateur, `tsconfig.json`, la transpilation)
- **Vite** (build tool, dev server, hot reload)
- **Biome** (linter/formatter)
- **Express** (framework web, routes, middlewares)
- **TypeORM** (ORM, entities, migrations, repositories)
- **SQLite** comme base de données fichier
- **Vue 3** (composants, réactivité, `<script setup>`, templates)
- **Vuetify** (composants Material Design)
- **Vue Router** (navigation SPA, lazy loading, guards)
- **Zod** (schémas de validation, `z.infer`)
- **vee-validate** (validation de formulaires)
- **JWT** (authentification par jeton)
- **Git** / **monorepo** (si pertinent)
- Les commandes `npm run`, `npx`, `npm --workspace`

**Règle** : Chaque outil, concept ou technologie doit être introduit avec une explication claire de **ce que c'est** et **à quoi ça sert**, avant d'expliquer **comment l'utiliser**.

### Ce que le lecteur connaît (pas besoin d'expliquer)

Le lecteur a des bases en programmation :

- Variables, types, constantes
- Fonctions, paramètres, retour de valeur
- Boucles (`for`, `while`), conditions (`if/else`)
- Tableaux, objets/dictionnaires
- Classes, héritage (conceptuel)
- Bases de données relationnelles (tables, colonnes, clés primaires, relations)
- Requêtes SQL de base (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Requêtes/4D (l'équivalent WinDev)

---

## Langue

**Toute la documentation est en français.** Les noms de variables, de fonctions et de fichiers restent en anglais (convention du projet), mais les explications, commentaires pédagogiques et titres sont en français.

---

## Analogies WinDev

**Systématiquement**, quand on introduit un concept de l'écosystème JavaScript, on fournit une **analogie WinDev** pour ancrer la compréhension :

```markdown
> **Analogie WinDev** : Node.js ≈ l'environnement d'exécution WinDev. C'est le "moteur" qui fait tourner votre code.
```

Ou sous forme de tableau :

| Technologie | Rôle | Analogie WinDev |
|-------------|------|-----------------|
| Express | Framework web (serveur HTTP) | Le serveur HTTP / les pages web |
| TypeORM | ORM — accès à la base de données | Les fichiers HFSQL + les requêtes 4D |

**Règle** : Une analogie par concept majeur. Pas besoin d'en mettre partout — juste là où le saut conceptuel est le plus grand.

---

## Structure des pages

### Pages conceptuelles (introduction à un outil/concept)

```markdown
# [Nom du concept]

## Qu'est-ce que [concept] ?

[Explication simple + Analogie WinDev]

### Pourquoi [concept] ?

[Tableau avantages ou liste à puces]

## [Sous-concept 1]

[Explication + exemples de code]

## [Sous-concept 2]

[Explication + exemples de code]

## [Concept] dans ce projet

[Comment le concept est utilisé concrètement dans CHDev]

## Exercices pratiques

[Exercices avec solutions repliables — voir section dédiée]

## Ressources pour aller plus loin

- [Lien 1](url)
- [Lien 2](url)
```

### Guides pas-à-pas (ajouter une fonctionnalité)

```markdown
# [Titre du guide] — Guide pas-à-pas

[Introduction : ce que le lecteur va créer]

---

## Étape 1 — [Nom de l'étape]

**Fichier** : `chemin/vers/le/fichier.ts`

[Explication + code complet]

---

## Étape 2 — [Nom de l'étape]

...

---

## Résultat

[Résumé de ce qui a été créé — tableau ou liste]

---

## Checklist récapitulative

- [ ] Étape 1
- [ ] Étape 2
- [ ] ...
```

---

## Exercices pratiques

**Chaque page conceptuelle** se termine par une section **Exercices pratiques** avec des exercices progressifs. C'est **obligatoire** pour les pages qui enseignent un concept (TypeScript, Zod, Node.js, etc.).

### Format d'un exercice

Chaque exercice suit ce modèle :

1. **Titre** avec niveau `###`
2. **Énoncé** clair et concis
3. **Solution** dans un bloc `<details>/<summary>` (repliable)
4. **Explications** après la solution (toujours visibles quand on déroule)

```markdown
### Exercice 1 — [Nom de l'exercice]

[Énoncé de l'exercice — une ou deux phrases maximum]

<details>
<summary>🔽 Voir la solution</summary>

```typescript
[Code de la solution]
```

**Explications :**
- [Point 1 d'explication]
- [Point 2 d'explication]
- [Lien avec le projet CHDev si pertinent]

</details>

---
```

### Règles des exercices

- **Progression** : Commencer simple (typage de base), augmenter la complexité
- **Nombre** : 3 à 6 exercices par page (selon la densité du contenu)
- **Pertinence** : Chaque exercice doit illustrer un concept vu dans la page
- **Lien avec le projet** : Quand c'est pertinent, mentionner où le concept est utilisé dans CHDev
- **Bonus** : Le dernier exercice peut être marqué "(bonus)" pour les curieux
- **Conseil pratique** : Ajouter un encadré en haut de la section avec un conseil d'exécution

```markdown
> 💡 **Conseil** : Copiez le code dans un fichier `.ts` et lancez `npx tsc --noEmit` pour voir les erreurs de type.
```

---

## Code dans la documentation

### Blocs de code

Toujours préciser le langage :

````markdown
```typescript
// Code TypeScript
```

```bash
# Commande terminal
```

```json
{
  "key": "value"
}
```
````

### Chemins de fichiers

Quand on montre du code issu du projet, indiquer le chemin du fichier en commentaire ou en gras :

```markdown
**Fichier** : `backend/src/controllers/example.controller.ts`
```

### Extraits vs code complet

- **Pages conceptuelles** : Extraits courts et ciblés (5-15 lignes max)
- **Guides pas-à-pas** : Code complet des fichiers à créer

---

## Éléments visuels

### Tableaux

Utiliser les tableaux pour :

- Comparer deux approches (avec/sans)
- Lister des options de configuration
- Résumer des middlewares, routes, rôles
- Présenter des technologies et leurs analogies

### Diagrammes ASCII

Utiliser des diagrammes simples pour illustrer les flux :

```markdown
Client → Route → Middleware(s) → Controller → Repository → Base de données
```

### Arborescences

Montrer la structure des dossiers avec des arbres ASCII :

```markdown
backend/src/
├── index.ts
├── controllers/
├── repositories/
└── entities/
```

### Encadrés

| Syntaxe | Usage |
|---------|-------|
| `> **Analogie WinDev** : ...` | Analogie avec WinDev |
| `> 💡 **Conseil** : ...` | Astuce pratique |
| `> **Règle importante** : ...` | Règle à ne pas oublier |
| `> **Note** : ...` | Information complémentaire |

---

## Ton et style

- **Pédagogique** : On explique le "pourquoi" avant le "comment"
- **Direct** : On utilise "vous" pour s'adresser au lecteur
- **Progressif** : On part du simple vers le complexe
- **Concret** : On illustre avec des exemples du projet CHDev quand c'est possible
- **Encourageant** : On valide les acquis ("Vous savez maintenant...")

### À éviter

- Jargon sans explication
- Supposer que le lecteur connaît un outil
- Blocs de code sans contexte
- Pages sans exercices (pour les pages conceptuelles)

---

## Checklist avant de valider une page

Quand vous terminez une page de documentation, vérifiez :

- [ ] La page est **entièrement en français** (hors noms de fichiers/variables)
- [ ] Chaque outil/concept est **introduit depuis zéro** (pas de connaissance supposée sur le tooling)
- [ ] Les **analogies WinDev** sont présentes pour les concepts majeurs
- [ ] Les blocs de code ont le **langage précisé** et sont **contextualisés**
- [ ] La page conceptuelle se termine par des **exercices pratiques** avec solutions repliables
- [ ] Les **explications** suivent chaque solution d'exercice
- [ ] Une section **"Ressources pour aller plus loin"** est présente (pages conceptuelles)
- [ ] Une **checklist récapitulative** est présente (guides pas-à-pas)
- [ ] Le ton est **pédagogique** et **direct** ("vous")
