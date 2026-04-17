async function login(username, password) {
    if (!window.supabaseClient) {
        return { success: false, error: 'Errore di connessione al database' };
    }

    try {
        // 1. Controlla se è l'Amministratore
        const { data: adminData, error: adminError } = await window.supabaseClient
            .from('admin_credentials')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (adminData) {
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('username', username);
            return { success: true, role: 'admin' };
        }

        // 2. Controlla se è un Capo-Rione
        const { data: rioneData, error: rioneError } = await window.supabaseClient
            .from('rioni')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (rioneData) {
            localStorage.setItem('userRole', 'caporione');
            localStorage.setItem('rioneId', rioneData.id); // Salva l'ID reale (UUID) dal database!
            localStorage.setItem('username', username);
            return { success: true, role: 'caporione', rioneId: rioneData.id };
        }

        // Se non trova nessuno dei due
        return { success: false, error: 'Credenziali non valide' };
    } catch (error) {
        console.error('Errore durante il login:', error);
        return { success: false, error: 'Errore di sistema' };
    }
}

function logout() {
    // 1. Cancella i dati dalla memoria
    localStorage.removeItem('userRole');
    localStorage.removeItem('rioneId');
    localStorage.removeItem('username');
    
    // 2. LA RIGA MAGICA: Riporta l'utente alla pagina di login!
    window.location.href = 'index.html';
    
    return { success: true };
}

function getCurrentRole() {
    return localStorage.getItem('userRole');
}

function getCurrentRioneId() {
    return localStorage.getItem('rioneId');
}

function isAuthenticated() {
    return !!localStorage.getItem('userRole');
}

window.login = login;
window.logout = logout;
window.getCurrentRole = getCurrentRole;
window.getCurrentRioneId = getCurrentRioneId;
window.isAuthenticated = isAuthenticated;
