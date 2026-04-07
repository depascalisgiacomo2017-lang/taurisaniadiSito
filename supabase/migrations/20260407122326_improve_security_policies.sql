/*
  # Improve Security Policies and Remove Unused Indexes
  
  ## Changes Made
  
  1. **Remove Unused Indexes**
     - Drop indexes that are not being used by queries
     - These indexes were created for foreign keys but queries don't currently use them
  
  2. **Implement Restrictive RLS Policies**
     - **Read Access**: Public read-only access for all data (spectator view)
     - **Write Access**: Disable anonymous write access, require authentication
     - This aligns with the application's design where:
       - Spectators can view all data
       - Only authenticated users (admin/caporione) can modify data
  
  3. **Security Model**
     - Since the app uses client-side sessionStorage auth (not Supabase Auth),
       we implement a defense-in-depth approach:
       - Anonymous users can only READ
       - Only authenticated Supabase users can WRITE
       - This prevents accidental data modification from public users
       - Admin/Caporione operations will need to use service role key for writes
  
  ## Tables Affected
  - rioni (team/district data)
  - atleti (athletes)
  - giochi (games/events)
  - squadre (teams/formations)
  - messaggi (messages/chat)
  - momenti_salienti (highlights)
  - impostazioni (settings)
  
  ## Important Notes
  - Frontend code will need to use the service role key for admin/caporione operations
  - Public spectator views will continue to work with anon key (read-only)
  - This prevents unauthorized data tampering while maintaining functionality
*/

-- =====================================================
-- PART 1: REMOVE UNUSED INDEXES
-- =====================================================

-- These indexes were created but are not currently being used by any queries
-- Removing them improves write performance and reduces storage

DROP INDEX IF EXISTS public.idx_atleti_rione_id;
DROP INDEX IF EXISTS public.idx_messaggi_sender_rione_id;
DROP INDEX IF EXISTS public.idx_squadre_rione_id;
DROP INDEX IF EXISTS public.idx_squadre_game_id;

-- =====================================================
-- PART 2: REPLACE UNRESTRICTED POLICIES WITH SECURE ONES
-- =====================================================

-- First, drop all existing "unrestricted" policies

-- RIONI
DROP POLICY IF EXISTS "Public read access to rioni" ON public.rioni;
DROP POLICY IF EXISTS "Unrestricted insert on rioni" ON public.rioni;
DROP POLICY IF EXISTS "Unrestricted update on rioni" ON public.rioni;
DROP POLICY IF EXISTS "Unrestricted delete on rioni" ON public.rioni;

-- ATLETI
DROP POLICY IF EXISTS "Public read access to atleti" ON public.atleti;
DROP POLICY IF EXISTS "Unrestricted insert on atleti" ON public.atleti;
DROP POLICY IF EXISTS "Unrestricted update on atleti" ON public.atleti;
DROP POLICY IF EXISTS "Unrestricted delete on atleti" ON public.atleti;

-- GIOCHI
DROP POLICY IF EXISTS "Public read access to giochi" ON public.giochi;
DROP POLICY IF EXISTS "Unrestricted insert on giochi" ON public.giochi;
DROP POLICY IF EXISTS "Unrestricted update on giochi" ON public.giochi;
DROP POLICY IF EXISTS "Unrestricted delete on giochi" ON public.giochi;

-- SQUADRE
DROP POLICY IF EXISTS "Public read access to squadre" ON public.squadre;
DROP POLICY IF EXISTS "Unrestricted insert on squadre" ON public.squadre;
DROP POLICY IF EXISTS "Unrestricted update on squadre" ON public.squadre;
DROP POLICY IF EXISTS "Unrestricted delete on squadre" ON public.squadre;

-- MESSAGGI
DROP POLICY IF EXISTS "Public read access to messaggi" ON public.messaggi;
DROP POLICY IF EXISTS "Unrestricted insert on messaggi" ON public.messaggi;
DROP POLICY IF EXISTS "Unrestricted update on messaggi" ON public.messaggi;
DROP POLICY IF EXISTS "Unrestricted delete on messaggi" ON public.messaggi;

-- MOMENTI_SALIENTI
DROP POLICY IF EXISTS "Public read access to momenti_salienti" ON public.momenti_salienti;
DROP POLICY IF EXISTS "Unrestricted insert on momenti_salienti" ON public.momenti_salienti;
DROP POLICY IF EXISTS "Unrestricted update on momenti_salienti" ON public.momenti_salienti;
DROP POLICY IF EXISTS "Unrestricted delete on momenti_salienti" ON public.momenti_salienti;

-- IMPOSTAZIONI
DROP POLICY IF EXISTS "Public read access to impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "Unrestricted insert on impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "Unrestricted update on impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "Unrestricted delete on impostazioni" ON public.impostazioni;

-- =====================================================
-- PART 3: CREATE NEW SECURE POLICIES
-- =====================================================

-- For this application, we implement a simple but effective security model:
-- - Anonymous and authenticated users can READ all data (for spectator view)
-- - Only authenticated users can WRITE (for admin/caporione operations)
-- - Service role bypasses RLS entirely (used by admin/caporione via backend)

-- RIONI: Public read, authenticated write
CREATE POLICY "allow_read_rioni"
  ON public.rioni
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_rioni"
  ON public.rioni
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_rioni"
  ON public.rioni
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_rioni"
  ON public.rioni
  FOR DELETE
  TO authenticated
  USING (true);

-- ATLETI: Public read, authenticated write
CREATE POLICY "allow_read_atleti"
  ON public.atleti
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_atleti"
  ON public.atleti
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_atleti"
  ON public.atleti
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_atleti"
  ON public.atleti
  FOR DELETE
  TO authenticated
  USING (true);

-- GIOCHI: Public read, authenticated write
CREATE POLICY "allow_read_giochi"
  ON public.giochi
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_giochi"
  ON public.giochi
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_giochi"
  ON public.giochi
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_giochi"
  ON public.giochi
  FOR DELETE
  TO authenticated
  USING (true);

-- SQUADRE: Public read, authenticated write
CREATE POLICY "allow_read_squadre"
  ON public.squadre
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_squadre"
  ON public.squadre
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_squadre"
  ON public.squadre
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_squadre"
  ON public.squadre
  FOR DELETE
  TO authenticated
  USING (true);

-- MESSAGGI: Public read, authenticated write
CREATE POLICY "allow_read_messaggi"
  ON public.messaggi
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_messaggi"
  ON public.messaggi
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_messaggi"
  ON public.messaggi
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_messaggi"
  ON public.messaggi
  FOR DELETE
  TO authenticated
  USING (true);

-- MOMENTI_SALIENTI: Public read, authenticated write
CREATE POLICY "allow_read_momenti_salienti"
  ON public.momenti_salienti
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_momenti_salienti"
  ON public.momenti_salienti
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_momenti_salienti"
  ON public.momenti_salienti
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_momenti_salienti"
  ON public.momenti_salienti
  FOR DELETE
  TO authenticated
  USING (true);

-- IMPOSTAZIONI: Public read, authenticated write
CREATE POLICY "allow_read_impostazioni"
  ON public.impostazioni
  FOR SELECT
  USING (true);

CREATE POLICY "allow_authenticated_insert_impostazioni"
  ON public.impostazioni
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_impostazioni"
  ON public.impostazioni
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_impostazioni"
  ON public.impostazioni
  FOR DELETE
  TO authenticated
  USING (true);
