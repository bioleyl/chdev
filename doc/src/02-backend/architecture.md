# Architecture Backend

## Pourquoi séparer le code en plusieurs couches ?

En WinDev, vous pouvez mettre tout dans un gestionnaire d'événement de page. Mais quand le projet grandit, ça devient ingérable. Ce projet utilise une **architecture en couches** pour séparer les responsabilités.

Chaque couche a **un seul rôle** :

```
Route          → "Quel chemin HTTP ? Quel middleware ? Quel handler ?"
Middleware     → "L'utilisateur est-il authentifié ? Les données sont-elles valides ?"
Controller     → "Quelle logique métier appliquer ? Quelle réponse renvoyer ?"
Repository     → "Comment accéder aux données en base ?"
Entity         → "Quelle est la structure de la table en base ?"
```

## Entity — Le modèle de données

L'**entity** définit la structure d'une table en base de données, via les décorateurs TypeORM :

```typescript
// backend/src/entities/client.entity.ts
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InvoiceEntity } from './invoice.entity.js';

@Entity()
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', nullable: true })
  companyName!: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'integer', nullable: true })
  zipCode?: number;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'real', default: 0 })
  totalBilled!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.client)
  invoices!: Array<InvoiceEntity>;
}
```

> **Analogie WinDev** : L'entity ≈ la description d'un fichier HFSQL (champs, types, clés).

### Décorateurs TypeORM courants

| Décorateur | Rôle |
|------------|------|
| `@Entity()` | Marque la classe comme une table de la base |
| `@PrimaryGeneratedColumn()` | Clé primaire auto-incrémentée |
| `@Column()` | Champ de la table |
| `@CreateDateColumn()` | Date de création (remplie automatiquement) |
| `@UpdateDateColumn()` | Date de modification (mise à jour automatique) |
| `@OneToMany()` / `@ManyToOne()` | Relations entre tables |

## Repository — L'accès aux données

Le **repository** centralise toutes les opérations sur une entity. C'est la seule couche qui parle directement à la base de données.

```typescript
// backend/src/repositories/client.repository.ts
import { BaseRepository } from '../common/base-repository.js';
import { ClientEntity } from '../entities/client.entity.js';
import { buildSearchCondition } from '../helpers/build-search-condition.helper.js';
import type { Client, CreateClientInput } from '@chdev/common';
import type { DeleteResult } from 'typeorm';
import type { PaginationQuery } from '../middlewares/pagination.middleware.js';

export class ClientRepository extends BaseRepository {
  async findAll() {
    return this.transaction.find(ClientEntity);
  }

  async findAllPaginated({ skip, take, search, order }: PaginationQuery) {
    const { where, relations } = buildSearchCondition(search, ClientEntity, ['companyName', 'email']);
    return Promise.all([
      this.transaction.find(ClientEntity, { where, skip, take, relations, order }),
      this.transaction.count(ClientEntity, { where }),
    ]);
  }

  async findById(id: number) {
    return this.transaction.findOne(ClientEntity, { where: { id }, relations: ['invoices'] });
  }

  async create(data: CreateClientInput): Promise<ClientEntity> {
    const client = this.transaction.create(ClientEntity, data);
    return this.transaction.save(client);
  }

  async update(id: number, data: Partial<Client>): Promise<ClientEntity> {
    await this.transaction.update(ClientEntity, id, data);
    return this.findById(id) as Promise<ClientEntity>;
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.transaction.delete(ClientEntity, id);
  }
}
```

> **Pourquoi un repository et pas appeler TypeORM directement dans le controller ?**
> - **Séparation des responsabilités** : Le controller ne devrait pas savoir comment la base de données fonctionne
> - **Testabilité** : On peut remplacer le repository par un mock pour les tests
> - **Réutilisation** : La même requête peut être utilisée par plusieurs controllers
> - **Maintenance** : Si on change de base de données, on modifie un seul endroit

## Controller — La logique métier

Le **controller** gère la requête HTTP : il reçoit les données, appelle le repository, et renvoie la réponse.

```typescript
// backend/src/controllers/client.controller.ts
import { withTransaction } from '../helpers/with-transaction.helper.js';
import { ClientRepository } from '../repositories/client.repository.js';
import type { CreateClientInput, IdParamInput, UpdateClientInput } from '@chdev/common';
import type { Request, Response } from 'express';
import type { PaginatedRequest } from '../middlewares/pagination.middleware.js';
import type { TypedRequest } from '../middlewares/validate.middleware.js';

export class ClientController {
  async getAll(_req: Request, res: Response) {
    const clients = await withTransaction(async (transaction) => {
      const repository = ClientRepository.create(transaction);
      return repository.findAll();
    });
    res.json(clients);
  }

  async create({ body }: TypedRequest<CreateClientInput>, res: Response) {
    const result = await withTransaction(async (transaction) => {
      const repository = ClientRepository.create(transaction);
      const saved = await repository.create(body);
      return repository.findById(saved.id);
    });
    res.status(201).json(result);
  }

  async remove(req: TypedRequest<null, IdParamInput>, res: Response) {
    const { id } = req.params;
    const result = await withTransaction(async (transaction) => {
      const repository = ClientRepository.create(transaction);
      return repository.delete(id);
    });
    if (result.affected === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(204).send();
  }
}

export const clientController = new ClientController();
```

> **Pourquoi un controller ?**
> - **Organisation** : Chaque resource a son fichier controller
> - **Clarté** : On voit immédiatement quelles opérations HTTP sont supportées
> - **Réutilisation** : Le même controller peut être utilisé par plusieurs routes

## Routes — L'entrée HTTP

Le fichier de **routes** définit les chemins HTTP et enchaîne les middlewares :

```typescript
// backend/src/routes/clients.routes.ts
import { createClientSchema, idParamSchema, updateClientSchema } from '@chdev/common';
import { Router } from 'express';
import { clientController } from '../controllers/client.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { paginationMiddleware } from '../middlewares/pagination.middleware.js';
import { validateMiddleware } from '../middlewares/validate.middleware.js';

const router = Router();

// Lecture — tous les utilisateurs authentifiés
router.get('/', authMiddleware, requireRole('ADMIN', 'EDITOR', 'VIEWER'), clientController.getAll);
router.get('/paginated',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  paginationMiddleware({}, clientController.getAllPaginated)
);
router.get('/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR', 'VIEWER'),
  validateMiddleware({ params: idParamSchema }, clientController.getById)
);

// Écriture — EDITOR et ADMIN uniquement
router.post('/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createClientSchema }, clientController.create)
);
router.put('/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: updateClientSchema, params: idParamSchema }, clientController.update)
);
router.delete('/:id',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ params: idParamSchema }, clientController.remove)
);

export { router as clientsRouter };
```

Puis il est enregistré dans `routes/index.ts` :

```typescript
import { clientsRouter } from './clients.routes.js';

router.use('/clients', clientsRouter);
```

> **Pourquoi un fichier de routes séparé ?**
> - **Lisibilité** : On voit toutes les routes d'une resource au même endroit
> - **Modularité** : Chaque resource a son fichier, le `index.ts` les assemble
> - **Middlewares par route** : On applique auth, validation, pagination de façon fine

## Schéma Zod — La validation partagée

Les schémas de validation sont dans `common/` et partagés entre backend et frontend :

```typescript
// common/src/schemas/client.schema.ts
import { z } from 'zod';

export const createClientSchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  email: z.string().email().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
```

## Résumé — Le cycle de vie complet

```
POST /api/clients
  │
  ├─ Route: clients.routes.ts → POST '/'
  │
  ├─ Middleware: authMiddleware → Vérifie le JWT
  │
  ├─ Middleware: requireRole('ADMIN', 'EDITOR') → Vérifie le rôle
  │
  ├─ Middleware: validateMiddleware({ body: createClientSchema })
  │         → Valide le body avec Zod
  │
  ├─ Controller: clientController.create
  │         → Appelle clientRepository.create(body)
  │
  ├─ Repository: clientRepository.create
  │         → TypeORM INSERT
  │
  └─ Response: 201 { id: 1, companyName: "...", ... }
```
