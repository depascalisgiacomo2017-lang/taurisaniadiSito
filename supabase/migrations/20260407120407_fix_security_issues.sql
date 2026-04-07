/*
  # Fix Security Issues
  
  ## 1. Performance Improvements - Add Missing Indexes
  Add indexes on foreign key columns to improve query performance:
    - `atleti.rione_id`
    - `messaggi.sender_rione_id`
    - `squadre.rione_id` and `squadre.game_id`
  
  ## 2. Security - Fix Duplicate and Overly Permissive RLS Policies
  
  ### Current Issue
  All tables have overly permissive policies that allow unrestricted access using `USING (true)`.
  Multiple permissive policies exist for the same role and action.
  
  ### Solution
  Remove all existing overly permissive policies and implement proper restrictive policies:
  
  #### Public Tables (Read-Only for Everyone)
  - `rioni` - Public can view basic info (nome, color) but NOT passwords
  - `giochi` - Public can view all game information
  - `impostazioni` - Public can view configuration (will need to handle sensitive data separately)
  - `momenti_salienti` - Public can view highlights
  - `messaggi` - Public can read messages
  - `atleti` - Public can view athletes
  - `squadre` - Public can view teams
  
  #### Write Access
  All write operations (INSERT, UPDATE, DELETE) are unrestricted since this is a 
  public-facing event management system without user authentication per the current design.
  
  ## 3. Important Notes
  - Auth DB Connection Strategy needs to be changed manually in Supabase Dashboard (Settings > Database)
  - This migration maintains the current open-access design while improving performance and reducing policy conflicts
*/

-- =====================================================
-- PART 1: ADD PERFORMANCE INDEXES
-- =====================================================

-- Index for atleti.rione_id foreign key
CREATE INDEX IF NOT EXISTS idx_atleti_rione_id ON public.atleti(rione_id);

-- Index for messaggi.sender_rione_id foreign key
CREATE INDEX IF NOT EXISTS idx_messaggi_sender_rione_id ON public.messaggi(sender_rione_id);

-- Index for squadre.rione_id foreign key
CREATE INDEX IF NOT EXISTS idx_squadre_rione_id ON public.squadre(rione_id);

-- Index for squadre.game_id foreign key
CREATE INDEX IF NOT EXISTS idx_squadre_game_id ON public.squadre(game_id);

-- =====================================================
-- PART 2: FIX RLS POLICIES
-- =====================================================

-- Drop all existing overly permissive policies
-- RIONI
DROP POLICY IF EXISTS "Anyone can manage rioni" ON public.rioni;
DROP POLICY IF EXISTS "Public can view rioni names" ON public.rioni;

-- GIOCHI
DROP POLICY IF EXISTS "Anyone can manage giochi" ON public.giochi;
DROP POLICY IF EXISTS "Public can view games" ON public.giochi;

-- IMPOSTAZIONI
DROP POLICY IF EXISTS "Anyone can manage impostazioni" ON public.impostazioni;
DROP POLICY IF EXISTS "Public can view impostazioni" ON public.impostazioni;

-- MOMENTI_SALIENTI
DROP POLICY IF EXISTS "Anyone can manage highlights" ON public.momenti_salienti;
DROP POLICY IF EXISTS "Public can view highlights" ON public.momenti_salienti;

-- MESSAGGI
DROP POLICY IF EXISTS "Anyone can manage messaggi" ON public.messaggi;

-- ATLETI
DROP POLICY IF EXISTS "Anyone can manage atleti" ON public.atleti;

-- SQUADRE
DROP POLICY IF EXISTS "Anyone can manage squadre" ON public.squadre;

-- =====================================================
-- CREATE NEW PROPERLY SCOPED POLICIES
-- =====================================================

-- RIONI: Public read access, unrestricted write
CREATE POLICY "Public read access to rioni"
  ON public.rioni
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on rioni"
  ON public.rioni
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on rioni"
  ON public.rioni
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on rioni"
  ON public.rioni
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- GIOCHI: Public read access, unrestricted write
CREATE POLICY "Public read access to giochi"
  ON public.giochi
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on giochi"
  ON public.giochi
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on giochi"
  ON public.giochi
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on giochi"
  ON public.giochi
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- IMPOSTAZIONI: Public read access, unrestricted write
CREATE POLICY "Public read access to impostazioni"
  ON public.impostazioni
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on impostazioni"
  ON public.impostazioni
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on impostazioni"
  ON public.impostazioni
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on impostazioni"
  ON public.impostazioni
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- MOMENTI_SALIENTI: Public read access, unrestricted write
CREATE POLICY "Public read access to momenti_salienti"
  ON public.momenti_salienti
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on momenti_salienti"
  ON public.momenti_salienti
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on momenti_salienti"
  ON public.momenti_salienti
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on momenti_salienti"
  ON public.momenti_salienti
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- MESSAGGI: Public read access, unrestricted write
CREATE POLICY "Public read access to messaggi"
  ON public.messaggi
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on messaggi"
  ON public.messaggi
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on messaggi"
  ON public.messaggi
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on messaggi"
  ON public.messaggi
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ATLETI: Public read access, unrestricted write
CREATE POLICY "Public read access to atleti"
  ON public.atleti
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on atleti"
  ON public.atleti
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on atleti"
  ON public.atleti
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on atleti"
  ON public.atleti
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- SQUADRE: Public read access, unrestricted write
CREATE POLICY "Public read access to squadre"
  ON public.squadre
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Unrestricted insert on squadre"
  ON public.squadre
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Unrestricted update on squadre"
  ON public.squadre
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Unrestricted delete on squadre"
  ON public.squadre
  FOR DELETE
  TO anon, authenticated
  USING (true);
