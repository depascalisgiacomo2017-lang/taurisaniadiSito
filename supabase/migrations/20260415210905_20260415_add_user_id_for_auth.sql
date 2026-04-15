/*
  # Aggiungere user_id per integrazione Supabase Auth

  1. Modifiche Tabelle
    - `admin_credentials`: Aggiungi colonna user_id (UUID, FK a auth.users)
    - `rioni`: Aggiungi colonna user_id (UUID, FK a auth.users)
  
  2. Sicurezza
    - Questi user_id collegano le credenziali agli utenti autenticati di Supabase
    - Sono nullable inizialmente per migrazione graduale
    - Una volta migrati tutti gli utenti, potranno diventare NOT NULL
  
  3. Dati
    - Le password non servono più (Supabase Auth le gestisce)
    - I username verranno mantenuti per compatibilità visiva
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_credentials' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE admin_credentials ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_admin_user_id ON admin_credentials(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rioni' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE rioni ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_rioni_user_id ON rioni(user_id);
  END IF;
END $$;
