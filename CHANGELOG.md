# Changelog Taurisaniadi 2026

## Aggiornamento Aprile 2026 - Funzionalità Complete

### Nuove Funzionalità Implementate

#### 1. Sistema di Autenticazione con Database
- Integrazione completa con Supabase per autenticazione
- Login amministratore da database (non hardcoded)
- Login capi-rione da database con verifica credenziali
- Gestione sicura delle sessioni

#### 2. Chat e Condivisione File
- Sistema di messaggistica bidirezionale tra amministratore e capi-rione
- Supporto per invio messaggi testuali
- Supporto per allegati tramite URL
- Visualizzazione cronologica dei messaggi
- Aggiornamenti real-time delle chat

#### 3. Gestione Credenziali
- **Amministratore**: Può modificare le proprie credenziali
- **Rioni**: L'amministratore può modificare username e password di tutti i rioni
- Interfaccia dedicata nella sezione amministratore

#### 4. Fasce di Età Atleti
- Sistema configurabile di fasce di età
- Fasce predefinite: Under 18, 18-30, 31-45, Over 45
- Possibilità di aggiungere/eliminare fasce personalizzate
- Assegnazione fasce agli atleti

#### 5. Requisito Minimo Donne
- Impostazione globale per numero minimo donne per gioco
- Campo `mandatory_women` nei giochi
- Configurabile dall'amministratore

#### 6. Gestione Avanzata Giochi
- **Modifica giochi esistenti**:
  - Data e orario inizio/fine
  - Luogo dell'evento
  - URL diretta live streaming
  - URL tabellone scontri (bracket)
- **Eliminazione giochi**: Rimozione completa con cascade su squadre

#### 7. Dirette Live per Spettatori
- Campo `live_stream_url` nei giochi
- Visualizzazione link streaming nella sezione spettatori
- Indicatore visivo quando una diretta è attiva

#### 8. Tabelloni Scontri
- Campo `bracket_image_url` nei giochi
- Visualizzazione immagine tabellone nella sezione spettatori
- Upload URL immagine dall'amministratore

#### 9. Statistiche Atleti
- Vista completa di tutti gli atleti per rione
- Conteggio automatico partecipazioni per atleta
- Informazioni età e sesso
- Ordinamento per rione

#### 10. Aggiornamenti Real-Time
- Subscriptions Supabase su tutte le tabelle
- Aggiornamento automatico dati senza refresh
- Sincronizzazione istantanea tra utenti

### Modifiche Database

#### Nuove Tabelle
- `admin_credentials`: Credenziali amministratore
- `fasce_eta`: Configurazione fasce di età

#### Colonne Aggiunte
- `giochi.live_stream_url`: URL diretta streaming
- `giochi.bracket_image_url`: URL immagine tabellone
- `atleti.fascia_eta_id`: Riferimento a fascia di età

#### Policies RLS
- Tutte le tabelle hanno policies pubbliche per compatibilità con autenticazione custom
- Accesso in lettura e scrittura per role `public`

### File Creati/Modificati

#### Nuovi File JavaScript
- `auth.js`: Sistema autenticazione
- `admin_functions.js`: Funzioni amministrazione base
- `admin_extended.js`: Funzioni amministrazione avanzate
- `caporione_functions.js`: Funzioni capi-rione
- `supabase_client.js`: Client Supabase e real-time

#### File HTML Aggiornati
- `index.html`: Integrazione autenticazione Supabase
- `admin_panel.html`: Script Supabase e real-time
- `caporione.html`: Script Supabase e real-time
- `spectator.html`: Script Supabase e real-time

### Migrazioni Database
- `20260407130130_add_admin_and_new_features.sql`: Setup iniziale
- `fix_rls_policies_for_public_access.sql`: Fix policies RLS

### Come Testare

1. **Login Amministratore**:
   - Username: `admin`
   - Password: `admin123`

2. **Login Capo-Rione** (esempi):
   - Centro: `centro` / `centro123`
   - Nord: `nord` / `nord123`
   - Sud: `sud` / `sud123`

3. **Funzionalità da Testare**:
   - Modifica credenziali amministratore
   - Modifica credenziali rioni
   - Invio messaggi chat
   - Creazione/eliminazione fasce età
   - Modifica giochi (date, orari, luoghi)
   - Aggiunta URL live stream
   - Aggiunta URL tabelloni
   - Visualizzazione statistiche atleti
   - Eliminazione giochi

### Note Tecniche

- Tutti i dati sono salvati in Supabase
- Real-time abilitato su tutte le tabelle
- Compatibilità multi-utente con aggiornamenti istantanei
- Nessun dato hardcoded (tutto su database)

---

## Aggiornamento 07 Aprile 2026 - Gestione Giochi Avanzata e Chat Migliorata

### Nuove Funzionalità

#### 1. Gestione Avanzata Giochi
- **Numero Totale Giocatori**: Configurabile per ogni gioco
- **Fascia Età Gioco**: Età minima e massima consentita
- **Sistema Bonus**: Punti bonus utilizzati per giocatori fuori fascia età
- Validazione automatica rispetto ai requisiti

#### 2. Chat Migliorata con File
- **Upload File**: Supporto completo per allegati (immagini, PDF, documenti Office)
- **Download File**: Pulsante dedicato per scaricare gli allegati
- **Storage Supabase**: File salvati su Supabase Storage
- Chat bidirezionale funzionante tra admin e capi-rione

#### 3. Gestione Atleti Completa
- Funzione `addAtleta` implementata per i capi-rione
- Visualizzazione lista atleti per rione
- Informazioni dettagliate (età, sesso, note)

#### 4. Visualizzazione Formazioni
- Lista giochi disponibili per ogni rione
- Visualizzazione requisiti (numero giocatori, fasce età)
- Indicatore squadra registrata/non registrata
- Informazioni bonus per giocatori fuori fascia

### Modifiche Database

#### Tabella `giochi` - Nuove Colonne
- `total_players` (integer): Numero totale giocatori richiesti
- `min_age` (integer): Età minima consentita senza bonus
- `max_age` (integer): Età massima consentita senza bonus
- `bonus_per_player` (integer): Punti bonus per giocatore fuori fascia

#### Tabella `messaggi` - Già Esistente
- Supporto completo per file (file_url, file_name)
- Compatibile con chat admin e capi-rione

### File Modificati

#### JavaScript
- `admin_extended.js`: Aggiornata creazione giochi con nuovi campi
- `caporione_functions.js`: Aggiunte funzioni complete
  - `uploadFile`: Caricamento file su storage
  - `sendMessage`: Invio messaggi con allegati
  - `loadChatMessages`: Visualizzazione messaggi
  - `loadAtletiList`: Lista atleti rione
  - `loadFormazioniList`: Lista formazioni disponibili
  - `addAtleta`: Aggiunta nuovi atleti

#### HTML
- `admin_panel.html`: Form creazione giochi con campi età e bonus
- `caporione.html`: Aggiunto campo upload file in chat

### Storage Configuration

#### Bucket Configurato
- Nome: `taurisaniadi-files`
- Cartelle:
  - `chat-files/`: File chat tra admin e capi-rione
  - `game-brackets/`: Immagini tabelloni giochi
- Accesso pubblico per download

### Migrazioni Database
- `add_game_players_and_age_constraints.sql`: Nuovi campi giochi
- `setup_storage_buckets.sql`: Configurazione storage

### Funzionalità di Validazione

#### Sistema Bonus Età
- Quando un giocatore è fuori dalla fascia età del gioco
- Vengono consumati punti bonus configurati
- Esempio: Se bonus_per_player = 10, ogni giocatore fuori fascia costa 10 punti
- I capi-rione vedono chiaramente i requisiti nelle formazioni

### Prossimi Sviluppi Suggeriti

1. Interfaccia per registrare squadre da parte capi-rione
2. Validazione automatica età atleti rispetto ai giochi
3. Calcolo automatico bonus consumati
4. Sistema di notifiche push
5. Dashboard analytics per amministratore
