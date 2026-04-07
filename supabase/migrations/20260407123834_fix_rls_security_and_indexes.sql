/*
  # Fix Security Issues

  ## Changes Made
  
  1. **Remove Unused Indexes**
     - Drop `idx_squadre_game_id` (unused)
     - Drop `idx_atleti_rione_id` (unused)
     - Drop `idx_messaggi_sender_rione_id` (unused)
     - Drop `idx_squadre_rione_id` (unused)
  
  2. **Remove Insecure RLS Policies**
     - Remove all policies with `USING (true)` that bypass security
     - Tables affected: rioni, atleti, giochi, squadre, messaggi, momenti_salienti, impostazioni
  
  3. **Create Secure Public Access Policies**
     - For event management system (Taurisaniadi), data should be publicly readable
     - Only authenticated users can modify data (session-based auth in frontend)
     - Spectators can view all public data
  
  ## Security Model
  
  - **SELECT**: Public access for all tables (spectators can view)
  - **INSERT/UPDATE/DELETE**: Requires service role key (used by admin/caporione)
  - Note: This is acceptable for an event management system where data is not sensitive
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_squadre_game_id;
DROP INDEX IF EXISTS idx_atleti_rione_id;
DROP INDEX IF EXISTS idx_messaggi_sender_rione_id;
DROP INDEX IF EXISTS idx_squadre_rione_id;

-- Drop all insecure policies with USING(true)

-- Rioni policies
DROP POLICY IF EXISTS "allow_all_select_rioni" ON public.rioni;
DROP POLICY IF EXISTS "allow_all_insert_rioni" ON public.rioni;
DROP POLICY IF EXISTS "allow_all_update_rioni" ON public.rioni;
DROP POLICY IF EXISTS "allow_all_delete_rioni" ON public.rioni;

-- Atleti policies
DROP POLICY IF EXISTS "allow_all_select_atleti" ON public.atleti;
DROP POLICY IF EXISTS "allow_all_insert_atleti" ON public.atleti;
DROP POLICY IF EXISTS "allow_all_update_atleti" ON public.atleti;
DROP POLICY IF EXISTS "allow_all_delete_atleti" ON public.atleti;

-- Giochi policies
DROP POLICY IF EXISTS "allow_all_select_giochi" ON public.giochi;
DROP POLICY IF EXISTS "allow_all_insert_giochi" ON public.giochi;
DROP POLICY IF EXISTS "allow_all_update_giochi" ON public.giochi;
DROP POLICY IF EXISTS "allow_all_delete_giochi" ON public.giochi;

-- Squadre policies
DROP POLICY IF EXISTS "allow_all_select_squadre" ON public.squadre;
DROP POLICY IF EXISTS "allow_all_insert_squadre" ON public.squadre;
DROP POLICY IF EXISTS "allow_all_update_squadre" ON public.squadre;
DROP POLICY IF EXISTS "allow_all_delete_squadre" ON public.squadre;

-- Messaggi policies
DROP POLICY IF EXISTS "allow_all_select_messaggi" ON public.messaggi;
DROP POLICY IF EXISTS "allow_all_insert_messaggi" ON public.messaggi;
DROP POLICY IF EXISTS "allow_all_update_messaggi" ON public.messaggi;
DROP POLICY IF EXISTS "allow_all_delete_messaggi" ON public.messaggi;

-- Momenti Salienti policies
DROP POLICY IF EXISTS "allow_all_select_momenti_salienti" ON public.momenti_salienti;
DROP POLICY IF EXISTS "allow_all_insert_momenti_salienti" ON public.momenti_salienti;
DROP POLICY IF EXISTS "allow_all_update_momenti_salienti" ON public.momenti_salienti;
DROP POLICY IF EXISTS "allow_all_delete_momenti_salienti" ON public.momenti_salienti;

-- Impostazioni policies
DROP POLICY IF EXISTS "allow_all_select_impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "allow_all_insert_impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "allow_all_update_impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "allow_all_delete_impostazioni" ON public.impostazioni;

-- Create new secure policies
-- For public event system: allow public read access, but no writes without service role

-- RIONI: Public read only
CREATE POLICY "public_read_rioni"
  ON public.rioni
  FOR SELECT
  TO public
  USING (true);

-- ATLETI: Public read only
CREATE POLICY "public_read_atleti"
  ON public.atleti
  FOR SELECT
  TO public
  USING (true);

-- GIOCHI: Public read only
CREATE POLICY "public_read_giochi"
  ON public.giochi
  FOR SELECT
  TO public
  USING (true);

-- SQUADRE: Public read only
CREATE POLICY "public_read_squadre"
  ON public.squadre
  FOR SELECT
  TO public
  USING (true);

-- MESSAGGI: Public read (for transparency)
CREATE POLICY "public_read_messaggi"
  ON public.messaggi
  FOR SELECT
  TO public
  USING (true);

-- MOMENTI SALIENTI: Public read only
CREATE POLICY "public_read_momenti_salienti"
  ON public.momenti_salienti
  FOR SELECT
  TO public
  USING (true);

-- IMPOSTAZIONI: Public read only
CREATE POLICY "public_read_impostazioni"
  ON public.impostazioni
  FOR SELECT
  TO public
  USING (true);

-- Note: Write access (INSERT/UPDATE/DELETE) now requires service role key
-- Frontend should use service role key for admin/caporione authenticated operations
-- Or migrate to Supabase Auth with proper role-based policies