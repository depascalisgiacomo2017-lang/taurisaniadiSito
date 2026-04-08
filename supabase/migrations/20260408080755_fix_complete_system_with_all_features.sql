/*
  # Sistema Completo - Correzioni e Nuove Funzionalità

  ## 1. Correzioni Tabella Rioni
    - Rinominare colonna `color` in `colore` per coerenza con il codice
    - Aggiungere colonna `punteggio` mancante

  ## 2. Nuova Tabella Statistiche
    - `id` (uuid, primary key)
    - `rione_id` (uuid, foreign key -> rioni)
    - `gioco_id` (uuid, foreign key -> giochi)
    - `posizione` (integer, posizione in classifica)
    - `punti` (integer, punti ottenuti)
    - `created_at` (timestamp)

  ## 3. Nuova Tabella Classifica
    - `id` (uuid, primary key)
    - `image_url` (text, URL dell'immagine caricata)
    - `updated_at` (timestamp)
    - Singola riga, sempre la stessa che viene aggiornata

  ## 4. Nuova Tabella Momenti Salienti
    - `id` (uuid, primary key)
    - `titolo` (text, not null)
    - `descrizione` (text)
    - `media_url` (text, URL video/foto)
    - `media_type` (text, tipo: 'video' o 'image')
    - `link_esterno` (text, link originale video)
    - `created_at` (timestamp)

  ## 5. Aggiunte Tabella Giochi
    - `whatsapp_link` (text, link al canale WhatsApp)

  ## 6. Security
    - Abilita RLS su tutte le nuove tabelle
    - Politiche di lettura pubblica
    - Politiche di scrittura solo autenticate
*/

-- 1. Correzione tabella rioni
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rioni' AND column_name = 'color'
  ) THEN
    ALTER TABLE rioni RENAME COLUMN color TO colore;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rioni' AND column_name = 'punteggio'
  ) THEN
    ALTER TABLE rioni ADD COLUMN punteggio integer DEFAULT 0;
  END IF;
END $$;

-- 2. Creazione tabella statistiche
CREATE TABLE IF NOT EXISTS statistiche (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rione_id uuid REFERENCES rioni(id) ON DELETE CASCADE,
  gioco_id uuid REFERENCES giochi(id) ON DELETE CASCADE,
  posizione integer NOT NULL,
  punti integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE statistiche ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Statistiche leggibili da tutti"
  ON statistiche FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Statistiche modificabili da autenticati"
  ON statistiche FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Creazione tabella classifica
CREATE TABLE IF NOT EXISTS classifica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classifica ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classifica leggibile da tutti"
  ON classifica FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Classifica modificabile da autenticati"
  ON classifica FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserisci una riga iniziale se non esiste
INSERT INTO classifica (image_url) VALUES (NULL)
ON CONFLICT DO NOTHING;

-- 4. Creazione tabella momenti_salienti
CREATE TABLE IF NOT EXISTS momenti_salienti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titolo text NOT NULL,
  descrizione text,
  media_url text,
  media_type text CHECK (media_type IN ('video', 'image', NULL)),
  link_esterno text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE momenti_salienti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Momenti salienti leggibili da tutti"
  ON momenti_salienti FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Momenti salienti modificabili da autenticati"
  ON momenti_salienti FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Aggiunta campo whatsapp_link a giochi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'whatsapp_link'
  ) THEN
    ALTER TABLE giochi ADD COLUMN whatsapp_link text DEFAULT NULL;
  END IF;
END $$;