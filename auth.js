// Gestione autenticazione

function showAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    document.getElementById('caporione-login-modal').style.display = 'none';
}

function showCaporioneLogin() {
    const modal = document.getElementById('caporione-login-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    document.getElementById('admin-login-modal').style.display = 'none';
}

async function attemptAdminLogin() {
    const username = document.getElementById('admin-user').value;
    const password = document.getElementById('admin-pass').value;

    try {
        const { data: configData, error } = await window.supabaseClient
            .from('impostazioni')
            .select('value')
            .eq('key', 'admin_creds')
            .maybeSingle();

        if (error) throw error;

        const adminCreds = configData?.value;

        if (adminCreds && username === adminCreds.username && password === adminCreds.password) {
            sessionStorage.setItem('userRole', 'admin');
            sessionStorage.setItem('userName', 'Amministratore');
            window.location.href = 'admin_panel.html';
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    } catch (error) {
        console.error('Errore login admin:', error);
        document.getElementById('login-error').style.display = 'block';
    }
}

async function attemptCaporioneLogin() {
    const username = document.getElementById('caporione-user').value;
    const password = document.getElementById('caporione-pass').value;

    try {
        const { data: rione, error } = await window.supabaseClient
            .from('rioni')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();

        if (error) throw error;

        if (rione) {
            sessionStorage.setItem('userRole', 'caporione');
            sessionStorage.setItem('rioneId', rione.id);
            sessionStorage.setItem('rioneName', rione.nome);
            window.location.href = 'caporione.html';
        } else {
            document.getElementById('login-error-capo').style.display = 'block';
        }
    } catch (error) {
        console.error('Errore login caporione:', error);
        document.getElementById('login-error-capo').style.display = 'block';
    }
}

function checkAuth(requiredRole) {
    const role = sessionStorage.getItem('userRole');
    if (!role || (requiredRole && role !== requiredRole)) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
