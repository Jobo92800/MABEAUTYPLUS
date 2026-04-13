/*
  # Déplacer le produit LIVRE dans une nouvelle catégorie "livre"

  ## Changements
  - Mise à jour de la catégorie du produit "LIVRE" de "complement" vers "livre"

  ## Note
  La contrainte CHECK sur la colonne `category` sera supprimée si elle existe,
  puis recréée avec la nouvelle valeur autorisée.
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stock_products_category_check'
    AND table_name = 'stock_products'
  ) THEN
    ALTER TABLE stock_products DROP CONSTRAINT stock_products_category_check;
  END IF;
END $$;

UPDATE stock_products SET category = 'livre' WHERE name ILIKE '%livre%' AND category = 'complement';
