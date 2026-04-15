# Quick Start - Supabase Auth Setup

## 5 Minuti per Iniziare

### 1. Verifica il Setup di Base (1 minuto)

```sql
-- Esegui questo nel SQL Editor di Supabase per controllare che tutto sia pronto
SELECT
  'admin_credentials' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id
FROM admin_credentials

UNION ALL

SELECT
  'rioni',
  COUNT(*),
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)
FROM rioni;
```

Se vedi `with_user_id = 0` per entrambi, continua con il prossimo step.

### 2. Crea gli Utenti su Supabase Auth (2 minuti)

1. Vai su: https://app.supabase.com/project/YOUR_PROJECT/auth/users
2. Clicca "Invite user"
3. Aggiungi email admin: `admin@taurisaniadi.it`
4. Clicca "Send invite link"
5. **Copia l'UUID** (es. `f47ac10b-58cc-4372-a567-0e02b2c3d479`)
6. Ripeti per ogni caporione

### 3. Collega gli Utenti (1 minuto)

Esegui nel SQL Editor (sostituisci gli UUID reali):

```sql
-- Admin
UPDATE admin_credentials
SET user_id = 'UUID_DELL_ADMIN_REALE'
WHERE id = (SELECT id FROM admin_credentials LIMIT 1);

-- Caporioni (ripeti per ogni rione)
UPDATE rioni
SET user_id = 'UUID_DEL_CAPORIONE_1_REALE'
WHERE nome = 'Rione 1';

UPDATE rioni
SET user_id = 'UUID_DEL_CAPORIONE_2_REALE'
WHERE nome = 'Rione 2';
-- ... continua per tutti
```

### 4. Test Locale (1 minuto)

```bash
npm run dev
```

Apri `http://localhost:5173`:
- Clicca "Entra da Amministratore"
- Inserisci email e password dell'admin
- Dovresti essere reindirizzato a `admin_panel.html`

✅ Se funziona, sei pronto!

---

## Comandi Utili

### Trovare gli UUID degli Utenti

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC;
```

### Controllare i Collegamenti

```sql
-- Admin
SELECT id, username, user_id FROM admin_credentials;

-- Caporioni
SELECT id, nome, username, user_id FROM rioni;
```

### Ricollegare un Utente

```sql
UPDATE admin_credentials
SET user_id = 'NUOVO_UUID'
WHERE username = 'admin';
```

### Scaricare il Log dei Tentativi di Login

```bash
# Nel browser, apri DevTools (F12) e copia dal Console:
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth Event:', event);
  console.log('Session:', session);
});
```

---

## Errori Comuni

| Errore | Causa | Soluzione |
|--------|-------|----------|
| "Utente non autorizzato" | user_id non collegato | Esegui l'UPDATE SQL |
| "RLS Policy Violation" | Policy non configurata | Verifica la migrazione SQL |
| "Password errata" | Vecchia password dal sistema precedente | Usa il link "Reimposta password" |
| "Session scaduta" | JWT token scaduto | Ricarica la pagina o refaccia login |

---

## File Principali

| File | Descrizione |
|------|-------------|
| `auth.js` | Sistema di autenticazione Supabase |
| `index.html` | Login form (email + password) |
| `admin_panel.html` | Pannello admin (verificato con checkAuth) |
| `caporione.html` | Area caporione (verificato con checkAuth) |
| `SUPABASE_AUTH_SETUP.md` | Documentazione completa |
| `SETUP_SCRIPT.sql` | Script di verifica completo |
| `CHECKLIST_FINALE.md` | Checklist passo-passo |

---

## Variabili di Ambiente Necessarie

Nel file `.env` (già configurato):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx...
```

Verifica che siano corretti:
1. Vai su Supabase Dashboard > Project Settings > API
2. Copia l'URL e l'anon key
3. Incolla nel `.env`

---

## Testare il Sistema Completo (5 minuti)

```bash
# 1. Build di produzione
npm run build

# 2. Verifica il build
npm run preview

# 3. Apri http://localhost:4173 nel browser

# 4. Test login admin
# 5. Test login caporione
# 6. Test spettatore (no login)
# 7. Test logout
```

✅ Se tutto funziona, sei pronto per il deploy!

---

## Prossimi Step

1. **Se nuovo login non funziona**: Rivedi il file `.env` e le credenziali Supabase
2. **Se gli atleti non si caricano**: Controlla la RLS policy su `atleti`
3. **Se il logout non funziona**: Verifica che `window.signOut()` sia disponibile
4. **Se la password non si aggiorna**: Usa `window.updateUserPassword()` al posto di UPDATE SQL

---

## Supporto Veloce

**Check 1: Auth.js caricato?**
```javascript
// Nel browser console (F12)
window.signInWithEmail // Deve restituire una funzione
```

**Check 2: Sessione attiva?**
```javascript
// Nel browser console
const { data: { session } } = await window.supabaseClient.auth.getSession()
console.log(session) // Deve mostrare l'utente corrente
```

**Check 3: Politiche RLS attive?**
```sql
-- Nel SQL Editor di Supabase
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Deve mostrare 40+
```

Se tutti gli check passano, il sistema è pronto! 🚀
