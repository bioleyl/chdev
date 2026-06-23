# MCP et intégrations externes

## Qu'est-ce que MCP ?

**MCP** (Model Context Protocol) est un **protocole standard** qui permet de connecter des outils externes à un agent d'IA. Il définit un langage commun pour que l'agent puisse communiquer avec des serveurs de données, des APIs, des bases de données, etc.

> **Analogie WinDev** : MCP est comme **ODBC** (Open Database Connectivity) pour l'IA. Tout comme ODBC permet à WinDev de se connecter à n'importe quelle base de données (MySQL, PostgreSQL, Oracle…) avec un seul standard, MCP permet à l'agent de se connecter à n'importe quel outil externe avec un seul protocole.

### Pourquoi MCP existe-t-il ?

Sans MCP, chaque agent devrait avoir son intégration personnalisée pour chaque outil :

```
Sans MCP :
  Agent A → Intégration GitHub spécifique
  Agent A → Intégration Slack spécifique
  Agent B → Intégration GitHub différente
  Agent B → Intégration Slack différente
  (Duplication, incompatibilité)

Avec MCP :
  Serveur MCP GitHub ←─── Agent A
  Serveur MCP GitHub ←─── Agent B
  Serveur MCP Slack  ←─── Agent A
  Serveur MCP Slack  ←─── Agent B
  (Un serveur, plusieurs agents)
```

### Architecture MCP

```
Agent (pi, Claude Code…)
    ↓
Client MCP (connecte l'agent aux serveurs)
    ↓
    ├─ Serveur MCP GitHub (issues, pull requests)
    ├─ Serveur MCP PostgreSQL (requêtes SQL)
    ├─ Serveur MCP Filesystem (explorer des fichiers)
    └─ Serveur MCP Custom (votre outil)
```

## MCP et agents de codage

Le support de MCP varie selon l'agent utilisé. Certains agents l'intègrent nativement, d'autres préfèrent d'autres mécanismes d'extensibilité.

> **Note** : Pour les agents qui ne supportent pas MCP nativement, les outils intégrés (`read`, `bash`, `write`, `edit`) couvrent généralement la plupart des besoins.

### Pourquoi certains agents n'utilisent pas MCP

| Raison | Explication |
|--------|-------------|
| **Simplicité** | MCP ajoute une couche de complexité (serveurs, configuration, protocole) |
| **Outils intégrés** | Les agents ont déjà des outils intégrés qui couvrent la plupart des besoins |
| **Extensions** | Les extensions natives offrent plus de flexibilité que MCP |
| **Philosophie** | Certains agents restent minimalistes — ajoutez ce dont vous avez besoin |

### Alternative à MCP

| Besoin | Solution MCP | Alternative sans MCP |
|--------|-------------|---------------------|
| Accéder à une base de données | Serveur MCP PostgreSQL | `bash` → outil CLI de la base |
| Lire des fichiers distants | Serveur MCP Filesystem | `bash` → `curl`, `ssh` |
| Interagir avec GitHub | Serveur MCP GitHub | `bash` → CLI GitHub |
| Outil personnalisé | Serveur MCP custom | Extension de l'agent |

## Autres protocoles et intégrations

### API REST

L'agent peut appeler des APIs REST via `bash` + `curl` :

```bash
# Exemple : appeler une API
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer $API_KEY"
```

> **Analogie WinDev** : C'est comme utiliser `HTTPExécute()` dans WinDev pour appeler un service web.

### Webhooks

Pour recevoir des notifications externes, une extension peut exposer un serveur HTTP :

```typescript
// Dans une extension pi
import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.url === "/webhook") {
    // Traiter le webhook
    res.writeHead(200);
    res.end("OK");
  }
});

server.listen(3001);
```

### Intégration avec ce projet

Pour ce projet, voici les intégrations utiles via les outils de l'agent :

| Outil | Comment l'utiliser avec l'agent |
|-------|--------------------------------|
| **Git** | `bash` → `git status`, `git diff`, `git log` |
| **GitHub CLI** | `bash` → `gh pr create`, `gh issue list` |
| **SQLite** | `bash` → `sqlite3 ./data/chdev.db "SELECT * FROM factures"` |
| **npm** | `bash` → `npm install`, `npm run build` |
| **API du projet** | `bash` → `curl http://localhost:3000/api/factures` |

## Configuration MCP

Voici comment configurer MCP avec les agents qui le supportent :

### Claude Code

Fichier `.claude/settings.json` :

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgresql", "postgresql://localhost/mydb"]
    }
  }
}
```

### Cursor

Fichier `cursor/settings.json` (via les paramètres) :

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

### Liste de serveurs MCP populaires

| Serveur | Rôle | Installation |
|---------|------|-------------|
| **Filesystem** | Explorer des fichiers | `@modelcontextprotocol/server-filesystem` |
| **GitHub** | Issues, PRs, repos | `@modelcontextprotocol/server-github` |
| **PostgreSQL** | Requêtes SQL | `@modelcontextprotocol/server-postgresql` |
| **Puppeteer** | Automatisation navigateur | `@anthropic/mcp-server-puppeteer` |
| **Slack** | Messages, canaux | `@modelcontextprotocol/server-slack` |

## Exercices pratiques

> 💡 **Conseil** : Ces exercices utilisent les outils intégrés de l'agent (pas MCP).

### Exercice 1 — Interroger la base de données

Demandez : *"Exécute `sqlite3 ./data/chdev.db '.tables'` et liste les tables"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent utilise `bash` pour exécuter la commande SQLite et liste les tables disponibles.

**Explications :**
- `bash` remplace un serveur MCP PostgreSQL pour SQLite
- La commande `sqlite3` est l'outil en ligne de commande de SQLite
- C'est l'équivalent de l'explorateur de base de données de WinDev

</details>

---

### Exercice 2 — Appeler l'API du projet

Demandez : *"Lance le backend avec `npm run dev:api &`, puis fais `curl http://localhost:3000/api/health`"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent lance le serveur et appelle l'API avec curl.

**Explications :**
- `bash` permet d'exécuter des commandes et d'appeler des APIs
- `curl` est l'équivalent de `HTTPExécute()` dans WinDev
- L'agent analyse la réponse JSON et vous l'explique

</details>

---

### Exercice 3 — Utiliser Git via l'agent

Demandez : *"Montre-moi les 5 derniers commits avec `git log --oneline -5`"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent exécute la commande git et présente l'historique.

**Explications :**
- `bash` donne accès à toutes les commandes shell
- Git est disponible comme n'importe quelle autre commande
- C'est comme utiliser l'historique de WinDev mais en ligne de commande

</details>

---

## Ressources pour aller plus loin

- [Spécification MCP](https://modelcontextprotocol.io/)
- [Registry de serveurs MCP](https://github.com/modelcontextprotocol/servers)
- [Documentation officielle MCP](https://modelcontextprotocol.io/docs)
