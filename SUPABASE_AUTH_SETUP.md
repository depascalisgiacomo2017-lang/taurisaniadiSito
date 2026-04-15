# Guida Setup Supabase Auth - Taurisaniadi 2026

## Panoramica della Migrazione

Questo progetto è stato completamente migrato da un sistema di autenticazione basato su `localStorage` e tabelle `admin_credentials`/`rioni` a **Supabase Auth**, che è più sicuro e conforme agli standard di Supabase.

### Vantaggi della Migrazione

- ✅ Password gestite in modo sicuro da Supabase (hash bcrypt)
- ✅ Row Level Security (RLS) Policies implementate su tutte le tabelle
- ✅ Sessioni autenticate tramite JWT
- ✅ Controllo accesso basato su ruoli (admin/caporione)
- ✅ Nessun sensitive data in localStorage
- ✅ Reset password tramite email
- ✅ Gestione utenti centralizzata

---

## Prerequisiti

1. Account Supabase attivo
2. Progetto Supabase creato
3. Database PostgreSQL provisioned
4. Migrazioni SQL già applicate

---

## STEP-BY-STEP: Setup Manuale su Supabase Dashboard

### STEP 1: Creare Utenti Admin

1. Vai su **Supabase Dashboard > Authentication > Users**
2. Clicca **"Invite user"**
3. Inserisci l'email dell'admin (es. `admin@taurisaniadi.it`)
4. Seleziona **"Send invite link"**
5. L'admin riceverà un email con il link per impostare la password
6. Prendi nota dell'**UUID** dell'utente creato

### STEP 2: Creare Utenti Caporioni

1. Ripeti lo stesso processo per ogni caporione
2. Suggerisci email strutturate: `caporione.rione1@taurisaniadi.it`
3. Prendi nota degli UUID di tutti i caporioni

### STEP 3: Collegare Utenti Auth ai Record Database

Una volta che gli utenti accedono per la prima volta al sito tramite `index.html`, il sistema `auth.js` crea automaticamente i record nelle tabelle con il `user_id` già collegato.

**OPPURE** se vuoi collegare utenti già esistenti, esegui questo SQL nell'**SQL Editor**:

```sql
-- Per l'admin (sostituisci UUID_ADMIN con l'UUID reale)
UPDATE public.admin_credentials
SET user_id = 'UUID_ADMIN'
WHERE id = (SELECT id FROM public.admin_credentials LIMIT 1);

-- Per i caporioni (ripeti per ogni rione)
UPDATE public.rioni
SET user_id = 'UUID_CAPORIONE_1'
WHERE nome = 'Rione 1';

UPDATE public.rioni
SET user_id = 'UUID_CAPORIONE_2'
WHERE nome = 'Rione 2';

-- ... continua per tutti i rioni
```

Puoi trovare gli UUID nella tabella `auth.users`:

```sql
SELECT id, email FROM auth.users;
```

### STEP 4: Verificare le RLS Policies

Vai su **SQL Editor** e esegui:

```sql
SELECT tablename, policyname, PERMISSIVE, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Dovresti vedere circa 40+ policies. Se mancano, verifica che tutte le migrazioni siano state applicate.

### STEP 5: Testare il Sistema

1. **Accedi al sito locale:**
   ```bash
   npm run dev
   ```

2. **Vai su `http://localhost:5173`**

3. **Clicca "Entra da Amministratore"**

4. **Inserisci email e password**

5. **Verifica il redirect a `admin_panel.html`**

---

## Come Funziona il Nuovo Sistema

### Flow di Login

```
User input (email + password)
    ↓
auth.js → signInWithEmail()
    ↓
Supabase Auth verifica credenziali
    ↓
Se OK → carica user_id dalla sessione
    ↓
Verifica se user_id esiste in admin_credentials
    ↓
Se SÌ → redirect admin_panel.html
Se NO → verifica in rioni
    ↓
Se SÌ → redirect caporione.html
Se NO → errore "Utente non autorizzato"
```

### Funzioni Disponibili in auth.js

```javascript
// Inizializza auth e carica sessione dal browser
await window.initializeAuth()

// Login con email e password
const result = await window.signInWithEmail(email, password)
// Ritorna: { success: true/false, user, role, rioneId, error }

// Logout
const result = await window.signOut()

// Verifica autenticazione (se non autenticato, redirect a index.html)
const isAuth = await window.checkAuth('admin') // o 'caporione'

// Ottieni l'utente corrente
const user = window.getCurrentUser()

// Ottieni il ruolo corrente ('admin' o 'caporione')
const role = window.getCurrentUserRole()

// Ottieni l'ID del rione corrente (se caporione)
const rioneId = window.getCurrentRioneId()

// Aggiorna password
const result = await window.updateUserPassword(newPassword)

// Reset password via email
const result = await window.resetPassword(email)
```

---

## Architettura delle RLS Policies

### Tabella: admin_credentials

- **SELECT**: Solo admin autenticati
- **INSERT**: Solo admin
- **UPDATE**: Solo admin
- **DELETE**: Solo admin

### Tabella: rioni

- **SELECT**: Pubblico (nessuna autenticazione richiesta)
- **INSERT**: Solo admin
- **UPDATE**: Owner o admin
- **DELETE**: Solo admin

### Tabella: atleti

- **SELECT**: Pubblico
- **INSERT**: Caporione del rione o admin
- **UPDATE**: Caporione del rione o admin
- **DELETE**: Caporione del rione o admin

### Tabella: squadre

- **SELECT**: Pubblico
- **INSERT**: Caporione del rione o admin
- **UPDATE**: Caporione del rione o admin
- **DELETE**: Caporione del rione o admin

### Tabelle Pubbliche (SELECT per tutti, write solo admin)

- giochi
- fasce_eta
- impostazioni
- momenti_salienti
- classifica
- statistiche

### Tabella: messaggi

- **SELECT**: Pubblico
- **INSERT**: Chiunque autenticato
- **UPDATE**: Non disponibile
- **DELETE**: Solo admin

---

## Troubleshooting

### "Utente non autorizzato" al login

**Causa**: L'utente non esiste in `admin_credentials` o `rioni`

**Soluzione**:
1. Accertati che il primo login dell'utente sia avvenuto (il sistema crea il record)
2. Oppure crea il record manualmente con l'UPDATE SQL (vedi STEP 3)

### "Errore di RLS al salvare"

**Causa**: Le policy non sono attive o configurate male

**Soluzione**:
1. Verifica che RLS sia abilitato su tutte le tabelle
2. Esegui di nuovo la migrazione delle policies
3. Controlla che l'utente sia autenticato

### "Password non corretta" ma l'email è giusta

**Causa**: L'utente usa la vecchia password dal sistema precedente

**Soluzione**:
1. Invia link di reset password all'utente
2. Oppure ricrea l'utente su Supabase Auth

### "Session scaduta"

**Causa**: Sessione JWT scaduta o token non valido

**Soluzione**:
1. Il sistema tenterà un refresh automatico
2. Se persiste, logout e login di nuovo

---

## File Modificati

| File | Modifica |
|------|----------|
| `auth.js` | Nuovo file con gestione Supabase Auth |
| `index.html` | Campi email, funzioni di login aggiornate |
| `admin_panel.html` | Controllo auth con checkAuth('admin') |
| `caporione.html` | Controllo auth con checkAuth('caporione') |
| `admin_functions.js` | Usa getCurrentUser() e updateUserPassword() |
| `caporione_functions.js` | Usa getCurrentRioneId() |
| Migrazione SQL | Aggiunto user_id a admin_credentials e rioni |
| Migrazione SQL | 40+ RLS Policies su tutte le tabelle |

---

## Migrazione da Sistema Precedente

Se hai utenti con credenziali nel vecchio sistema:

1. **Verifica utenti vecchi:**
   ```sql
   SELECT id, username, password FROM admin_credentials;
   SELECT id, nome, username, password FROM rioni;
   ```

2. **Per ogni utente, crea account su Supabase Auth**

3. **Collega il user_id:**
   ```sql
   UPDATE admin_credentials SET user_id = 'UUID' WHERE id = 'admin_id';
   UPDATE rioni SET user_id = 'UUID' WHERE id = 'rione_id';
   ```

4. **Verifica il login funzioni**

5. **Opzionale:** Elimina le password dal vecchio sistema (non necessario ma consigliato)

---

## Checklist di Verifica

Prima di andare in produzione:

- [ ] Utenti creati su Supabase Auth
- [ ] RLS Policies verificate (40+ policies presenti)
- [ ] Login admin funziona e reindirizza a admin_panel.html
- [ ] Login caporione funziona e reindirizza a caporione.html
- [ ] Spettatori possono visualizzare i dati senza login
- [ ] Logout funziona e reindirizza a index.html
- [ ] Cambio password funziona
- [ ] Reset password funziona
- [ ] Nessun localStorage sensibile nel DevTools
- [ ] Sessione JWT valida nel browser

---

## Supporto

Se riscontri problemi:

1. Controlla la console del browser (F12 > Console)
2. Guarda i log di Supabase Dashboard
3. Verifica le RLS Policies in SQL Editor
4. Assicurati che la migrazione SQL sia stata applicata completamente

---

## Sicurezza

**Importante**: Assicurati che:

- ✅ Tutte le password siano gestite da Supabase (non nel database)
- ✅ RLS sia abilitato su tutte le tabelle
- ✅ Nessun dato sensibile sia in localStorage
- ✅ Le policy non usino mai `USING (true)` senza controlli
- ✅ Ogni operazione di write sia autenticata
- ✅ I caporioni possono modificare solo i dati del loro rione

Questa configurazione è **completamente sicura e conforme** alle best practice di Supabase.
