# Checklist di Implementazione - Supabase Auth Migration

## Fase 1: Preparazione (1-2 ore)

### Dashboard Supabase

- [ ] Accedi a https://app.supabase.com
- [ ] Seleziona il progetto Taurisaniadi
- [ ] Verifica che il database sia attivo
- [ ] Accedi a "SQL Editor"

### Verifiche di Sistema

- [ ] Esegui il file `SETUP_SCRIPT.sql` (copia-incolla nel SQL Editor)
- [ ] Verifica che appaia "~40 policies" come risultato
- [ ] Conferma che RLS sia abilitato su tutte le tabelle
- [ ] Controlla che le colonne `user_id` siano presenti in `admin_credentials` e `rioni`

---

## Fase 2: Creazione Utenti (30 minuti)

### Creare Admin

- [ ] Vai su **Authentication > Users**
- [ ] Clicca "Invite user"
- [ ] Inserisci email admin: `admin@taurisaniadi.it` (o altra)
- [ ] Seleziona "Send invite link"
- [ ] **Copia l'UUID** dell'admin
- [ ] L'admin riceverà una email con il link di setup password

### Creare Caporioni

- [ ] Per ogni rione, ripeti il processo di "Invite user"
- [ ] Email suggerite:
  - `caporione.rione1@taurisaniadi.it`
  - `caporione.rione2@taurisaniadi.it`
  - ... (continua per tutti i rioni)
- [ ] **Copia gli UUID** di tutti i caporioni

### Collegare Utenti al Database

- [ ] Nel SQL Editor, esegui gli UPDATE per collegare `user_id`:

```sql
-- Sostituisci gli UUID con i valori reali
UPDATE admin_credentials SET user_id = 'UUID_ADMIN' WHERE id = (SELECT id FROM admin_credentials LIMIT 1);
UPDATE rioni SET user_id = 'UUID_CAPORIONE_1' WHERE nome = 'Rione 1';
UPDATE rioni SET user_id = 'UUID_CAPORIONE_2' WHERE nome = 'Rione 2';
-- ... continua per tutti i rioni
```

- [ ] Esegui il comando e verifica che nessun errore appaia
- [ ] Usa `SETUP_SCRIPT.sql` VERIFICA 8 per confermare i collegamenti

---

## Fase 3: Test Locale (30 minuti)

### Avviare Dev Server

- [ ] Terminal: `npm run dev`
- [ ] Attendi che Vite compili il progetto
- [ ] Apri browser: `http://localhost:5173`

### Test Login Admin

- [ ] Clicca "Entra da Amministratore"
- [ ] Inserisci email admin e password
- [ ] Verifica il redirect a `admin_panel.html`
- [ ] Controlla che il pannello carichi correttamente
- [ ] Clicca "Esci" e verifica redirect a `index.html`

### Test Login Caporione

- [ ] Clicca "Entra da Capo-Rione"
- [ ] Inserisci email caporione e password
- [ ] Verifica il redirect a `caporione.html`
- [ ] Controlla che l'area capo-rione carichi con il nome del rione
- [ ] Clicca "Esci" e verifica redirect a `index.html`

### Test Spettatore

- [ ] Clicca "Entra da Spettatore"
- [ ] Verifica che i dati pubblici siano visibili
- [ ] Assicurati che NON ci sia un form di login

### Test Errori

- [ ] Prova a loggare con email errata
- [ ] Prova a loggare con password errata
- [ ] Verifica il messaggio di errore appropriato
- [ ] Prova ad accedere a `admin_panel.html` direttamente (deve redirectare)
- [ ] Prova ad accedere a `caporione.html` direttamente (deve redirectare)

---

## Fase 4: Verifica Sicurezza (15 minuti)

### DevTools Console

- [ ] Apri DevTools (F12)
- [ ] Vai a "Storage" > "Application"
- [ ] Controlla localStorage: **non deve contenere password**
- [ ] Verifica che esista `supabase.auth.token` (JWT della sessione)
- [ ] **Nota**: Il JWT contiene il `user_id` ma non password

### Console Log

- [ ] Guarda la "Console"
- [ ] Non devono esserci errori in rosso
- [ ] Verifica che non ci siano messaggi di auth fallita

### Network Tab

- [ ] Ricarica la pagina
- [ ] Vai a "Network"
- [ ] Filtra per "auth" o "login"
- [ ] Verifica che le richieste vadano a `https://...supabase.co/auth`
- [ ] Controlla che le password **non** siano visibili nelle richieste

---

## Fase 5: Build Produzione (10 minuti)

### Build Finale

- [ ] Terminal: `npm run build`
- [ ] Attendi che la build sia completata
- [ ] Verifica che non ci siano errori
- [ ] Controlla che i file siano in `dist/`

### Verifica Build

- [ ] Apri `dist/index.html` nel browser (o usa `npm run preview`)
- [ ] Testa login come sopra
- [ ] Verifica che tutto funzioni come atteso

---

## Fase 6: Deploy (5-30 minuti, dipende da dove deployi)

### Se usi Netlify

- [ ] `npm run build` (se non fatto)
- [ ] Pushare su GitHub
- [ ] Netlify fa il deploy automatico
- [ ] Attendi che il deploy sia completato

### Se usi altro hosting

- [ ] Carica i file da `dist/` al tuo hosting
- [ ] Verifica che gli URL siano corretti
- [ ] Testa il login in produzione

---

## Fase 7: Verifica Finale in Produzione

- [ ] Accedi al sito in produzione
- [ ] Testa login admin
- [ ] Testa login caporione
- [ ] Testa spettatore
- [ ] Verifica che il logout funzioni
- [ ] Controlla che i dati si carichino correttamente
- [ ] Testa le operazioni di modifica (solo admin/caporione possono)
- [ ] Assicurati che gli spettatori non possano modificare nulla

---

## Fase 8: Pulizia e Documentazione (30 minuti)

### Pulisci il Vecchio Sistema (Opzionale)

Se vuoi rimuovere le password dal vecchio sistema:

```sql
-- ATTENZIONE: Backup prima di fare questo!
UPDATE admin_credentials SET password = NULL;
UPDATE rioni SET password = NULL;
```

### Documenta l'Accesso

- [ ] Crea un documento con le credenziali (in luogo sicuro)
- [ ] Condividi i link di reset password ai nuovi utenti
- [ ] Spiega il nuovo sistema al team

### Verifica Migrazione

- [ ] Controlla che nessun dato sia stato perso
- [ ] Verifica che i rioni siano ancora collegati correttamente
- [ ] Assicurati che gli atleti e le squadre siano intatte

---

## Problemi Comuni e Soluzioni

### "Utente non autorizzato" al login

**Causa**: L'utente non è stato collegato con `user_id`

**Soluzione**:
```sql
-- Ottieni l'UUID reale dell'utente
SELECT id, email FROM auth.users;

-- Collega l'utente
UPDATE admin_credentials SET user_id = 'UUID_REALE' WHERE username = 'admin';
```

### Build fallisce

**Causa**: Errore JavaScript nel codice

**Soluzione**:
- [ ] Leggi il messaggio di errore
- [ ] Controlla che tutti gli script siano importati
- [ ] Esegui `npm install` di nuovo

### Login non funziona

**Causa**: Supabase non raggiungibile

**Soluzione**:
- [ ] Controlla la connessione internet
- [ ] Verifica che `supabase_client.js` sia caricato
- [ ] Controlla che le credenziali Supabase siano corrette nel `.env`

### RLS error al salvare dati

**Causa**: Policy non configurata correttamente

**Soluzione**:
- [ ] Controlla che l'utente sia autenticato
- [ ] Verifica che le policy siano state applicate
- [ ] Esegui di nuovo la migrazione SQL

---

## Numeri Attesi

Se tutto è configurato correttamente, dovresti avere:

- **40+ RLS Policies** (1 per tabella × 4 operazioni + variazioni)
- **11 Tabelle con RLS abilitato**
- **N Utenti** (1 admin + N caporioni)
- **0 Password nel localStorage**
- **1 JWT Token** nella sessione Supabase

---

## Contatti e Supporto

- Documentazione Supabase: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

## Data Completamento

- [ ] Data inizio: _____________
- [ ] Data completamento: _____________
- [ ] Testato in produzione: _____________
- [ ] Team notificato: _____________

---

**Nota Importante**: Una volta completato il setup, salva questo documento per future referenze!
