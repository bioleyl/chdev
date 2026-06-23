# Backend — Vue d'ensemble

## Technologies utilisées

| Technologie | Rôle | Analogie WinDev |
|-------------|------|-----------------|
| **Express** | Framework web (serveur HTTP, routes, middlewares) | Le serveur HTTP / les pages web |
| **TypeORM** | ORM (Object-Relational Mapping) — accès à la base de données | Les fichiers HFSQL + les requêtes 4D |
| **SQLite** | Base de données légère (fichier unique) | HFSQL en mode fichier |
| **Zod** | Validation des données | Contrôles de saisie |
| **JWT** | Authentification par jeton | Gestion de session |

## Structure du backend

```
backend/src/
├── index.ts                    # Point d'entrée (lance le serveur)
├── app.ts                      # Configuration Express (middlewares globaux, routes)
├── controllers/                # Logique métier des endpoints
├── repositories/               # Accès aux données (CRUD TypeORM)
├── entities/                   # Modèles de base de données (tables)
├── routes/                     # Définition des routes HTTP + middlewares
├── middlewares/                # Middlewares (auth, validation, pagination)
├── migrations/                 # Migrations de base de données
├── helpers/                    # Fonctions utilitaires
└── db/                         # Connexion DB, seeds
```

## Comment ça fonctionne — Le flux d'une requête

```
Client → Route → Middleware(s) → Controller → Repository → Base de données
                  ↓                    ↓
              Validation          Logique métier
              Auth / Rôle
```

1. Le client envoie une requête HTTP (ex: `POST /api/clients`)
2. **Express** route la requête vers le bon handler selon l'URL et la méthode
3. Les **middlewares** s'exécutent dans l'ordre : auth → rôle → validation
4. Le **controller** reçoit les données validées et applique la logique métier
5. Le **repository** accède à la base de données via TypeORM
6. La réponse est renvoyée au client

## Démarrer le backend

```bash
# Mode développement (rechargement automatique)
npm run dev:api

# Compiler
npm --workspace backend run build

# Migrer la base de données
npm --workspace backend run db:migrate

# Remplir la base avec des données de test
npm --workspace backend run db:seed
```

## Fichier de configuration

Le backend lit les variables d'environnement depuis un fichier `.env` :

```
PORT=3000
DB_PATH=./data/chdev.db
JWT_SECRET=votre-secret-ici
NODE_ENV=development
```

> Le fichier `.env` est dans `.gitignore` — ne le committez jamais. Créez-le localement.

## Prochaines étapes

- **[Architecture](./architecture.md)** — Comprendre pourquoi chaque couche existe
- **[Middlewares](./middlewares.md)** — Auth, validation, pagination en détail
- **[Ajouter un endpoint](./ajouter-un-endpoint.md)** — Guide pas-à-pas complet
