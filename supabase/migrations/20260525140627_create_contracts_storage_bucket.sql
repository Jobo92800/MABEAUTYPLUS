/*
  # Create contracts storage bucket

  Creates a public storage bucket for signed contract PDFs.
  Files are uploaded with a path like: {clientId}/{timestamp}.pdf
  The public URL is then passed to Airtable as an attachment.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to contracts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Allow public read on contracts"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'contracts');
