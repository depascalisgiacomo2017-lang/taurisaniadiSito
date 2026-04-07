async function checkAuth(requiredRole) {
    const userRole = localStorage.getItem('userRole');

    if (!userRole || (requiredRole && userRole !== requiredRole)) {
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

async function loginAdmin(username, password) {
    const { data, error } = await supabaseClient
        .from('admin_credentials')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

    if (error || !data) {
        return { success: false, error: 'Credenziali non valide' };
    }

    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('username', username);
    return { success: true };
}

async function loginCaporione(username, password) {
    const { data, error } = await supabaseClient
        .from('rioni')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

    if (error || !data) {
        return { success: false, error: 'Credenziali non valide' };
    }

    localStorage.setItem('userRole', 'caporione');
    localStorage.setItem('rioneId', data.id);
    localStorage.setItem('username', username);
    return { success: true };
}

function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('rioneId');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

window.checkAuth = checkAuth;
window.loginAdmin = loginAdmin;
window.loginCaporione = loginCaporione;
window.logout = logout;
