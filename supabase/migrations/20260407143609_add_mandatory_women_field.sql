/*
  # Aggiungere campo opzionale mandatory_women

  1. Modifiche
    - Aggiungere colonna `mandatory_women` alla tabella `giochi`
    - Il campo è opzionale (nullable) e indica il numero minimo di donne richieste
    - Se NULL, il numero viene calcolato dalle posizioni con gender='F'
    - Se impostato, sovrascrive il conteggio automatico delle posizioni

  2. Note
    - Campo integer nullable con default NULL
    - Permette sia la gestione automatica che manuale del requisito donne
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'mandatory_women'
  ) THEN
    ALTER TABLE giochi ADD COLUMN mandatory_women integer DEFAULT NULL;
  END IF;
END $$;