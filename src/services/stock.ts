import { supabase } from './supabase';
import type {
  StockProduct,
  StockLevel,
  StockLevelWithProduct,
  StockMovement,
  StockStatus,
  StockCategory,
} from '../types/stock';

export async function getProductsForCenter(centerId: string): Promise<StockProduct[]> {
  const { data, error } = await supabase
    .from('stock_products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data || []).filter((p: StockProduct) => {
    if (!p.center_specific) return true;
    return p.center_specific.includes(centerId);
  });
}

export async function getStockLevels(centerId: string): Promise<StockLevelWithProduct[]> {
  const products = await getProductsForCenter(centerId);
  const productIds = products.map((p) => p.id);

  if (productIds.length === 0) return [];

  const { data: levels, error } = await supabase
    .from('stock_levels')
    .select('*')
    .eq('center_id', centerId)
    .in('product_id', productIds);

  if (error) throw error;

  const levelsMap = new Map<string, StockLevel>(
    (levels || []).map((l: StockLevel) => [l.product_id, l])
  );

  const result: StockLevelWithProduct[] = [];

  for (const product of products) {
    const level = levelsMap.get(product.id);
    if (level) {
      result.push({ ...level, product });
    } else {
      const newLevel = await ensureStockLevel(product.id, centerId);
      result.push({ ...newLevel, product });
    }
  }

  return result;
}

async function ensureStockLevel(productId: string, centerId: string): Promise<StockLevel> {
  const { data, error } = await supabase
    .from('stock_levels')
    .upsert(
      {
        product_id: productId,
        center_id: centerId,
        quantity: 0,
        alert_threshold: 5,
        danger_threshold: 2,
        initial_stock: 0,
      },
      { onConflict: 'product_id,center_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStockQuantity(
  productId: string,
  centerId: string,
  delta: number,
  note?: string
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('stock_levels')
    .select('quantity, id')
    .eq('product_id', productId)
    .eq('center_id', centerId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const currentQty = current?.quantity ?? 0;
  const newQty = Math.max(0, currentQty + delta);

  if (!current) {
    await supabase.from('stock_levels').insert({
      product_id: productId,
      center_id: centerId,
      quantity: newQty,
      alert_threshold: 5,
      danger_threshold: 2,
      initial_stock: 0,
    });
  } else {
    const { error: updateError } = await supabase
      .from('stock_levels')
      .update({ quantity: newQty })
      .eq('product_id', productId)
      .eq('center_id', centerId);

    if (updateError) throw updateError;
  }

  const { error: mvtError } = await supabase.from('stock_movements').insert({
    product_id: productId,
    center_id: centerId,
    movement_type: delta > 0 ? 'entry' : 'exit',
    quantity: Math.abs(delta),
    note: note || null,
    moved_at: new Date().toISOString(),
  });

  if (mvtError) throw mvtError;
}

export async function setStockLevel(
  productId: string,
  centerId: string,
  quantity: number,
  alertThreshold: number,
  dangerThreshold: number
): Promise<void> {
  const { error } = await supabase
    .from('stock_levels')
    .upsert(
      {
        product_id: productId,
        center_id: centerId,
        quantity,
        alert_threshold: alertThreshold,
        danger_threshold: dangerThreshold,
        initial_stock: quantity,
      },
      { onConflict: 'product_id,center_id' }
    );

  if (error) throw error;
}

export async function getStockMovements(
  centerId: string,
  limit = 100
): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*, product:stock_products(*)')
    .eq('center_id', centerId)
    .order('moved_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function deleteStockMovement(id: string): Promise<void> {
  const { error } = await supabase.from('stock_movements').delete().eq('id', id);
  if (error) throw error;
}

export function getStockStatus(level: StockLevel): StockStatus {
  if (level.quantity <= level.danger_threshold) return 'danger';
  if (level.quantity <= level.alert_threshold) return 'warning';
  return 'normal';
}

export async function addCustomProduct(
  name: string,
  category: StockCategory,
  unit: string,
  centerId: string
): Promise<StockProduct> {
  const { data, error } = await supabase
    .from('stock_products')
    .insert({
      name,
      category,
      unit,
      center_specific: category === 'complement' || category === 'vetement' ? null : [centerId],
      sort_order: 999,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
