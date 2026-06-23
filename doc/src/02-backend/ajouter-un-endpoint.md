# Ajouter un endpoint Backend — Guide pas-à-pas

Ce guide vous montre comment ajouter une nouvelle resource (une nouvelle "table") dans le backend, en suivant l'architecture du projet.

Nous allons créer une resource **"Categorie"** avec les champs : `nom` (string obligatoire) et `description` (string optionnel).

---

## Étape 1 — Créer l'Entity

**Fichier** : `backend/src/entities/categorie.entity.ts`

L'entity définit la structure de la table en base de données :

```typescript
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Projet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  nom!: string;

  @Column({ type: 'real', nullable: true })
  budget?: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
```

---

## Étape 2 — Créer la migration

**Fichier** : `backend/src/migrations/XXXXXXX-CreateCategorie.ts`

Une migration crée ou modifie les tables en base. TypeORM génère automatiquement les migrations à partir des entities avec `typeorm migration:generate`.

```bash
npm --workspace backend run db:migrate
```
```

Puis exécutez la migration :

```bash
npm --workspace backend run db:migrate
```

---

## Étape 3 — Créer le schéma Zod (dans `common/`)

**Fichier** : `common/src/schemas/categorie.schema.ts`

Le schéma Zod définit la validation des données. Il est partagé entre backend et frontend.

```typescript
import { z } from 'zod';

export const createProjetSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  budget: z.number().optional(),
});

export const updateProjetSchema = z.object({
  nom: z.string().min(1).optional(),
  budget: z.number().optional(),
});

export type CreateProjetInput = z.infer<typeof createProjetSchema>;
export type UpdateProjetInput = z.infer<typeof updateProjetSchema>;
```

**N'oubliez pas d'exporter** depuis `common/src/index.ts` :

```typescript
export * from './schemas/categorie.schema.js';
```

---

## Étape 4 — Créer le Repository

**Fichier** : `backend/src/repositories/categorie.repository.ts`

Le repository gère l'accès aux données :

```typescript
import { AppDataSource } from '../db/connection.js';
import { CategorieEntity } from '../entities/categorie.entity.js';
import type { CreateProjetInput } from '@chdev/common';
import type { PaginationQuery } from '../middlewares/pagination.middleware.js';
import { buildSearchCondition } from '../helpers/build-search-condition.helper.js';

export class CategorieRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(CategorieEntity);
  }

  async findAllPaginated({ skip, take, search, order }: PaginationQuery) {
    const { where, relations } = buildSearchCondition(search, CategorieEntity, ['nom']);
    return Promise.all([
      this.transaction.find(CategorieEntity, { where, skip, take, relations, order }),
      this.transaction.count(CategorieEntity, { where }),
    ]);
  }

  async findById(id: number) {
    return this.transaction.findOne(CategorieEntity, { where: { id } });
  }

  async create(data: CreateCategorieInput): Promise<CategorieEntity> {
    const item = this.transaction.create(CategorieEntity, data);
    return this.transaction.save(item);
  }

  async update(id: number, data: Partial<CategorieEntity>): Promise<CategorieEntity> {
    await this.transaction.update(CategorieEntity, id, data);
    return this.findById(id) as Promise<CategorieEntity>;
  }

  async delete(id: number) {
    return this.transaction.delete(CategorieEntity, id);
  }
}
```

---

## Étape 5 — Créer le Controller

**Fichier** : `backend/src/controllers/categorie.controller.ts`

Le controller gère la logique HTTP :

```typescript
import { withTransaction } from '../helpers/with-transaction.helper.js';
import { CategorieRepository } from '../repositories/categorie.repository.js';
import type { CreateCategorieInput, IdParamInput, UpdateCategorieInput } from '@chdev/common';
import type { Request, Response } from 'express';
import type { PaginatedRequest } from '../middlewares/pagination.middleware.js';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

export class CategorieController {
  async getAll(_req: Request, res: Response) {
    const result = await withTransaction(async (transaction) => {
      const repository = CategorieRepository.create(transaction);
      return repository.findAll();
    });
    res.json(result);
  }

  async getAllPaginated({ query }: PaginatedRequest, res: Response) {
    const result = await withTransaction(async (transaction) => {
      const repository = CategorieRepository.create(transaction);
      return repository.findAllPaginated(query);
    });
    const [data, total] = result;
    res.json({ data, total });
  }

  async getById(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = CategorieRepository.create(transaction);
      return repository.findById(id);
    });
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  },

  async create({ body }: TypedRequest<CreateCategorieInput>, res: Response) {
    const result = await withTransaction(async (transaction) => {
      const repository = CategorieRepository.create(transaction);
      const saved = await repository.create(body);
      return repository.findById(saved.id);
    });
    res.status(201).json(result);
  }

  async update({ body, params }: TypedRequest<UpdateCategorieInput, IdParamInput>, res: Response) {
    const { id } = params;
    const result = await withTransaction(async (transaction) => {
      const repository = CategorieRepository.create(transaction);
      return repository.update(id, body);
    });
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  }

  async remove(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = CategorieRepository.create(transaction);
      return repository.delete(id);
    });
    if (result.affected === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  }
}

export const categorieController = new CategorieController();
```

---

## Étape 6 — Créer les Routes

**Fichier** : `backend/src/routes/categories.routes.ts`

Les routes définissent les chemins HTTP et enchaînent les middlewares :

```typescript
import { createCategorieSchema, idParamSchema, updateCategorieSchema } from '@chdev/common';
import { Router } from 'express';
import { categorieController } from '../controllers/categorie.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';

const router = Router();

// Lecture — tous les utilisateurs authentifiés
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), categorieController.getAll);
router.get(
  '/paginated',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, categorieController.getAllPaginated)
);
router.get(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, categorieController.getById)
);

// Écriture — EDITOR et ADMIN uniquement
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createCategorieSchema }, categorieController.create)
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: updateCategorieSchema, params: idParamSchema }, categorieController.update)
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ params: idParamSchema }, categorieController.remove)
);

export { router as categoriesRouter };
```

---

## Étape 7 — Enregistrer le router

**Fichier** : `backend/src/routes/index.ts`

Ajoutez votre router dans le fichier d'index :

```typescript
import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { categoriesRouter } from './categories.routes.js';  // ← Ajout
import { clientsRouter } from './clients.routes.js';
import { invoicesRouter } from './invoices.routes.js';
import { prestationsRouter } from './prestations.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/clients', clientsRouter);
router.use('/categories', categoriesRouter);
router.use('/prestations', prestationsRouter);
router.use('/invoices', invoicesRouter);

export const routes = router;
```

---

## Résultat

Votre API expose maintenant ces endpoints :

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/categories` | Lister toutes les catégories |
| `GET` | `/api/categories/paginated` | Lister avec pagination |
| `GET` | `/api/categories/:id` | Obtenir une catégorie |
| `POST` | `/api/categories` | Créer une catégorie |
| `PUT` | `/api/categories/:id` | Modifier une catégorie |
| `DELETE` | `/api/categories/:id` | Supprimer une catégorie |

---

## Checklist récapitulative

Quand vous ajoutez une nouvelle resource, vérifiez que vous avez créé/modifié :

- [ ] Entity (`backend/src/entities/`)
- [ ] Migration (`backend/src/migrations/`)
- [ ] Schéma Zod (`common/src/schemas/`) + export dans `common/src/index.ts`
- [ ] Repository (`backend/src/repositories/`)
- [ ] Controller (`backend/src/controllers/`)
- [ ] Routes (`backend/src/routes/`)
- [ ] Enregistrement dans `backend/src/routes/index.ts`
