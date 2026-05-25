/*
  # Fix contracts storage bucket RLS

  The app does not use Supabase Auth, so the previous policy requiring
  `authenticated` role blocked all uploads. Replace with a policy that
  allows uploads from any role (anon included), restricted to the contracts bucket.
*/

DROP POLICY IF EXISTS "Allow authenticated uploads to contracts" ON storage.objects;

CREATE POLICY "Allow anon uploads to contracts"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'contracts');
