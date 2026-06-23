# Middlewares

## Qu'est-ce qu'un middleware ?

Un **middleware** est une fonction intermédiaire qui s'exécute entre la réception de la requête et l'appel du controller. Elle peut :

- **Vérifier** quelque chose (authentification, rôle)
- **Transformer** la requête (validation, parsing)
- **Bloquer** la requête (renvoyer une erreur)
- **Enrichir** la requête (ajouter des données à `req`)

> **Analogie WinDev** : Un middleware ≈ une procédure appelée avant l'ouverture d'une page, qui vérifie les droits d'accès ou prépare des données.

Dans Express, les middlewares s'enchaînent dans l'ordre :

```typescript
router.get('/', middleware1, middleware2, controller);
// Exécution : middleware1 → middleware2 → controller
```

Chaque middleware appelle `next()` pour passer au suivant, ou renvoie une réponse pour arrêter la chaîne.

## authMiddleware — Authentification JWT

**Fichier** : `backend/src/middlewares/auth.middleware.ts`

Vérifie que la requête contient un **jeton JWT valide** dans l'en-tête `Authorization`.

```typescript
// Ce que le middleware fait :
// 1. Lit req.headers.authorization
// 2. Attend "Bearer <token>"
// 3. Vérifie le token avec jwt.verify()
// 4. Si valide → ajoute req.user (le payload décodé) et appelle next()
// 5. Si invalide → renvoie 401
```

### Comment l'utiliser

```typescript
router.get('/', authMiddleware, controller.getAll);
```

### Comment le client envoie le token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Dans ce projet, le frontend gère cela automatiquement via `api.service.ts` :

```typescript
if (authService.token) {
  headers['Authorization'] = `Bearer ${authService.token}`;
}
```

## requireRole() — Contrôle d'accès par rôle

**Fichier** : `backend/src/middlewares/auth.middleware.ts`

C'est une **fabrique de middleware** (une fonction qui retourne un middleware). Elle vérifie que l'utilisateur authentifié a un rôle autorisé.

```typescript
// Seuls ADMIN et EDITOR peuvent accéder
router.post('/', authMiddleware, requireRole('ADMIN', 'EDITOR'), controller.create);

// Tout le monde (authentifié) peut lire
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), controller.getAll);
```

### Rôles disponibles

| Rôle | Permissions |
|------|-------------|
| `ADMIN` | Tout |
| `EDITOR` | Lecture + Écriture |
| `VIEWER` | Lecture seule |

> **Important** : `requireRole()` doit **toujours** être placé **après** `authMiddleware`, car il lit `req.user` qui est ajouté par `authMiddleware`.

## validateMiddleware — Validation avec Zod

**Fichier** : `backend/src/middlewares/validate.middleware.ts`

Valide les données entrantes (body, params, query) en utilisant les schémas **Zod** du package `common/`.

```typescript
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createClientSchema }, clientController.create)
);
```

### Ce qu'il fait

1. Prend les schémas Zod pour `body`, `params` et/ou `query`
2. Valide les données de la requête contre ces schémas
3. Si valide → les données typées sont disponibles dans le controller via `TypedRequest`
4. Si invalide → renvoie `422 Unprocessable Entity` avec les détails des erreurs

### Réponse en cas d'erreur

```json
{
  "status": "fail",
  "errors": [
    { "path": "name", "message": "Name is required" }
  ]
}
```

### TypedRequest — Typage dans le controller

Grâce à `validateMiddleware`, le controller reçoit un `TypedRequest` au lieu d'un `Request` classique :

```typescript
// Au lieu de :
// req.body → unknown (il faut caster)

// On a :
// req.body → CreateClientInput (typé automatiquement par Zod)
async create({ body }: TypedRequest<CreateClientInput>, res: Response) {
  // body.name est connu comme string
  const saved = await exampleRepository.create(body);
}
```

## paginationMiddleware — Pagination serveur

**Fichier** : `backend/src/middlewares/pagination.middleware.ts`

Gère la pagination côté serveur pour les tableaux Vuetify (`v-data-table`). Il combine la validation Zod avec une transformation des paramètres.

```typescript
router.get(
  '/paginated',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, exampleController.getAllPaginated)
);
```

### Paramètres attendus (côté client)

| Paramètre | Description | Défaut |
|-----------|-------------|--------|
| `page` | Numéro de page (base 1) | 1 |
| `itemsPerPage` | Nombre d'items par page | 10 |
| `search` | Texte de recherche | — |
| `sortBy` | Champ de tri | `id` |
| `sortDesc` | Tri descendant | `false` |

### Transformation

Le middleware convertit les paramètres Vuetify en paramètres TypeORM :

```
page=2, itemsPerPage=10  →  skip=10, take=10
sortBy=name, sortDesc=true  →  order: { name: 'DESC' }
```

Le controller reçoit un `PaginatedRequest` avec `query` transformé :

```typescript
async getAllPaginated({ query }: PaginatedRequest<null, null>, res: Response) {
  const [clients, total] = await clientRepository.findAllPaginated(query);
  res.json({ data: clients, total });
}
```

## Résumé des middlewares

| Middleware | Rôle | Doit être avant | Retourne en cas d'erreur |
|------------|------|-----------------|--------------------------|
| `authMiddleware` | Vérifie le JWT | `requireRole()` | 401 |
| `requireRole(...)` | Vérifie le rôle | — | 403 |
| `validateMiddleware` | Valide body/params/query | Controller | 422 |
| `paginationMiddleware` | Valide + transforme pagination | Controller | 422 |
