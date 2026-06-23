# Zod — Validation de schémas

## Qu'est-ce que Zod ?

**Zod** est une bibliothèque de **validation de données** pour TypeScript. Elle permet de définir des **schémas** qui décrivent la forme attendue des données, puis de valider que les données reçues respectent ces schémas.

> **Analogie WinDev** : Zod ≈ les contrôles de saisie + les descriptions de champs d'un fichier HFSQL. Vous définissez la structure attendue, et Zod vérifie que les données correspondent.

### Pourquoi Zod dans ce projet ?

Zod est utilisé dans le package `common/` pour partager les schémas de validation entre le **backend** et le **frontend** :

- **Backend** : Valide les requêtes entrantes (body, params, query) avant de les traiter
- **Frontend** : Valide les formulaires avant de les envoyer à l'API

Un seul schéma, deux utilisations — plus de dérive entre les validations.

## Schémas de base

```typescript
import { z } from 'zod';

// Schéma simple
const createClientSchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  email: z.string().email().optional(),
});

// Zod déduit automatiquement le type TypeScript
type CreateClientInput = z.infer<typeof createClientSchema>;
// = { name: string; description?: string | undefined }
```

### Modificateurs courants

```typescript
z.string()                    // Chaîne obligatoire
z.string().optional()         // Chaîne optionnelle (peut être absente)
z.string().nullable()         // Peut être null
z.string().min(3)             // Minimum 3 caractères
z.string().email()            // Doit être un email valide
z.number().int().positive()   // Entier positif
z.date()                      // Date
z.coerce.date()               // Convertit string → Date automatiquement
z.enum(["A", "B", "C"])      // Valeur parmi une liste fermée
```

## Validation

```typescript
const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

// Validation — retourne les données typées ou lance une erreur
try {
  const data = schema.parse({ name: "Alice", age: 30 });
  // data est typé { name: string; age: number }
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors);
    // [{ code: "too_small", path: ["name"], ... }]
  }
}
```

## Zod dans ce projet

Les schémas sont dans `common/src/schemas/` et exportés via `common/src/index.ts` :

```
common/src/schemas/
├── auth.schema.ts       # Login, JwtPayload, LoginResponse
├── client.schema.ts     # Client, CreateClientInput, UpdateClientInput
├── id-param.schema.ts   # { id: number } (réutilisé partout)
├── invoice.schema.ts    # Invoice, InvoiceStatus, CreateInvoiceInput
├── invoice-line.schema.ts # InvoiceLine, CreateInvoiceLineInput
├── pagination.schema.ts # PaginationInput, PaginatedResponse
├── prestation.schema.ts # Prestation, CreatePrestationInput
├── role.schema.ts       # ADMIN | EDITOR | VIEWER
└── user.schema.ts       # User
```

### Utilisation côté backend

Le middleware `validateMiddleware` utilise les schémas Zod pour valider les requêtes :

```typescript
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'EDITOR'),
  validateMiddleware({ body: createClientSchema }, controller.create)
);
```

### Utilisation côté frontend

Le formulaire utilise le composable `useZodForm` qui applique directement les schémas Zod pour la validation côté client :

```typescript
import { useZodForm } from '@/composables/useZodForm';
import { createClientSchema } from '@chdev/common';

const { form, errors, validate, isDirty } = useZodForm(
  createClientSchema,
  { companyName: '', email: '' }
);
```

> **Note** : Le projet n'utilise plus `vee-validate`. La validation est gérée directement via `useZodForm` qui utilise Zod en interne avec les fonctions `watch` et `computed` de Vue.

## Ressources pour aller plus loin

- [Documentation officielle Zod](https://zod.dev/)
- [Zod — Quickstart](https://zod.dev/?id=quick-start)
