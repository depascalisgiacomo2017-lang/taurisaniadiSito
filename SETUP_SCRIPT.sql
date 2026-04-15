-- ============================================================================
-- SCRIPT DI VERIFICA E SETUP
-- Esegui questo script nell'SQL Editor di Supabase per verificare
-- che tutto sia configurato correttamente
-- ============================================================================

-- VERIFICA 1: Controlla che le colonne user_id siano state aggiunte
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('admin_credentials', 'rioni')
  AND column_name = 'user_id'
ORDER BY table_name;

-- VERIFICA 2: Controlla che RLS sia abilitato su tutte le tabelle principali
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'admin_credentials', 'rioni', 'atleti', 'squadre',
    'giochi', 'fasce_eta', 'messaggi', 'impostazioni',
    'momenti_salienti', 'classifica', 'statistiche'
  )
ORDER BY tablename;

-- VERIFICA 3: Conta le RLS Policies (dovresti vedere ~40+)
SELECT
  COUNT(*) as total_policies,
  tablename,
  COUNT(*) as policies_per_table
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- VERIFICA 4: Lista tutte le policies (per audit)
SELECT
  tablename,
  policyname,
  permissive,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- VERIFICA 5: Controlla gli utenti Supabase Auth
SELECT
  id,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- VERIFICA 6: Controlla i collegamenti user_id
SELECT
  'admin_credentials' as table_name,
  COUNT(*) as records_with_user_id,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as linked_users
FROM admin_credentials

UNION ALL

SELECT
  'rioni' as table_name,
  COUNT(*) as records_with_user_id,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as linked_users
FROM rioni;

-- VERIFICA 7: Mostra admin_credentials con user_id
SELECT
  ac.id,
  ac.username,
  ac.user_id,
  u.email,
  u.created_at
FROM admin_credentials ac
LEFT JOIN auth.users u ON u.id = ac.user_id;

-- VERIFICA 8: Mostra rioni con user_id
SELECT
  r.id,
  r.nome,
  r.user_id,
  u.email,
  u.created_at
FROM rioni r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.nome;

-- ============================================================================
-- SETUP MANUALE (Se necessario)
-- ============================================================================

-- Se hai creato utenti su Supabase Auth e vuoi collegarli:
-- Sostituisci gli UUID con i valori reali da auth.users

-- Esempio: Collega admin
-- UPDATE admin_credentials
-- SET user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- WHERE username = 'admin';

-- Esempio: Collega caporioni
-- UPDATE rioni
-- SET user_id = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
-- WHERE nome = 'Rione 1';
