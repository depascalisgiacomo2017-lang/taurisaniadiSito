# Comandi SQL Pronti all'Uso

Copia e incolla questi comandi direttamente nell'**SQL Editor** di Supabase.

## 📋 Sezione 1: Verifica del Setup

### Controlla che tutto sia installato correttamente

```sql
-- Verifica 1: Colonne user_id presenti
SELECT table_name, column_name FROM information_schema.columns
WHERE table_name IN ('admin_credentials', 'rioni')
  AND column_name = 'user_id';

-- Dovrebbe restituire 2 righe (una per tabella)
```

```sql
-- Verifica 2: RLS abilitato
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('admin_credentials', 'rioni', 'atleti', 'squadre', 'giochi', 'fasce_eta', 'messaggi', 'impostazioni', 'momenti_salienti', 'classifica', 'statistiche')
ORDER BY tablename;

-- Dovrebbe mostrare rowsecurity = true per tutte
```

```sql
-- Verifica 3: RLS Policies count
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- Dovrebbe mostrare 40+
```

---

## 👥 Sezione 2: Gestione Utenti

### Ottenere gli UUID degli Utenti Supabase Auth

```sql
-- Lista tutti gli utenti con UUID, email e data creazione
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
```

### Controllare i Collegamenti user_id

```sql
-- Mostra admin_credentials con dettagli auth
SELECT
  ac.id,
  ac.username,
  ac.user_id,
  u.email,
  u.created_at
FROM admin_credentials ac
LEFT JOIN auth.users u ON u.id = ac.user_id;
```

```sql
-- Mostra rioni con dettagli auth
SELECT
  r.id,
  r.nome,
  r.username,
  r.user_id,
  u.email,
  u.created_at
FROM rioni r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.nome;
```

---

## 🔗 Sezione 3: Collegare Utenti Auth ai Record

### ⚠️ IMPORTANTE: Sostituisci gli UUID prima di eseguire!

```sql
-- PASSO 1: Ottieni gli UUID reali
SELECT id, email FROM auth.users;

-- Copia gli UUID e usali nei comandi sotto
```

```sql
-- PASSO 2: Collega ADMIN (sostituisci UUID_DELL_ADMIN)
UPDATE admin_credentials
SET user_id = 'UUID_DELL_ADMIN'
WHERE id = (SELECT id FROM admin_credentials LIMIT 1);

-- Verifica
SELECT id, user_id FROM admin_credentials;
```

```sql
-- PASSO 3: Collega CAPORIONI (ripeti per ogni rione)
UPDATE rioni
SET user_id = 'UUID_DEL_CAPORIONE_1'
WHERE nome = 'Rione 1';

UPDATE rioni
SET user_id = 'UUID_DEL_CAPORIONE_2'
WHERE nome = 'Rione 2';

UPDATE rioni
SET user_id = 'UUID_DEL_CAPORIONE_3'
WHERE nome = 'Rione 3';

-- ... continua per tutti i rioni

-- Verifica
SELECT nome, user_id FROM rioni ORDER BY nome;
```

---

## 🔍 Sezione 4: Verifica Dati

### Controllare Integrità Dati

```sql
-- Verifica che non ci siano rioni senza user_id
SELECT COUNT(*) as rioni_senza_user_id FROM rioni WHERE user_id IS NULL;

-- Dovrebbe restituire 0
```

```sql
-- Verifica che non ci siano duplicati di user_id
SELECT user_id, COUNT(*) as count
FROM rioni
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Dovrebbe restituire 0 righe
```

```sql
-- Verifica che gli user_id siano validi (esistono in auth.users)
SELECT r.id, r.nome, r.user_id
FROM rioni r
WHERE r.user_id IS NOT NULL
  AND r.user_id NOT IN (SELECT id FROM auth.users);

-- Dovrebbe restituire 0 righe
```

```sql
-- Mostra statistiche complessive
SELECT
  (SELECT COUNT(*) FROM rioni) as total_rioni,
  (SELECT COUNT(*) FROM rioni WHERE user_id IS NOT NULL) as rioni_collegati,
  (SELECT COUNT(*) FROM auth.users) as total_utenti_auth,
  (SELECT COUNT(*) FROM admin_credentials) as total_admin;
```

---

## 🔐 Sezione 5: Test RLS Policies

### Test: Amministratore può leggere tutto

```sql
-- Esegui come admin (sostituisci admin_user_id)
SET LOCAL "request.jwt.claims" = json_build_object(
  'sub', 'ADMIN_USER_ID',
  'email', 'admin@test.com'
);

-- Test SELECT su admin_credentials
SELECT * FROM admin_credentials;
```

### Test: Caporione può leggere il suo rione

```sql
-- Esegui come caporione (sostituisci caporione_user_id)
SET LOCAL "request.jwt.claims" = json_build_object(
  'sub', 'CAPORIONE_USER_ID',
  'email', 'caporione@test.com'
);

-- Test SELECT del suo rione
SELECT * FROM rioni WHERE user_id = 'CAPORIONE_USER_ID';
```

### Test: Non autenticato può leggere dati pubblici

```sql
-- Pulisci la sessione (simula utente non autenticato)
RESET "request.jwt.claims";

-- Test SELECT su rioni (dovrebbe funzionare, è pubblico)
SELECT * FROM rioni;

-- Test SELECT su giochi (dovrebbe funzionare, è pubblico)
SELECT * FROM giochi;

-- Test INSERT su rioni (dovrebbe FALLIRE - non autenticato)
INSERT INTO rioni (nome, username, password)
VALUES ('Test Rione', 'test', 'pass');
-- Errore atteso: RLS Policy Violation
```

---

## 🗑️ Sezione 6: Cleanup (Opzionale)

### ⚠️ ATTENZIONE: Questi comandi modificano i dati!

```sql
-- BACKUP PRIMO!
-- Rimuovi le password dal vecchio sistema
UPDATE admin_credentials SET password = NULL;
UPDATE rioni SET password = NULL;

-- Verifica
SELECT id, password FROM admin_credentials;
SELECT id, password FROM rioni;
```

```sql
-- UNDO: Se sbagli, puoi ripristinare da backup manuale
-- (Ma assicurati di avere un backup prima!)
```

---

## 📊 Sezione 7: Report e Monitoring

### Report: Chi è collegato a chi

```sql
SELECT
  u.email,
  CASE
    WHEN ac.id IS NOT NULL THEN 'Admin'
    WHEN r.id IS NOT NULL THEN 'Caporione'
    ELSE 'Non assegnato'
  END as ruolo,
  COALESCE(ac.username, r.nome, 'N/A') as nome_sistema
FROM auth.users u
LEFT JOIN admin_credentials ac ON ac.user_id = u.id
LEFT JOIN rioni r ON r.user_id = u.id
ORDER BY u.created_at DESC;
```

### Report: Utenti senza collegamento

```sql
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.id NOT IN (
  SELECT user_id FROM admin_credentials WHERE user_id IS NOT NULL
  UNION
  SELECT user_id FROM rioni WHERE user_id IS NOT NULL
)
ORDER BY u.created_at;
```

### Report: RLS Policies Attive

```sql
SELECT
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
```

---

## 🔄 Sezione 8: Manutenzione

### Aggiungere un nuovo utente al sistema

```sql
-- 1. L'utente viene creato tramite Supabase Auth dashboard
-- 2. Copia il nuovo UUID
-- 3. Esegui uno di questi:

-- Se è un nuovo admin:
INSERT INTO admin_credentials (user_id, username, password)
VALUES ('NUOVO_UUID', 'admin_username', NULL);

-- Se è un nuovo caporione:
INSERT INTO rioni (user_id, nome, username, password, colore)
VALUES ('NUOVO_UUID', 'Nuovo Rione', 'caporione_username', NULL, '#FF0000');
```

### Rimuovere un utente dal sistema

```sql
-- ATTENZIONE: Questo cancella il record, non l'utente auth!

-- Se è un admin:
DELETE FROM admin_credentials WHERE user_id = 'UUID_DA_RIMUOVERE';

-- Se è un caporione:
DELETE FROM rioni WHERE user_id = 'UUID_DA_RIMUOVERE';

-- Per cancellare l'utente da Supabase Auth, vai a Dashboard > Authentication > Users
```

### Ricollegare un utente (es. se sbagliato UUID)

```sql
-- Per admin:
UPDATE admin_credentials
SET user_id = 'NUOVO_UUID'
WHERE user_id = 'VECCHIO_UUID';

-- Per caporione:
UPDATE rioni
SET user_id = 'NUOVO_UUID'
WHERE user_id = 'VECCHIO_UUID';
```

---

## 💡 Tips Utili

### Velocizzare le query su user_id

```sql
-- Questi indici dovrebbero già esistere, ma puoi verificare:
SELECT indexname, tablename FROM pg_indexes
WHERE indexname LIKE 'idx%user_id';

-- Se non esistono, creali:
CREATE INDEX idx_admin_user_id ON admin_credentials(user_id);
CREATE INDEX idx_rioni_user_id ON rioni(user_id);
```

### Esportare lista utenti per email

```sql
-- Esporta email admin e caporioni
SELECT
  'admin@taurisaniadi.it' as email,
  'Admin'::text as ruolo
UNION ALL
SELECT
  u.email,
  'Caporione'::text
FROM auth.users u
INNER JOIN rioni r ON r.user_id = u.id
ORDER BY ruolo DESC, email;
```

### Contare operazioni per utente

```sql
-- Numero di login per utente (da audit log se disponibile)
SELECT
  email,
  last_sign_in_at,
  created_at,
  EXTRACT(DAY FROM (last_sign_in_at - created_at)) as giorni_dal_signup
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST;
```

---

## 🚨 Emergency Commands

### Se hai dimenticato di collegare un utente

```sql
-- 1. Trova l'UUID
SELECT id FROM auth.users WHERE email = 'admin@taurisaniadi.it';

-- 2. Collega
UPDATE admin_credentials SET user_id = 'RISULTATO_QUERY_SOPRA'
WHERE username = 'admin';

-- 3. Verifica
SELECT id, user_id FROM admin_credentials;
```

### Se vedi errori di RLS

```sql
-- Verifica che RLS sia abilitato
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = FALSE;

-- Se ce ne sono, abilita RLS:
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE rioni ENABLE ROW LEVEL SECURITY;
-- ... etc per tutte le tabelle
```

---

## 📞 Come leggere i risultati

Quando esegui i comandi sopra, dovresti vedere:

**Verifica 1 (Colonne)**: ✅ 2 righe
```
table_name         | column_name
admin_credentials  | user_id
rioni             | user_id
```

**Verifica 2 (RLS)**: ✅ Tutte TRUE
```
tablename          | rowsecurity
admin_credentials  | t (true)
rioni             | t (true)
...
```

**Verifica 3 (Policies)**: ✅ 40+
```
count
-----
 42
```

Se vedi risultati diversi, contatta il supporto Supabase! 🚀

---

**Nota**: Questi comandi sono ottimizzati per Supabase PostgreSQL. Copia e incolla nel "SQL Editor" del tuo progetto Supabase.
