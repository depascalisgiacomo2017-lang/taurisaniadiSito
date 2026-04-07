# Taurisaniadi 2026

Piattaforma web completa per la gestione delle Taurisaniadi 2026 con database Supabase real-time.

## Caratteristiche

- **Vista Spettatore**: Accesso pubblico per visualizzare giochi, calendario, highlights e dirette live
- **Pannello Amministratore**: Gestione completa con nuove funzionalità
- **Area Capo-Rione**: Gestione atleti, formazioni e comunicazione con l'amministrazione

## Nuove Funzionalità 2026

### Per l'Amministratore

1. **Chat e Condivisione File**: Sistema di messaggistica bidirezionale con i capi-rione, supporto per allegati
2. **Gestione Credenziali**: Modifica credenziali amministratore e di tutti i rioni
3. **Fasce di Età**: Configurazione fasce di età degli atleti (Under 18, 18-30, 31-45, Over 45)
4. **Numero Minimo Donne**: Impostazione requisito minimo donne per ogni gioco
5. **Gestione Giochi Avanzata**:
   - Modifica orari, date e luoghi
   - Aggiunta URL diretta live streaming
   - Upload tabelloni scontri
   - Eliminazione giochi
6. **Statistiche Atleti**: Visualizzazione completa atleti per rione con conteggio partecipazioni

### Per gli Spettatori

1. **Dirette Live**: Visualizzazione link streaming durante i giochi in corso
2. **Tabelloni Scontri**: Visualizzazione grafica dei bracket per ogni gioco
3. **Aggiornamenti Real-Time**: Tutti i dati si aggiornano automaticamente senza ricaricare la pagina

### Per i Capi-Rione

1. **Chat con Amministrazione**: Comunicazione diretta con invio file
2. **Gestione Atleti Avanzata**: Assegnazione fasce di età agli atleti

## Tecnologie

- Frontend: HTML, CSS, JavaScript vanilla
- Database: Supabase (PostgreSQL) con Real-Time subscriptions
- Storage: Supabase Storage per file e immagini
- Build: Vite
- CDN: Supabase JS Client v2

## Database

Il database Supabase include le seguenti tabelle:

- `rioni` - Rioni con credenziali di accesso
- `atleti` - Anagrafica atleti per rione con fasce di età
- `giochi` - Configurazione giochi/eventi con live stream e bracket
- `squadre` - Formazioni per gioco
- `messaggi` - Chat tra amministratori e rioni con file sharing
- `momenti_salienti` - Foto e video highlights
- `impostazioni` - Configurazioni globali
- `fasce_eta` - Configurazione fasce di età
- `admin_credentials` - Credenziali amministratore

## Credenziali Default

### Amministratore
- Username: `admin`
- Password: `admin123`

### Rioni Esempio
- Centro: `centro` / `centro123`
- Nord: `nord` / `nord123`
- Sud: `sud` / `sud123`
- Est: `est` / `est123`
- Ovest: `ovest` / `ovest123`
- Mare: `mare` / `mare123`
- Collina: `collina` / `collina123`

## Struttura

```
├── index.html              # Landing page con login
├── spectator.html          # Vista pubblica
├── admin_panel.html        # Pannello amministratore
├── caporione.html          # Area capo-rione
├── supabase_client.js      # Configurazione Supabase e real-time
├── auth.js                 # Sistema autenticazione
├── admin_functions.js      # Funzioni amministrazione
├── admin_extended.js       # Funzioni estese amministrazione
├── caporione_functions.js  # Funzioni capo-rione
└── package.json            # Dipendenze
```

## Come Usare le Nuove Funzionalità

### Amministratore

1. **Accedi** con username `admin` e password `admin123`
2. **Gestione Credenziali**: Modifica le tue credenziali e quelle dei rioni
3. **Chat**: Comunica con i capi-rione, invia messaggi e condividi file
4. **Fasce Età**: Configura le fasce di età per gli atleti
5. **Gestione Giochi**: Modifica orari, luoghi, aggiungi link live e tabelloni
6. **Statistiche**: Visualizza tutti gli atleti con il numero di partecipazioni

### Spettatore

1. **Accedi** come spettatore (nessuna password richiesta)
2. **Visualizza** giochi con link live streaming quando disponibili
3. **Vedi** i tabelloni scontri per ogni gioco
4. **Aggiornamenti** automatici in tempo reale

### Capo-Rione

1. **Accedi** con username del rione (es. `centro`, `nord`) e password
2. **Chat**: Comunica con l'amministrazione
3. **Gestisci** atleti e assegna fasce di età
4. **Crea** formazioni per i giochi

## Sviluppo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Il sito compilato sarà nella cartella `dist/`.
