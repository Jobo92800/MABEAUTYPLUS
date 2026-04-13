export type StockCategory = 'livre' | 'complement' | 'vetement' | 'mesojet' | 'kos' | 'advance_beauty';
export type MovementType = 'entry' | 'exit';

export interface StockProduct {
  id: string;
  name: string;
  category: StockCategory;
  center_specific: string[] | null;
  unit: string;
  sort_order: number;
  created_at: string;
}

export interface StockLevel {
  id: string;
  product_id: string;
  center_id: string;
  quantity: number;
  alert_threshold: number;
  danger_threshold: number;
  initial_stock: number;
  created_at: string;
  updated_at: string;
  product?: StockProduct;
}

export interface StockMovement {
  id: string;
  product_id: string;
  center_id: string;
  movement_type: MovementType;
  quantity: number;
  note: string | null;
  moved_at: string;
  created_at: string;
  product?: StockProduct;
}

export interface StockLevelWithProduct extends StockLevel {
  product: StockProduct;
}

export type StockStatus = 'danger' | 'warning' | 'normal';

export const CATEGORY_LABELS: Record<StockCategory, string> = {
  livre: 'Livres',
  complement: 'Compléments alimentaires',
  vetement: 'Vêtements',
  mesojet: 'Mésojet',
  kos: 'KOS',
  advance_beauty: 'Advance Beauty',
};

export const CATEGORY_COLORS: Record<StockCategory, { bg: string; text: string; border: string }> = {
  livre: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  complement: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  vetement: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  mesojet: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  kos: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  advance_beauty: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const CENTER_SPECIFIC_CATEGORIES: Partial<Record<string, StockCategory[]>> = {
  'grau-du-roi': ['kos', 'advance_beauty'],
  'le-cres': ['mesojet'],
  'serignant': ['mesojet'],
};

export const ALL_CENTERS = [
  { id: 'grau-du-roi', name: 'Le Grau-du-Roi' },
  { id: 'le-cres', name: 'Le Crès' },
  { id: 'serignant', name: 'Sérignan' },
  { id: 'cabestany', name: 'Cabestany' },
  { id: 'avignon', name: 'Avignon' },
];
