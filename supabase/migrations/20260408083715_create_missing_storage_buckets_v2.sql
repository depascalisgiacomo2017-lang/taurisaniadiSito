/*
  # Creazione Bucket Storage Mancanti

  ## Bucket da Creare
    1. momenti-salienti - Per video e foto dei momenti salienti
    2. classifica - Per immagini della classifica

  ## Configurazione
    - Pubblici (public = true)
    - Dimensione massima file: 50MB
    - Tipi consentiti: immagini e video

  ## Security
    - Lettura pubblica
    - Scrittura solo utenti autenticati
*/

-- Crea bucket momenti-salienti se non esiste
INSERT INTO storage.buckets (id, name, public)
VALUES ('momenti-salienti', 'momenti-salienti', true)
ON CONFLICT (id) DO NOTHING;

-- Crea bucket classifica se non esiste
INSERT INTO storage.buckets (id, name, public)
VALUES ('classifica', 'classifica', true)
ON CONFLICT (id) DO NOTHING;

-- Policy per lettura pubblica momenti-salienti
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Momenti salienti pubblici lettura'
  ) THEN
    CREATE POLICY "Momenti salienti pubblici lettura"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'momenti-salienti');
  END IF;
END $$;

-- Policy per upload momenti-salienti (solo autenticati)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Momenti salienti upload autenticati'
  ) THEN
    CREATE POLICY "Momenti salienti upload autenticati"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'momenti-salienti');
  END IF;
END $$;

-- Policy per eliminazione momenti-salienti (solo autenticati)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Momenti salienti delete autenticati'
  ) THEN
    CREATE POLICY "Momenti salienti delete autenticati"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'momenti-salienti');
  END IF;
END $$;

-- Policy per lettura pubblica classifica
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Classifica pubblica lettura'
  ) THEN
    CREATE POLICY "Classifica pubblica lettura"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'classifica');
  END IF;
END $$;

-- Policy per upload classifica (solo autenticati)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Classifica upload autenticati'
  ) THEN
    CREATE POLICY "Classifica upload autenticati"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'classifica');
  END IF;
END $$;

-- Policy per update classifica (solo autenticati)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Classifica update autenticati'
  ) THEN
    CREATE POLICY "Classifica update autenticati"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'classifica')
    WITH CHECK (bucket_id = 'classifica');
  END IF;
END $$;

-- Policy per eliminazione classifica (solo autenticati)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Classifica delete autenticati'
  ) THEN
    CREATE POLICY "Classifica delete autenticati"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'classifica');
  END IF;
END $$;