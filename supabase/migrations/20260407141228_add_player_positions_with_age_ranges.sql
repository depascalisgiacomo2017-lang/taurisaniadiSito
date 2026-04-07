/*
  # Aggiunta fasce età per singole posizioni nei giochi

  1. Modifiche alle tabelle esistenti
    - Rimuove le colonne `min_age`, `max_age` dalla tabella `giochi`
    - Aggiunge colonna `player_positions` (jsonb) per definire requisiti di ogni posizione

  2. Nuova struttura `player_positions`
    Ogni gioco avrà un array di posizioni, es:
    [
      {"position": 1, "min_age": 2, "max_age": 3, "required_gender": null},
      {"position": 2, "min_age": 2, "max_age": 3, "required_gender": "F"},
      {"position": 3, "min_age": 5, "max_age": 6, "required_gender": null}
    ]

  3. Modifiche alla tabella `squadre`
    - Rimuove colonna `player_names` (array semplice)
    - Aggiunge colonna `players` (jsonb) con struttura:
    [
      {"position": 1, "player_name": "Mario Rossi", "age": 3, "gender": "M", "out_of_range": false},
      {"position": 2, "player_name": "Laura Bianchi", "age": 8, "gender": "F", "out_of_range": true}
    ]

  4. Note importanti
    - I bonus vengono consumati quando `out_of_range` è true
    - Il sistema calcola automaticamente se un giocatore è fuori fascia
    - `required_gender` può essere null, "M", o "F"
*/

-- Rimuovi le vecchie colonne dalla tabella giochi
ALTER TABLE giochi DROP COLUMN IF EXISTS min_age;
ALTER TABLE giochi DROP COLUMN IF EXISTS max_age;
ALTER TABLE giochi DROP COLUMN IF EXISTS mandatory_women;

-- Aggiungi la nuova colonna per le posizioni con requisiti specifici
ALTER TABLE giochi ADD COLUMN IF NOT EXISTS player_positions jsonb DEFAULT '[]'::jsonb;

-- Rimuovi la vecchia colonna dalla tabella squadre
ALTER TABLE squadre DROP COLUMN IF EXISTS player_names;

-- Aggiungi la nuova colonna per i giocatori con dettagli completi
ALTER TABLE squadre ADD COLUMN IF NOT EXISTS players jsonb DEFAULT '[]'::jsonb;

-- Aggiungi un commento esplicativo
COMMENT ON COLUMN giochi.player_positions IS 'Array di posizioni con requisiti: [{"position": 1, "min_age": 2, "max_age": 3, "required_gender": null}]';
COMMENT ON COLUMN squadre.players IS 'Array di giocatori assegnati: [{"position": 1, "player_name": "Nome Cognome", "age": 3, "gender": "M", "out_of_range": false}]';
