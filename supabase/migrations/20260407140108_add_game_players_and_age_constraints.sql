/*
  # Aggiungi vincoli età e numero giocatori ai giochi

  ## Modifiche
  
  1. Aggiunte colonne alla tabella `giochi`:
    - `total_players` (integer) - Numero totale di giocatori richiesti per squadra
    - `min_age` (integer) - Età minima consentita senza bonus
    - `max_age` (integer) - Età massima consentita senza bonus
    - `bonus_per_player` (integer) - Punti bonus utilizzati per ogni giocatore fuori fascia età
    
  ## Note
  - I valori di default permettono di mantenere i giochi esistenti funzionanti
  - Il bonus viene consumato quando si inserisce un giocatore fuori fascia età
  - Il sistema di validazione verrà implementato lato client
*/

-- Aggiungi colonne per gestione numero giocatori e fasce età
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'total_players'
  ) THEN
    ALTER TABLE giochi ADD COLUMN total_players integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'min_age'
  ) THEN
    ALTER TABLE giochi ADD COLUMN min_age integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'max_age'
  ) THEN
    ALTER TABLE giochi ADD COLUMN max_age integer DEFAULT 99;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'bonus_per_player'
  ) THEN
    ALTER TABLE giochi ADD COLUMN bonus_per_player integer DEFAULT 0;
  END IF;
END $$;