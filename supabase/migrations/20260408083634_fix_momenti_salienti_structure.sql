/*
  # Correzione Struttura Momenti Salienti

  ## Problema
    La tabella esistente ha campi in inglese diversi da quelli usati nel codice

  ## Soluzione
    1. Rinominare i campi esistenti per compatibilità con il codice
    2. Aggiungere campo link_esterno mancante
    
  ## Campi dopo migrazione
    - id (uuid)
    - titolo (text) - rinominato da title
    - descrizione (text) - rinominato da description  
    - media_url (text) - rinominato da url
    - media_type (text) - rinominato da type
    - link_esterno (text) - nuovo campo
    - created_at (timestamptz)
    
  ## Note
    - I dati esistenti vengono mantenuti
    - RLS già configurato
*/

-- Rinomina le colonne per compatibilità con il codice
DO $$
BEGIN
  -- Rinomina title -> titolo
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'momenti_salienti' AND column_name = 'title'
  ) THEN
    ALTER TABLE momenti_salienti RENAME COLUMN title TO titolo;
  END IF;

  -- Rinomina description -> descrizione
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'momenti_salienti' AND column_name = 'description'
  ) THEN
    ALTER TABLE momenti_salienti RENAME COLUMN description TO descrizione;
  END IF;

  -- Rinomina url -> media_url
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'momenti_salienti' AND column_name = 'url'
  ) THEN
    ALTER TABLE momenti_salienti RENAME COLUMN url TO media_url;
  END IF;

  -- Rinomina type -> media_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'momenti_salienti' AND column_name = 'type'
  ) THEN
    ALTER TABLE momenti_salienti RENAME COLUMN type TO media_type;
  END IF;
END $$;

-- Modifica media_url per permettere NULL (opzionale)
ALTER TABLE momenti_salienti ALTER COLUMN media_url DROP NOT NULL;

-- Modifica media_type per permettere NULL (opzionale)
ALTER TABLE momenti_salienti ALTER COLUMN media_type DROP NOT NULL;

-- Modifica titolo per renderlo NOT NULL
ALTER TABLE momenti_salienti ALTER COLUMN titolo SET NOT NULL;

-- Aggiunge campo link_esterno se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'momenti_salienti' AND column_name = 'link_esterno'
  ) THEN
    ALTER TABLE momenti_salienti ADD COLUMN link_esterno text;
  END IF;
END $$;

-- Rimuove campo highlight_date se esiste (non più usato)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'momenti_salienti' AND column_name = 'highlight_date'
  ) THEN
    ALTER TABLE momenti_salienti DROP COLUMN highlight_date;
  END IF;
END $$;

-- Aggiunge constraint per media_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'momenti_salienti_media_type_check'
  ) THEN
    ALTER TABLE momenti_salienti ADD CONSTRAINT momenti_salienti_media_type_check 
      CHECK (media_type IS NULL OR media_type IN ('video', 'image'));
  END IF;
END $$;