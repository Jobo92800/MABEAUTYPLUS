/*
  # Create signed_contracts table

  ## Purpose
  Stores metadata about digitally signed service contracts for MAbeautyplus clients.

  ## New Tables
  - `signed_contracts`
    - `id` (uuid, primary key)
    - `client_id` (text) - Firebase client ID
    - `center_id` (text) - Center identifier (e.g., 'grau-du-roi')
    - `client_name` (text) - Full name of the client at time of signing
    - `signed_at` (timestamptz) - When the contract was signed
    - `pdf_data` (text) - Base64-encoded PDF data stored directly
    - `contract_data` (jsonb) - Snapshot of contract data at time of signing
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public insert allowed (no auth in this app)
  - Public select allowed (no auth in this app — app controls access via clientId)
  
  ## Notes
  - This app uses Firebase for auth/client data, Supabase only for contract storage
  - Access is controlled at the application level by clientId
  - pdf_data stores the PDF as base64 to avoid Firebase Storage dependency
*/

CREATE TABLE IF NOT EXISTS signed_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  center_id text NOT NULL,
  client_name text NOT NULL DEFAULT '',
  signed_at timestamptz NOT NULL DEFAULT now(),
  pdf_data text NOT NULL DEFAULT '',
  contract_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signed_contracts_client_id ON signed_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_center_id ON signed_contracts(center_id);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_signed_at ON signed_contracts(signed_at DESC);

ALTER TABLE signed_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all"
  ON signed_contracts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select by client_id"
  ON signed_contracts
  FOR SELECT
  USING (true);
