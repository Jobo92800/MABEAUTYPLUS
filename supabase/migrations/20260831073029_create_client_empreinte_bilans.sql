/*
# Création de la table des bilans Empreinte

Cette migration crée une nouvelle table pour stocker le nouveau formulaire unifié
« Bilan Empreinte + Cure » qui remplace le double flux « fiche d'information
client + formulaire cure ». Aucune donnée existante (Firestore clients,
Firestore payments, Airtable) n'est modifiée : cette table est additive.

## Nouvelle table : client_empreinte_bilans

Elle stocke, pour chaque bilan rempli :
- `client_id` (text, nullable) : identifiant du client (Firestore) auquel le bilan
  est rattaché. Nullable pour permettre de sauvegarder un bilan avant que le
  client ne soit créé (cas d'un nouvel intake).
- `center_id` (text, nullable) : centre où le bilan a été rempli.
- `client_name` (text) : prénom + nom saisis dans le formulaire.
- `prenom` (text) : prénom affiché tout au long du questionnaire.
- `answers` (jsonb) : toutes les réponses (index Q → index option, curseur,
  texte libre, coordonnées, config cure).
- `scores` (jsonb) : scores calculés par axe (P1..P5, T1..T5) et pourcentages.
- `empreinte` (jsonb) : profil dominant + terrain dominant + complémentaire.
- `total_price` (numeric) : montant total de la cure.
- `seances` (integer) : nombre de séances de luxothérapie.
- `electro` (boolean) : électrostimulation incluse ou non.
- `validated` (boolean) : la cure a-t-elle été validée par la cliente.
- `created_at`, `updated_at` : horodatages standards.

## Sécurité

RLS activé. L'application n'a pas d'écran de connexion, donc les policies
autorisent `anon` + `authenticated` pour l'ensemble des opérations CRUD. Cela
correspond au pattern des autres tables existantes (stock_products,
signed_contracts).

## Index

- Index sur `client_id` pour retrouver rapidement le dernier bilan d'un client.
- Index sur `center_id` pour filtrer par centre.
*/

CREATE TABLE IF NOT EXISTS client_empreinte_bilans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text,
  center_id text,
  client_name text NOT NULL DEFAULT '',
  prenom text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  empreinte jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  seances integer NOT NULL DEFAULT 0,
  electro boolean NOT NULL DEFAULT false,
  validated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_empreinte_bilans_client_id_idx
  ON client_empreinte_bilans (client_id);

CREATE INDEX IF NOT EXISTS client_empreinte_bilans_center_id_idx
  ON client_empreinte_bilans (center_id);

CREATE INDEX IF NOT EXISTS client_empreinte_bilans_created_at_idx
  ON client_empreinte_bilans (created_at DESC);

ALTER TABLE client_empreinte_bilans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empreinte_select_all" ON client_empreinte_bilans;
CREATE POLICY "empreinte_select_all"
  ON client_empreinte_bilans FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "empreinte_insert_all" ON client_empreinte_bilans;
CREATE POLICY "empreinte_insert_all"
  ON client_empreinte_bilans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "empreinte_update_all" ON client_empreinte_bilans;
CREATE POLICY "empreinte_update_all"
  ON client_empreinte_bilans FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "empreinte_delete_all" ON client_empreinte_bilans;
CREATE POLICY "empreinte_delete_all"
  ON client_empreinte_bilans FOR DELETE
  TO anon, authenticated
  USING (true);