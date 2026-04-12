/*
  # Stock Management Tables

  ## Overview
  Creates a complete stock management system for MAbeautyplus beauty centers.
  Tracks inventory levels per center, product movements (entries/exits), and alert thresholds.

  ## New Tables

  ### 1. stock_products
  Defines all products available in the stock system.
  - `id` (uuid, PK)
  - `name` (text) - Product name (e.g., BURN, SOS, DETOX, SKIN, LIVRE, S, M, L, XL)
  - `category` (text) - Category: 'complement', 'vetement', 'mesojet', 'kos', 'advance_beauty'
  - `center_specific` (text[]) - Array of center IDs if product is center-specific (null = all centers)
  - `unit` (text) - Unit of measure (boîte, pièce, flacon, etc.)
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz)

  ### 2. stock_levels
  Current stock level per product per center.
  - `id` (uuid, PK)
  - `product_id` (uuid, FK -> stock_products)
  - `center_id` (text) - Center identifier
  - `quantity` (integer) - Current stock quantity
  - `alert_threshold` (integer) - Alert level (warning)
  - `danger_threshold` (integer) - Danger level
  - `initial_stock` (integer) - Initial stock quantity set
  - `created_at` / `updated_at` (timestamptz)

  ### 3. stock_movements
  Log of all stock movements (entries and exits).
  - `id` (uuid, PK)
  - `product_id` (uuid, FK -> stock_products)
  - `center_id` (text)
  - `movement_type` (text) - 'entry' or 'exit'
  - `quantity` (integer)
  - `note` (text) - Optional note/reason
  - `moved_at` (timestamptz) - When the movement occurred
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read/write access since this app doesn't use Supabase Auth
    (center selection is the only access control)
*/

CREATE TABLE IF NOT EXISTS stock_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  center_specific text[],
  unit text NOT NULL DEFAULT 'pièce',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES stock_products(id) ON DELETE CASCADE,
  center_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  alert_threshold integer NOT NULL DEFAULT 5,
  danger_threshold integer NOT NULL DEFAULT 2,
  initial_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, center_id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES stock_products(id) ON DELETE CASCADE,
  center_id text NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('entry', 'exit')),
  quantity integer NOT NULL CHECK (quantity > 0),
  note text,
  moved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_levels_center ON stock_levels(center_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_center ON stock_movements(center_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_moved_at ON stock_movements(moved_at DESC);

ALTER TABLE stock_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read stock_products"
  ON stock_products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert stock_products"
  ON stock_products FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update stock_products"
  ON stock_products FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read stock_levels"
  ON stock_levels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert stock_levels"
  ON stock_levels FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update stock_levels"
  ON stock_levels FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read stock_movements"
  ON stock_movements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert stock_movements"
  ON stock_movements FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public delete stock_movements"
  ON stock_movements FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION update_stock_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_levels_updated_at
  BEFORE UPDATE ON stock_levels
  FOR EACH ROW EXECUTE FUNCTION update_stock_levels_updated_at();

INSERT INTO stock_products (name, category, center_specific, unit, sort_order) VALUES
  ('BURN', 'complement', NULL, 'boîte', 1),
  ('SOS', 'complement', NULL, 'boîte', 2),
  ('DETOX', 'complement', NULL, 'boîte', 3),
  ('SKIN', 'complement', NULL, 'boîte', 4),
  ('LIVRE', 'complement', NULL, 'pièce', 5),
  ('S', 'vetement', NULL, 'pièce', 6),
  ('M', 'vetement', NULL, 'pièce', 7),
  ('L', 'vetement', NULL, 'pièce', 8),
  ('XL', 'vetement', NULL, 'pièce', 9),
  ('Sérum lèvres', 'kos', ARRAY['grau-du-roi'], 'flacon', 10),
  ('Beurre corps', 'kos', ARRAY['grau-du-roi'], 'flacon', 11),
  ('Contour yeux', 'kos', ARRAY['grau-du-roi'], 'flacon', 12),
  ('Crème visage', 'kos', ARRAY['grau-du-roi'], 'flacon', 13),
  ('Gommage corps', 'kos', ARRAY['grau-du-roi'], 'tube', 14),
  ('Huile beauté', 'kos', ARRAY['grau-du-roi'], 'flacon', 15),
  ('Sérum visage KOS', 'kos', ARRAY['grau-du-roi'], 'flacon', 16),
  ('Lifting traitement', 'advance_beauty', ARRAY['grau-du-roi'], 'ampoule', 17),
  ('Solution peeling', 'advance_beauty', ARRAY['grau-du-roi'], 'flacon', 18),
  ('Gel collagène', 'advance_beauty', ARRAY['grau-du-roi'], 'tube', 19),
  ('Crème restructurante', 'advance_beauty', ARRAY['grau-du-roi'], 'tube', 20),
  ('Peeling Mésojet', 'mesojet', ARRAY['le-cres', 'serignant'], 'flacon', 21),
  ('Infusion Mésojet', 'mesojet', ARRAY['le-cres', 'serignant'], 'flacon', 22),
  ('Booster Mésojet', 'mesojet', ARRAY['le-cres', 'serignant'], 'flacon', 23),
  ('Traitement spécialisé Mésojet', 'mesojet', ARRAY['le-cres', 'serignant'], 'flacon', 24)
ON CONFLICT DO NOTHING;
