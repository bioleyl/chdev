# Exercices TypeScript

> 💡 **Conseil** : Copiez le code dans un fichier `.ts` et lancez `npx tsc --noEmit` pour voir les erreurs de type. Ou utilisez le [TypeScript Playground](https://www.typescriptlang.org/play/) en ligne.

---

## Exercice 1 — Typage de base

Déclarez les variables suivantes avec les types TypeScript appropriés :

1. `prenom` : une chaîne de caractères
2. `age` : un nombre entier
3. `estConnecte` : un booléen
4. `hobbies` : un tableau de chaînes
5. `adresse` : peut être un objet `{ rue: string, ville: string }` ou `null`

<details>
<summary>🔽 Voir la solution</summary>

```typescript
let prenom: string = "Alice";
let age: number = 30;
let estConnecte: boolean = true;
let hobbies: string[] = ["lecture", "sport"];
let adresse: { rue: string; ville: string } | null = null;
```

**Explications :**
- `string`, `number`, `boolean` sont les types primitifs de base
- `string[]` déclare un tableau de chaînes (équivalent : `Array<string>`)
- `| null` est un **type union** : la variable peut être soit l'objet décrit, soit `null`

</details>

---

## Exercice 2 — Interface et optionnel

Créez une interface `Facture` avec les champs suivants :

- `id` : nombre (obligatoire)
- `date` : chaîne (obligatoire)
- `client` : chaîne (obligatoire)
- `total` : nombre (obligatoire)
- `payee` : booléen (optionnel)

Puis déclarez une variable `maFacture` de type `Facture` avec uniquement les champs obligatoires.

<details>
<summary>🔽 Voir la solution</summary>

```typescript
interface Facture {
  id: number;
  date: string;
  client: string;
  total: number;
  payee?: boolean;  // "?" = optionnel
}

const maFacture: Facture = {
  id: 1,
  date: "2024-01-15",
  client: "Dupont SA",
  total: 150.5,
  // payee est optionnel → pas besoin de le fournir
};
```

**Explications :**
- Le `?` après `payee` indique que ce champ est **optionnel** : il peut être absent ou avoir la valeur `undefined`
- TypeScript vérifie que tous les champs **obligatoires** sont présents lors de l'affectation
- Si on omettait `total`, le compilateur signalerait une erreur

</details>

---

## Exercice 3 — Type union (énumération)

Dans ce projet, un utilisateur peut avoir le rôle `"ADMIN"`, `"EDITOR"` ou `"VIEWER"`. Créez un type `Role` qui ne permet **que** ces trois valeurs.

Puis écrivez une fonction `peutModifier(role: Role)` qui retourne `true` si le rôle est `"ADMIN"` ou `"EDITOR"`.

<details>
<summary>🔽 Voir la solution</summary>

```typescript
type Role = "ADMIN" | "EDITOR" | "VIEWER";

function peutModifier(role: Role): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

// Utilisation :
peutModifier("ADMIN");   // true
peutModifier("VIEWER");  // false
peutModifier("HACKER");  // ❌ Erreur de compilation !
```

**Explications :**
- `"ADMIN" | "EDITOR" | "VIEWER"` est un **type union littéral** : seules ces 3 chaînes sont autorisées
- Si on passe `"HACKER"`, TypeScript refuse à la compilation — c'est ça la puissance du typage statique
- Dans ce projet, ce type est défini dans `common/src/schemas/role.schema.ts` via Zod

</details>

---

## Exercice 4 — Interface avec héritage

Créez une interface `EntityMetadata` contenant `id: number`, `createdAt: string` et `updatedAt: string`.

Puis créez une interface `Prestation` qui **étend** `EntityMetadata` et ajoute `nom: string` et `tarif: number`.

<details>
<summary>🔽 Voir la solution</summary>

```typescript
interface EntityMetadata {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface Prestation extends EntityMetadata {
  nom: string;
  tarif: number;
}

const p: Prestation = {
  id: 1,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  nom: "Développement web",
  tarif: 75,
};
```

**Explications :**
- `extends` permet l'**héritage d'interface** : `Prestation` hérite de tous les champs de `EntityMetadata`
- Dans ce projet, `EntityMetadata` est défini dans `frontend/src/types/models.ts` et partagé par toutes les entités
- Cela évite de répéter `id`, `createdAt`, `updatedAt` dans chaque interface

</details>

---

## Exercice 5 — Génériques

Créez une interface générique `ApiResponse<T>` avec deux propriétés :

- `succes: boolean`
- `data: T` (le type est paramétrique)

Puis utilisez-la pour typer :
1. Une réponse contenant un tableau de `Facture` (de l'exercice 2)
2. Une réponse contenant un simple `string`

<details>
<summary>🔽 Voir la solution</summary>

```typescript
interface ApiResponse<T> {
  succes: boolean;
  data: T;
}

// 1. Réponse avec un tableau de Factures
const reponse1: ApiResponse<Facture[]> = {
  succes: true,
  data: [
    { id: 1, date: "2024-01-15", client: "Dupont SA", total: 150.5 },
  ],
};

// 2. Réponse avec une chaîne
const reponse2: ApiResponse<string> = {
  succes: true,
  data: "Opération réussie",
};

// TypeScript sait que reponse1.data est un Facture[]
// et que reponse2.data est un string — automatiquement !
```

**Explications :**
- `<T>` est un **paramètre de type** : on le remplace par le type concret à l'utilisation
- `ApiResponse<Facture[]>` → `data` est typé `Facture[]`
- `ApiResponse<string>` → `data` est typé `string`
- Dans ce projet, le pattern équivalent est `PaginatedResponse<T>` dans `common/src/schemas/pagination.schema.ts`

</details>

---

## Exercice 6 — `unknown` vs `any` (bonus)

On reçoit des données JSON brutes. Déclarez une variable `raw` de type `unknown`, puis écrivez une fonction `extraireNom(raw: unknown)` qui retourne le `nom` si `raw` est un objet avec une propriété `nom` de type `string`, sinon retourne `"Inconnu"`.

<details>
<summary>🔽 Voir la solution</summary>

```typescript
function extraireNom(raw: unknown): string {
  // On ne peut rien faire directement avec unknown — il faut vérifier le type
  if (
    typeof raw === "object" &&
    raw !== null &&
    "nom" in raw &&
    typeof (raw as { nom: unknown }).nom === "string"
  ) {
    return (raw as { nom: string }).nom;
  }
  return "Inconnu";
}

extraireNom({ nom: "Alice" });   // "Alice"
extraireNom({ nom: 42 });        // "Inconnu"
extraireNom("bonjour");          // "Inconnu"
```

**Explications :**
- `unknown` est le contraire de `any` : avec `any`, TypeScript ferme les yeux. Avec `unknown`, il faut **prouver** le type avant d'utiliser la valeur
- C'est plus sûr : on ne peut pas faire `raw.nom` directement, il faut d'abord vérifier la structure
- `as { nom: string }` est un **cast** (transformation de type) — on dit au compilateur "je garantis que c'est ce type"
- Dans ce projet, on voit `unknown` dans les handlers d'erreur : `catch (err: unknown)`

</details>

---

## Exercice 7 — Quiz : `this` en action

### Question 1

Qu'affiche ce code ?

```typescript
const objet = {
  prenom: "Alice",
  direBonjour: function () {
    return () => {
      console.log(`Bonjour, je suis ${this.prenom}`);
    };
  },
};

const salut = objet.direBonjour();
salut(); // Qu'affiche cette ligne ?
```

<details>
<summary>🔽 Voir la réponse</summary>

**Affiche : `Bonjour, je suis Alice`**

**Pourquoi ?**
- `direBonjour` est une **fonction classique**, donc `this.direBonjour()` lie `this` à `objet`
- À l'intérieur, on retourne une **arrow function**. Celle-ci hérite `this` du contexte de `direBonjour` — qui est `objet`
- Donc `this.prenom` résolve bien à `"Alice"`

</details>

---

### Question 2

Même question, mais cette fois avec une arrow function pour `direBonjour` :

```typescript
const objet = {
  prenom: "Alice",
  direBonjour: () => {
    return () => {
      console.log(`Bonjour, je suis ${this.prenom}`);
    };
  },
};

const salut = objet.direBonjour();
salut(); // Qu'affiche cette ligne ?
```

<details>
<summary>🔽 Voir la réponse</summary>

**Affiche : `Bonjour, je est undefined`** (ou une erreur, selon l'environnement)

**Pourquoi ?**
- `direBonjour` est maintenant une **arrow function**, donc elle n'a **pas son propre `this`** — elle hérite de `this` au niveau du module/fichier
- Dans un module ES, `this` au niveau supérieur est `undefined` (en strict mode)
- Même le deuxième `()` est une arrow function, donc il hérite aussi de ce `this` undefined
- Résultat : `this.prenom` est `undefined`

</details>

---

## Résumé des exercices

| Exercice | Concept |
|----------|---------|
| 1 | Types primitifs, tableaux, unions |
| 2 | Interfaces, champs optionnels |
| 3 | Type union littéral (équivalent énumération) |
| 4 | Héritage d'interfaces |
| 5 | Génériques |
| 6 | `unknown` vs `any` |
| 7 | Quiz sur `this` avec fonctions classiques et arrow functions |

---

## Ressources pour aller plus loin

- [Documentation officielle TypeScript](https://www.typescriptlang.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Playground](https://www.typescriptlang.org/play/) — tester du code TypeScript en ligne
- [Total TypeScript — Beginner's Guide](https://www.totaltypescript.com/tutorials/beginner-tutorial)
