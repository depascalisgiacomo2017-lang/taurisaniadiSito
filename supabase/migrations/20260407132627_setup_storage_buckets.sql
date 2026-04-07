/*
  # Setup Storage Buckets

  1. Storage Buckets
    - `game-brackets` - Store per immagini tabelloni giochi
    - `chat-files` - Store per file condivisi nella chat
  
  2. Security
    - Policies per permettere upload e accesso pubblico ai file
    - Autenticazione richiesta per upload
    - Accesso pubblico per download

  Note: 
    - I bucket permettono upload di immagini e documenti
    - I file sono accessibili pubblicamente tramite URL
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('game-brackets', 'game-brackets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']::text[]),
  ('chat-files', 'chat-files', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']::text[])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to game-brackets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'game-brackets');

CREATE POLICY "Allow public access to game-brackets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-brackets');

CREATE POLICY "Allow authenticated uploads to chat-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Allow public access to chat-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-files');

CREATE POLICY "Allow authenticated delete from game-brackets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'game-brackets');

CREATE POLICY "Allow authenticated delete from chat-files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-files');
