async function login(username, password) {
    if (!window.supabaseClient) {
        return { success: false, error: 'Errore database' };
    }

    try {
        // IL TRUCCO: Aggiunge in automatico @taurisaniadi.it all'username per usare l'Auth ufficiale
        let loginEmail = username === 'admin' ? 'admin@taurisaniadi.it' : `${username.toLowerCase()}@taurisaniadi.it`;

        // Login ufficiale tramite Supabase Auth
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: loginEmail,
            password: password,
        });

        if (error) {
            return { success: false, error: 'Credenziali non valide' };
        }

        // Se ha successo, salviamo il ruolo in memoria
        const role = username === 'admin' ? 'admin' : 'caporione';
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', username);
        if (role === 'caporione') localStorage.setItem('rioneId', username);

        return { success: true, role: role };

    } catch (error) {
        console.error('Errore login:', error);
        return { success: false, error: 'Errore di sistema' };
    }
}

async function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('rioneId');
    localStorage.removeItem('username');
    
    // Usciamo da Supabase Auth e torniamo alla home
    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
    window.location.href = 'index.html';
    
    return { success: true };
}

function getCurrentRole() { return localStorage.getItem('userRole'); }
function getCurrentRioneId() { return localStorage.getItem('rioneId'); }
function isAuthenticated() { return !!localStorage.getItem('userRole'); }

window.login = login;
window.logout = logout;
window.getCurrentRole = getCurrentRole;
window.getCurrentRioneId = getCurrentRioneId;
window.isAuthenticated = isAuthenticated;