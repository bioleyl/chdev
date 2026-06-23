# Les agents de codage

## Qu'est-ce qu'un agent de codage ?

Un **agent de codage** est un environnement qui utilise un modèle de langage (LLM) et lui donne des **outils** pour interagir avec votre projet : lire des fichiers, écrire du code, exécuter des commandes, chercher dans le code…

> **Analogie WinDev** : Le modèle (LLM) est comme le moteur de langage 4D — il comprend vos instructions. L'agent est comme **WinDev dans son ensemble** — il donne au moteur un éditeur, un débogueur, un explorateur de fichiers, et la capacité d'exécuter du code. Sans l'agent, le modèle ne peut que *parler* — avec l'agent, il peut *agir*.

### Modèle vs Agent — La différence essentielle

```
Modèle seul (API brute) :
  Vous : "Écris un controller Express"
  Modèle : "Voici le code..." (texte uniquement)
  Vous : Copiez-collez manuellement dans un fichier

Agent de codage :
  Vous : "Écris un controller Express"
  Agent : Lit la structure du projet → Choit le bon dossier → Écrit le fichier → Lance les tests
  Résultat : Le fichier existe et fonctionne
```

| Aspect | Modèle seul | Agent |
|--------|-------------|-------|
| Peut lire des fichiers ? | Non | Oui |
| Peut écrire des fichiers ? | Non | Oui |
| Peut exécuter des commandes ? | Non | Oui |
| Peut chercher dans le code ? | Non | Oui |
| Peut naviguer dans le projet ? | Non | Oui |
| Génère du texte ? | Oui | Oui (via le modèle) |

## Les principaux agents

| Agent | Type | Particularité |
|-------|------|---------------|
| **pi** | Terminal (ligne de commande) | Minimaliste, extensible, open-source |
| **Claude Code** | Terminal | Puissant, bien intégré à l'écosystème Anthropic |
| **Cursor** | Éditeur (IDE) | Basé sur VS Code, très intuitif |
| **Windsurf** | Éditeur (IDE) | Similaire à Cursor |
| **GitHub Copilot** | Plugin IDE | Intégration dans VS Code, JetBrains |

> **Note** : Pour ce projet, **pi** est recommandé. C'est un agent en terminal, open-source et minimaliste.

> **Analogie WinDev** : Un agent de codage est comme un assistant développeur qui s'assoit à côté de vous, lit votre écran, et peut taper au clavier à votre place. Vous lui donnez des instructions en langage naturel, il utilise ses outils pour les exécuter.

## Les outils de l'agent

Un agent donne au modèle un ensemble d'**outils** (tools) pour interagir avec le système :

| Outil | Rôle | Analogie WinDev |
|-------|------|----------------|
| `read` | Lire le contenu d'un fichier | Ouvrir un fichier dans l'éditeur |
| `write` | Créer ou écraser un fichier | Enregistrer un fichier |
| `edit` | Modifier précisément un fichier | Modifier une zone spécifique |
| `bash` | Exécuter une commande terminal | Exécuter une commande DOS |
| `code_search` | Chercher dans la documentation en ligne | Chercher dans l'aide en ligne |
| `web_search` | Rechercher sur internet | Naviguer sur le web |

### Comment l'agent utilise les outils

```
Vous : "Ajoute un endpoint GET /api/factures"
       ↓
Agent analyse la demande
       ↓
Agent utilise read → Lit backend/src/routes/ pour comprendre la structure
       ↓
Agent utilise read → Lit un controller existant comme exemple
       ↓
Agent utilise write → Crée le nouveau controller
       ↓
Agent utilise edit → Ajoute la route dans le fichier de routes
       ↓
Agent utilise bash → Lance npm run lint pour vérifier
       ↓
Agent : "C'est fait ! Voici ce que j'ai créé..."
```

## Sessions — La mémoire de l'agent

Une **session** est une conversation complète avec l'agent. Elle contient :
- Vos messages
- Les réponses de l'agent
- Les appels d'outils et leurs résultats
- Le contexte accumulé

```
Session 1 : "Crée un controller pour les factures"
  ├─ Message utilisateur
  ├─ Agent lit les fichiers
  ├─ Agent écrit le code
  └─ Agent confirme

Session 2 (nouvelle) : "Modifie le controller des factures"
  ├─ Message utilisateur (l'agent ne se souvient pas de Session 1)
  ├─ Agent doit relire les fichiers
  └─ Agent modifie le code
```

> **Règle importante** : Chaque nouvelle session (`/new`) part de zéro. L'agent ne se souvient pas des sessions précédentes. Gardez vos conversations dans le même fichier de session pour conserver le contexte.

### Gestion des sessions

Les commandes varient selon l'agent, mais les concepts sont similaires :

| Commande | Rôle |
|----------|------|
| `/new` ou `Ctrl+N` | Nouvelle session (contexte vide) |
| `/resume` ou `Ctrl+R` | Reprendre une session précédente |
| `/compact` | Résumer l'historique pour libérer de la place |
| `/tree` | Naviguer dans l'arbre des sessions (branches) |
| `/fork` | Créer une branche à partir d'un point de la session |

## Comment parler à l'agent

### Bonnes pratiques de communication

| ✅ Faire | ❌ Éviter |
|---------|----------|
| "Crée un controller pour les factures avec GET et POST" | "Fais quelque chose pour les factures" |
| "Regarde `backend/src/controllers/` et suis le même pattern" | "Écris du code backend" |
| "L'erreur est : [copier l'erreur complète]" | "Ça marche pas" |
| "Explique-moi ce fichier avec une analogie WinDev" | "C'est quoi ça ?" |

### Donner du contexte

L'agent a besoin de contexte pour bien travailler. Vous pouvez :

1. **Référencer des fichiers** avec `@` :
   ```
   @backend/src/controllers/client.controller.ts Crée un controller similaire pour les factures
   ```

2. **Décrire le projet** :
   ```
   Ce projet utilise Express + TypeORM + Zod. Le backend est dans backend/src/
   ```

3. **Montrer des exemples** :
   ```
   Voici un controller existant. Crée-en un nouveau pour les factures en suivant le même pattern.
   ```

## Limites de l'agent

| Limite | Explication | Contournement |
|--------|-------------|---------------|
| **Fenêtre de contexte** | L'agent "oublie" le début de la conversation si elle est trop longue | Utilisez `/compact` ou commencez une nouvelle session |
| **Hallucinations** | Le modèle peut inventer du code ou des faits | Vérifiez toujours le code généré |
| **Pas de mémoire persistante** | Entre sessions, tout est perdu | Utilisez des fichiers `AGENTS.md` pour les instructions permanentes |
| **Dépend du modèle** | La qualité varie selon le modèle choisi | Utilisez un bon modèle pour les tâches complexes |

## Exercices pratiques

> 💡 **Conseil** : Lancez votre agent de codage dans le dossier du projet pour ces exercices.

### Exercice 1 — Explorer le projet avec l'agent

Demandez : *"Montre-moi la structure des dossiers du backend"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent devrait utiliser `bash` avec `find` ou `ls` pour lister les dossiers, puis vous présenter l'arborescence.

**Explications :**
- L'agent utilise l'outil `bash` pour exécuter une commande shell
- Le modèle formate le résultat de manière lisible
- C'est l'équivalent de naviguer dans l'explorateur de fichiers de WinDev

</details>

---

### Exercice 2 — Comprendre un fichier

Demandez : *"Explique-moi le fichier `backend/src/app.ts`"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent lit le fichier avec `read`, puis explique son contenu : configuration Express, middlewares, routes…

**Explications :**
- L'outil `read` permet à l'agent de voir le contenu du fichier
- Le modèle analyse le code et génère une explication
- Vous pouvez demander des précisions : "Explique la partie middlewares"

</details>

---

### Exercice 3 — Créer un fichier simple

Demandez : *"Crée un fichier `backend/src/test.md` avec le texte 'Bonjour depuis l'agent'"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent utilise `write` pour créer le fichier. Vérifiez avec `ls backend/src/test.md`.

**Explications :**
- L'outil `write` crée ou écrase un fichier
- L'agent confirme l'opération
- C'est l'équivalent de "Nouveau fichier → Enregistrer" dans WinDev
- N'oubliez pas de supprimer le fichier de test après !

</details>

---

### Exercice 4 — Exécuter une commande

Demandez : *"Lance `npm run lint` et dis-moi s'il y a des erreurs"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent utilise `bash` pour exécuter la commande, puis analyse la sortie.

**Explications :**
- L'outil `bash` exécute des commandes shell
- Le modèle interprète le résultat (succès/erreur)
- C'est comme exécuter une commande dans le terminal de WinDev

</details>

---

## Ressources pour aller plus loin

- [Comparatif d'agents de codage](https://artificialanalysis.ai/)
- [GitHub - Agents de codage open-source](https://github.com/topics/coding-agent)
