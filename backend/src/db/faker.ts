// Faker / random data helpers

import type { InvoiceStatus } from '@chdev/common';

/** Random integer in [min, max] inclusive */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float in [min, max] with given decimal places */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const raw = Math.random() * (max - min) + min;
  return Math.round(raw * 10 ** decimals) / 10 ** decimals;
}

/** Pick a random item from an array */
export function randomItem<T>(arr: ReadonlyArray<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random boolean (weighted) */
export function randomBoolean(weight = 0.5): boolean {
  return Math.random() < weight;
}

/** Random date between two dates */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ── French client data ────────────────────────────────────────────────────────

const firstNames = [
  'Dupont',
  'Martin',
  'Bernard',
  'Petit',
  'Robert',
  'Richard',
  'Durand',
  'Leroy',
  'Moreau',
  'Simon',
  'Laurent',
  'Lefebvre',
  'Michel',
  'Garcia',
  'David',
  'Bertrand',
  'Roux',
  'Vincent',
  'Fournier',
  'Morel',
  'Girard',
  'André',
  'Mercier',
  'Dupuis',
  'Lemaire',
  'Dumas',
  'Pierre',
  'François',
  'Legrand',
  'Gauthier',
  'Perrin',
  'Robin',
  'Masson',
  'Navarro',
  'Louis',
  'Robinet',
  'Camus',
  'Chevalier',
  'Fontaine',
  'Rousseau',
];

const streetTypes = ['rue', 'avenue', 'boulevard', 'place', 'impasse', 'allée', 'chemin', 'passage'];

const cityData: Array<{ name: string; zip: string }> = [
  { name: 'Paris', zip: '75001' },
  { name: 'Lyon', zip: '69001' },
  { name: 'Marseille', zip: '13001' },
  { name: 'Toulouse', zip: '31000' },
  { name: 'Bordeaux', zip: '33000' },
  { name: 'Lille', zip: '59000' },
  { name: 'Nantes', zip: '44000' },
  { name: 'Strasbourg', zip: '67000' },
  { name: 'Montpellier', zip: '34000' },
  { name: 'Nice', zip: '06000' },
  { name: 'Rennes', zip: '35000' },
  { name: 'Grenoble', zip: '38000' },
  { name: 'Dijon', zip: '21000' },
  { name: 'Tours', zip: '37000' },
  { name: 'Cannes', zip: '06400' },
  { name: 'Reims', zip: '51100' },
  { name: 'Le Havre', zip: '76600' },
  { name: 'Saint-Étienne', zip: '42000' },
  { name: 'Brest', zip: '29200' },
  { name: 'Nancy', zip: '54000' },
];

const companySuffixes = [
  'SAS',
  'SARL',
  'SA',
  'SASU',
  'SARL au capital de',
  'Groupe',
  'Solutions',
  'Technologies',
  'Consulting',
  'Partners',
  'Holdings',
  'Innovations',
];

const companyPrefixes = [
  'Tech',
  'Data',
  'Green',
  'Cloud',
  'Smart',
  'Alpha',
  'Blue',
  'Nova',
  'Prime',
  'Apex',
  'Eco',
  'Cyber',
  'Digi',
  'Euro',
  'Atlas',
  'Omega',
  'Zenith',
  'Phoenix',
  'Titan',
  'Vortex',
  'Nexia',
  'Lumina',
  'Pulse',
  'Spectrum',
  'Quantum',
  'Horizon',
  'Meridian',
  'Crest',
  'Summit',
  'Beacon',
];

/** Generate a random French company name */
export function randomCompany(): string {
  const prefix = randomItem(companyPrefixes);
  const noun = randomItem(firstNames);
  const suffix = randomItem(companySuffixes);
  return `${prefix} ${noun} ${suffix}`;
}

/** Generate a random French address */
export function randomAddress(): string {
  const streetNum = randomInt(1, 250);
  const streetType = randomItem(streetTypes);
  const streetName = randomItem(firstNames);
  const city = randomItem(cityData);
  return `${streetNum} ${streetType} ${streetName}, ${city.zip} ${city.name}`;
}

/** Generate a random full name (first + last) */
export function randomFullName(): string {
  const first = randomItem([
    'Jean',
    'Pierre',
    'Marie',
    'Sophie',
    'Luc',
    'Claire',
    'François',
    'Isabelle',
    'Nicolas',
    'Céline',
    'Antoine',
    'Juliette',
    'Maxime',
    'Camille',
    'Thomas',
    'Laura',
  ]);
  const last = randomItem(firstNames);
  return `${first} ${last}`;
}

// ── Prestation data ───────────────────────────────────────────────────────────

interface PrestationFakerData {
  label: string;
  description: string;
  unitPrice: number;
  unit: string;
}

const prestationCategories: Array<Omit<PrestationFakerData, 'label'>> = [
  // Development
  { description: 'Développement front-end et interfaces web', unitPrice: 85, unit: 'h' },
  { description: 'Développement back-end et APIs', unitPrice: 90, unit: 'h' },
  { description: "Développement d'applications mobiles", unitPrice: 95, unit: 'h' },
  { description: 'Intégration de systèmes et middleware', unitPrice: 92, unit: 'h' },
  { description: 'Tests automatisés et assurance qualité', unitPrice: 70, unit: 'h' },
  { description: 'Refactoring et optimisation de code', unitPrice: 80, unit: 'h' },
  { description: 'Développement de plugins et extensions', unitPrice: 75, unit: 'h' },
  { description: 'Migration de bases de données', unitPrice: 88, unit: 'h' },
  { description: 'Développement de services cloud', unitPrice: 95, unit: 'h' },
  { description: 'Implémentation CI/CD et DevOps', unitPrice: 90, unit: 'h' },
  // Design
  { description: "Conception d'interfaces utilisateur", unitPrice: 75, unit: 'h' },
  { description: 'Prototypage et wireframing', unitPrice: 65, unit: 'h' },
  { description: 'Design system et composants UI', unitPrice: 70, unit: 'h' },
  { description: "Recherche utilisateur et tests d'utilisabilité", unitPrice: 80, unit: 'h' },
  { description: 'Design graphique et branding', unitPrice: 65, unit: 'h' },
  { description: 'Illustrations et infographie', unitPrice: 60, unit: 'h' },
  // Consulting
  { description: 'Audit et conseil en architecture logicielle', unitPrice: 120, unit: 'h' },
  { description: 'Conseil en transformation digitale', unitPrice: 110, unit: 'h' },
  { description: 'Étude de faisabilité technique', unitPrice: 100, unit: 'h' },
  { description: 'Conseil en cybersécurité', unitPrice: 130, unit: 'h' },
  { description: 'Optimisation des performances', unitPrice: 115, unit: 'h' },
  { description: 'Conseil en stratégie technique', unitPrice: 125, unit: 'h' },
  // Maintenance
  { description: 'Maintenance corrective et évolutive', unitPrice: 65, unit: 'h' },
  { description: 'Monitoring et supervision 24/7', unitPrice: 55, unit: 'h' },
  { description: 'Gestion des incidents et support', unitPrice: 70, unit: 'h' },
  { description: 'Sauvegarde et gestion de la continuité', unitPrice: 60, unit: 'h' },
  { description: 'Mise à jour et patch management', unitPrice: 50, unit: 'h' },
  // Training
  { description: 'Formation technique sur mesure', unitPrice: 120, unit: 'h' },
  { description: 'Ateliers de coaching technique', unitPrice: 130, unit: 'h' },
  { description: 'Sessions de pair programming', unitPrice: 95, unit: 'h' },
  { description: 'Formation aux bonnes pratiques', unitPrice: 110, unit: 'h' },
  // Licenses & products
  { description: 'Licence annuelle - Édition Standard', unitPrice: 499, unit: 'an' },
  { description: 'Licence annuelle - Édition Premium', unitPrice: 999, unit: 'an' },
  { description: 'Licence annuelle - Édition Enterprise', unitPrice: 2499, unit: 'an' },
  { description: 'Licence perpétuelle - Module de base', unitPrice: 1500, unit: 'U' },
  { description: 'Licence perpétuelle - Module avancé', unitPrice: 3000, unit: 'U' },
  { description: 'Abonnement cloud - Plan Starter', unitPrice: 49, unit: 'an' },
  { description: 'Abonnement cloud - Plan Pro', unitPrice: 149, unit: 'an' },
  { description: 'Abonnement cloud - Plan Enterprise', unitPrice: 499, unit: 'an' },
];

const prestationLabels = [
  'Développement',
  'Design',
  'Consulting',
  'Maintenance',
  'Formation',
  'Licence',
  'Infrastructure',
  'Sécurité',
  'Analyse',
  'Support',
  'Architecture',
  'Déploiement',
  'Automatisation',
  'Data & Analytics',
  'Intégration',
];

const labelAdjectives = [
  'Avancé',
  'Standard',
  'Premium',
  'Basique',
  'Expert',
  'Complet',
  'Essentiel',
  'Professionnel',
  'Intégral',
  'Spécialisé',
  'Sur mesure',
];

/** Generate a random prestation label from category */
function generatePrestationLabel(catIdx: number, adjIdx: number): string {
  const base =
    prestationCategories[catIdx % prestationCategories.length].unit === 'h'
      ? prestationLabels[catIdx % prestationLabels.length]
      : `${prestationLabels[catIdx % prestationLabels.length]} - ${['Logiciel', 'Service', 'Produit'][catIdx % 3]}`;
  if (prestationCategories[catIdx % prestationCategories.length].unit === 'h') {
    return `${base} ${labelAdjectives[adjIdx % labelAdjectives.length]}`;
  }
  return base;
}

/** Generate a single random prestation record */
export function generatePrestation(index: number): PrestationFakerData {
  const catIdx = index % prestationCategories.length;
  const adjIdx = Math.floor(index / prestationCategories.length);
  const cat = prestationCategories[catIdx];
  const unitPrice = cat.unitPrice + randomInt(-10, 20);

  return {
    label: generatePrestationLabel(index, adjIdx),
    description: cat.description,
    unitPrice,
    unit: cat.unit,
  };
}

// ── Invoice line data ─────────────────────────────────────────────────────────

interface InvoiceLineFakerData {
  description: string;
  quantity: number;
  unitPrice: number;
}

const actionVerbs = [
  'Mise en place de',
  'Développement de',
  'Configuration de',
  'Intégration de',
  'Optimisation de',
  'Migration de',
  'Audit de',
  'Formation sur',
  'Refonte de',
  'Amélioration de',
  'Support pour',
  'Analyse de',
  'Conception de',
  'Implémentation de',
  'Gestion de',
  'Maintenance de',
  'Déploiement de',
  'Automatisation de',
  'Tests de',
  'Documentation de',
];

const actionObjects = [
  "l'environnement de développement",
  "l'infrastructure cloud",
  "le système d'authentification",
  'le portail client',
  'le module de reporting',
  "l'API REST",
  'la base de données',
  'le dashboard administratif',
  'le système de notifications',
  'le moteur de recherche',
  'le workflow de validation',
  'le module de facturation',
  'le système de paiement',
  'le portail de self-service',
  'la plateforme de e-learning',
  'le CRM',
  'le système de gestion documentaire',
  "l'entrepôt de données",
  'le pipeline CI/CD',
  'le monitoring et la supervision',
  "le service d'analyse",
  "l'application mobile",
  "le chatbot d'assistance",
  'la plateforme de collaboration',
  'le moteur de recommandations',
  'le système de gestion des stocks',
];

/** Generate a single random invoice line description */
export function generateLineDescription(): string {
  return `${randomItem(actionVerbs)} ${randomItem(actionObjects)}`;
}

/** Generate a random invoice line with a given unitPrice */
export function generateInvoiceLine(unitPrice: number, unit: string): InvoiceLineFakerData {
  const quantity = unit === 'h' ? randomInt(2, 80) : randomInt(1, 20);
  const description = generateLineDescription();
  return { description, quantity, unitPrice };
}
// ── Invoice data ──────────────────────────────────────────────────────────────
const statusWeights = [0.15, 0.25, 0.5, 0.1]; // weighted selection

const invoiceStatuses: Array<InvoiceStatus> = ['DRAFT', 'SENT', 'PAID', 'CANCELLED'];

/** Weighted random status */
function randomStatus(): InvoiceStatus {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < invoiceStatuses.length; i++) {
    cumulative += statusWeights[i];
    if (r < cumulative) {
      return invoiceStatuses[i];
    }
  }
  return 'DRAFT';
}

/** Generate a random invoice number */
export function generateInvoiceNumber(year: number, seq: number): string {
  // Use '-' separator (not '/') to be Windows-filename-safe
  return `${year}-${String(seq).padStart(4, '0')}`;
}

/** Generate a complete invoice (without prestation references — caller must resolve) */
export interface RawInvoiceData {
  invoice: {
    number: string;
    status: InvoiceStatus;
  };
  lines: Array<{ quantity: number; unitPrice: number; description: string }>;
}

/** Generate a raw invoice with N lines (5-10) */
export function generateRawInvoice(
  year: number,
  seq: number,
  prestations: Array<{ unitPrice: number; unit: string }>,
  lineCount?: number
): RawInvoiceData {
  const count = lineCount ?? randomInt(5, 10);
  const lines: Array<{ quantity: number; unitPrice: number; description: string }> = [];

  // Pick random prestations for each line (allow repeats, but prefer variety)
  for (let i = 0; i < count; i++) {
    const prestation = randomItem(prestations);
    const line = generateInvoiceLine(prestation.unitPrice, prestation.unit);
    lines.push(line);
  }

  return {
    invoice: {
      number: generateInvoiceNumber(year, seq),
      status: randomStatus(),
    },
    lines: lines.map((l) => ({ ...l, unitPrice: Math.round(l.unitPrice * 100) / 100 })), // round
  };
}
