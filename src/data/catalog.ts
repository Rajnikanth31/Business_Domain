export type Industry = {
  id: string;
  name: string;
  cost: number;
  revenue: number;
  expense: number;
  stages: number;
  mode:
    | "retail"
    | "fleet"
    | "factory"
    | "construction"
    | "dealer"
    | "it"
    | "bank"
    | "sport"
    | "oil"
    | "airline"
    | "merged";
  icon: string;
  color: string;
  unitCost: number;
  duration: number;
};
// Rates are integer cents per hour; prices are integer cents.
export const INDUSTRIES: Industry[] = [
  {
    id: "shop",
    name: "Shop",
    cost: 489900,
    revenue: 16500,
    expense: 4500,
    stages: 10,
    mode: "retail",
    icon: "shop",
    color: "#23C97C",
    unitCost: 50000,
    duration: 1200,
  },
  {
    id: "taxi",
    name: "Taxi company",
    cost: 999900,
    revenue: 0,
    expense: 2400,
    stages: 10,
    mode: "fleet",
    icon: "car",
    color: "#F7C83A",
    unitCost: 250000,
    duration: 1200,
  },
  {
    id: "shipping",
    name: "Shipping company",
    cost: 1989900,
    revenue: 0,
    expense: 6000,
    stages: 10,
    mode: "fleet",
    icon: "truck",
    color: "#E58B60",
    unitCost: 600000,
    duration: 1200,
  },
  {
    id: "factory",
    name: "Factory",
    cost: 2499900,
    revenue: 140000,
    expense: 42000,
    stages: 20,
    mode: "factory",
    icon: "factory",
    color: "#4686AE",
    unitCost: 100000,
    duration: 1200,
  },
  {
    id: "construction",
    name: "Construction Company",
    cost: 3540000,
    revenue: 0,
    expense: 0,
    stages: 10,
    mode: "construction",
    icon: "crane",
    color: "#FA5576",
    unitCost: 100000,
    duration: 1200,
  },
  {
    id: "dealer",
    name: "Car dealership",
    cost: 4000000,
    revenue: 0,
    expense: 0,
    stages: 10,
    mode: "dealer",
    icon: "car",
    color: "#34383E",
    unitCost: 1500000,
    duration: 900,
  },
  {
    id: "it",
    name: "IT company",
    cost: 35000000,
    revenue: 0,
    expense: 0,
    stages: 10,
    mode: "it",
    icon: "monitor",
    color: "#7660C4",
    unitCost: 1000000,
    duration: 900,
  },
  {
    id: "bank",
    name: "Bank",
    cost: 1000000000,
    revenue: 0,
    expense: 500000,
    stages: 10,
    mode: "bank",
    icon: "bank",
    color: "#AAB7C6",
    unitCost: 100000000,
    duration: 1200,
  },
  {
    id: "sport",
    name: "Sports Club",
    cost: 4000000000,
    revenue: 20000000,
    expense: 12000000,
    stages: 10,
    mode: "sport",
    icon: "sport",
    color: "#8A3678",
    unitCost: 150000000,
    duration: 1200,
  },
  {
    id: "oil",
    name: "Oil and Gas Company",
    cost: 150000000000,
    revenue: 0,
    expense: 30000000,
    stages: 10,
    mode: "oil",
    icon: "oil",
    color: "#255366",
    unitCost: 5000000000,
    duration: 1800,
  },
  {
    id: "airline",
    name: "Airlines",
    cost: 1300000000000,
    revenue: 0,
    expense: 100000000,
    stages: 10,
    mode: "airline",
    icon: "aircraft",
    color: "#16B2E4",
    unitCost: 150000000000,
    duration: 1800,
  },
  {
    id: "clothing",
    name: "Clothing brand",
    cost: 300000000,
    revenue: 48000000,
    expense: 5870000,
    stages: 10,
    mode: "merged",
    icon: "shirt",
    color: "#9A4985",
    unitCost: 0,
    duration: 1800,
  },
  {
    id: "space",
    name: "Space agency",
    cost: 200000000000,
    revenue: 4500000000,
    expense: 1000000000,
    stages: 10,
    mode: "merged",
    icon: "aircraft",
    color: "#4D57B9",
    unitCost: 0,
    duration: 3600,
  },
  {
    id: "holding",
    name: "Holding company",
    cost: 500000000000,
    revenue: 15000000000,
    expense: 4000000000,
    stages: 10,
    mode: "merged",
    icon: "business",
    color: "#4A9176",
    unitCost: 0,
    duration: 3600,
  },
];
export const MERGERS = [
  {
    id: "clothing",
    cash: 300000000,
    requirements: [
      { kind: "shop", stage: 10 },
      { kind: "shipping", stage: 1, city: 8, intercity: 2 },
      { kind: "factory", stage: 20 },
    ],
    portfolio: 0,
  },
  {
    id: "space",
    cash: 200000000000,
    requirements: [
      { kind: "it", stage: 10 },
      { kind: "oil", stage: 5 },
      { kind: "airline", stage: 5 },
    ],
    portfolio: 0,
  },
  {
    id: "holding",
    cash: 500000000000,
    requirements: [
      { kind: "bank", stage: 10 },
      { kind: "clothing", stage: 5 },
    ],
    portfolio: 400000000000,
  },
] as const;
export type Company = {
  id: number;
  kind: string;
  name: string;
  level: number;
  capital: number;
  staff: number;
  training: number;
  city: number;
  intercity: number;
  resources: number;
  vault: number;
  depositRate: number;
  lendingRate: number;
  wins: number;
  upgrade?: { endsAt: number; target: number; cost: number };
  project?: { endsAt: number; cost: number; payout: number; name: string };
};
export const RIVALS = [
  {
    name: "Morgan Vale",
    sector: "Technology & Automotive",
    wealth: 43390000000000,
    color: "#40797A",
  },
  {
    name: "Jordan Bell",
    sector: "Technology",
    wealth: 23940000000000,
    color: "#5B6688",
  },
  {
    name: "Alex Mercer",
    sector: "E-commerce",
    wealth: 21770000000000,
    color: "#8C7189",
  },
  {
    name: "Rowan Ellis",
    sector: "Technology",
    wealth: 20460000000000,
    color: "#647E62",
  },
  {
    name: "Bennet Lane",
    sector: "Fashion & Retail",
    wealth: 18130000000000,
    color: "#A08C65",
  },
  {
    name: "Lena Pierce",
    sector: "Technology",
    wealth: 16140000000000,
    color: "#6B8A9C",
  },
  {
    name: "Serena Brook",
    sector: "Technology",
    wealth: 15400000000000,
    color: "#8F7769",
  },
  {
    name: "Warren Finch",
    sector: "Investments",
    wealth: 14700000000000,
    color: "#6E739B",
  },
];
