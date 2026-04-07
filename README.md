# Taurisaniadi 2026

Piattaforma web per la gestione delle Taurisaniadi 2026, convertita per utilizzare Supabase (servizi Bolt).

## Caratteristiche

- **Vista Spettatore**: Accesso pubblico per visualizzare giochi, calendario ed highlights
- **Pannello Amministratore**: Gestione completa di rioni, giochi, configurazioni
- **Area Capo-Rione**: Gestione atleti, formazioni e chat con il direttivo

## Tecnologie

- Frontend: HTML, CSS, JavaScript vanilla
- Database: Supabase (PostgreSQL)
- Build: Vite
- CDN: Supabase JS Client v2

## Database

Il database Supabase include le seguenti tabelle:

- `rioni` - Rioni con credenziali di accesso
- `atleti` - Anagrafica atleti per rione
- `giochi` - Configurazione giochi/eventi
- `squadre` - Formazioni per gioco
- `messaggi` - Chat tra amministratori e rioni
- `momenti_salienti` - Foto e video highlights
- `impostazioni` - Configurazioni globali

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
├── supabase_client.js      # Configurazione Supabase
├── auth.js                 # Sistema autenticazione
├── admin_functions.js      # Funzioni admin
├── caporione_functions.js  # Funzioni capo-rione
└── package.json            # Dipendenze
```

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
