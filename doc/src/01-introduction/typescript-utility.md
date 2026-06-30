# Typescript avancé: les **utility types**

## 1. La base: L'interface Personne

Commençons par quelque chose de simple. Une classe Windev a des propriétés. Ici, nous avons une interface appelée `Personne`. Elle a une clé `id`, une clé `firstName` et une clé `age`. Elle a aussi deux propriétés optionnelles: `department` et `building`.

```typescript
interface Personne {
  id: string;
  firstName: string;
  age: number;
  department?: string; // Optionnel : ?
  building?: string;   // Optionnel : ?
}
```

## 2. Une fonction simple pour tester

Disons que nous voulons afficher les informations d'une personne. En TypeScript, quand vous écrivez une variable dans une interpolation (entre `${}`), vous devez souvent
dire à TypeScript quel type cette variable est. Sinon, il va se plaindre.

```typescript
const personne: Personne = {
  id: "12345",
  firstName: "Virginie",
  age: 44,
}

console.log(`La personne ${personne.id} s'appelle ${personne.firstName} et a ${personne.age} ans.`);
console.log(personne.department)

```

Mais attendez, que se passe-t-il si `personne.department `n'est pas défini ? Si vous essayez d'accéder à `personne.department` sans vérification préalable, TypeScript va vous dire: "C'est sûr ?". C'est pour cela qu'il faut parfois forcer le type.

## 3. Surcharge(Extra) : Ajouter des propriétés

Imaginons que vous vouliez créer une nouvelle interface qui étend `Personne` mais ajoute une clé supplémentaire, disons `isManager`.

```typescript
interface PersonneManager extends Personne {
  isManager: boolean;
}
```

Maintenant, si vous créez un objet de type `PersonneManager`, vous pouvez utiliser la syntaxe `{...personne, isManager: true }`. C'est comme copier-coller les propriétés de personne et d'ajouter `isManager` en plus. C'est très utile pour construire des objets complexes rapidement.

```typescript
const personneManager: PersonneManager = {
  id: "123",
  firstName: "John",
  age: 30,
  department: "IT",
  building: "Bâtiment A",
  isManager: true // C'est la nouvelle clé ajoutée
};
```

## 4. Forcer une propriété: Required

Supposons que vous vouliez forcer la présence de `department` et `building`. Par défaut, elles sont optionnelles (avec le `?`).
Pour les rendre obligatoires, vous pouvez utiliser l'outil `Required`. Il prend une interface et en crée une nouvelle où toutes les propriétés optionnelles deviennent obligatoires.

```typescript
interface PersonneObligatoire extends Required<Personne> {
  // PersonneObligatoire a maintenant department et building obligatoires
}
```

Maintenant, si vous essayez de créer une instance de `PersonneObligatoire` sans donner de valeur à department, TypeScript vous dira que c'est une erreur. C'est strict.

## 5. Rendre une propriété optionnelle: Partial

Au contraire de `Required`, l'outil `Partial` permet de rendre une ou plusieurs propriétés optionnelles. Vous pouvez l'utiliser sur une interface entière ou sur des propriétés spécifiques en utilisant des notation de type.

Par exemple, pour rendre seulement `department` et `building` optionnelles dans `PersonneObligatoire`:

```typescript
interface PersonnePartiel extends Omit<Required<Personne>, "department" | "building"> {
  department?: string;
  building?: string;
}
```

Ou plus simplement, pour rendre toutes les propriétés d'une interface optionnelles :

```typescript
type PersonneTouteOptionnelle = Partial<Personne>;
```

Maintenant, `PersonneTouteOptionnelle` a toutes ses propriétés optionnelles, même `id` et `firstName`. Vous pouvez créer une instance vide ou partiellement remplie.

```typescript
interface PersonnePartiel extends Omit<Required<Personne>, "department" | "building"> {
  department?: string;
  building?: string;
}
```

```typescript
const personnePartielle: PersonneTouteOptionnelle = {
  id: "456",
  firstName: "Jane",
  department: "HR" // age et building sont optionnels ici
};
```

## 6. En résumé

Voici un exemple complet qui combine tout:

```typescript
interface Personne {
  id: string;
  firstName: string;
  age: number;
  department?: string;
  building?: string;
}
```

```typescript
interface PersonneManager extends Personne {
  isManager: boolean;
}
```

```typescript
interface PersonneObligatoire extends Required<Personne> {
  // department et building sont obligatoires ici
}
```

```typescript
type PersonnePartiel = Partial<Personne>;
```

```typescript
const personne2: Personne = {
  id: "1",
  firstName: "Bob",
  age: 25
  // department et building sont optionnels, on peut les omettre
};
```

```typescript
const personneManager2: PersonneManager = {
  ...personne2,
  isManager: true
};
```

```typescript
const personneObligatoire: PersonneObligatoire = {
  id: "2",
  firstName: "Alice",
  age: 30,
  department: "Finance", // Obligatoire ici
  building: "Bâtiment C" // Obligatoire ici
};
```

```typescript
const personnePartielle: PersonnePartiel = {
  id: "3",
  department: "Research" // age n'est pas nécessaire ici
};
```

```typescript
console.log(`La personne ${personne.id} s'appelle ${personne.firstName} et a ${personne.age} ans.`);
console.log(`Le manager ${personneManager.id} s'appelle ${personneManager.firstName} et a ${personneManager.age} ans.`);
```
