let currentUser = null;
let currentUserRole = null;
let currentRioneId = null;

async function initializeAuth() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (session?.user) {
        currentUser = session.user;
        await loadUserRoleAndMetadata();
    }
}

async function loadUserRoleAndMetadata() {
    if (!currentUser) return;

    const adminCheck = await window.supabaseClient
        .from('admin_credentials')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

    if (adminCheck.data) {
        currentUserRole = 'admin';
        return;
    }

    const rioneCheck = await window.supabaseClient
        .from('rioni')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

    if (rioneCheck.data) {
        currentUserRole = 'caporione';
        currentRioneId = rioneCheck.data.id;
        return;
    }

    currentUserRole = null;
    currentRioneId = null;
}

async function signUp(email, password, roleData = {}) {
    try {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/index.html`,
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data.user) {
            currentUser = data.user;

            if (roleData.type === 'admin') {
                const { error: adminError } = await window.supabaseClient
                    .from('admin_credentials')
                    .insert({
                        user_id: data.user.id,
                        username: roleData.username,
                        password: null
                    });

                if (adminError) {
                    return { success: false, error: adminError.message };
                }
                currentUserRole = 'admin';
            } else if (roleData.type === 'caporione') {
                const { error: rioneError } = await window.supabaseClient
                    .from('rioni')
                    .insert({
                        user_id: data.user.id,
                        nome: roleData.nome,
                        username: roleData.username,
                        password: null,
                        colore: roleData.colore
                    });

                if (rioneError) {
                    return { success: false, error: rioneError.message };
                }
                currentUserRole = 'caporione';
            }
        }

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signInWithEmail(email, password) {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data.user) {
            currentUser = data.user;
            await loadUserRoleAndMetadata();

            if (!currentUserRole) {
                await window.supabaseClient.auth.signOut();
                currentUser = null;
                return { success: false, error: 'Utente non autorizzato' };
            }
        }

        return { success: true, user: data.user, role: currentUserRole, rioneId: currentRioneId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        currentUser = null;
        currentUserRole = null;
        currentRioneId = null;
        localStorage.removeItem('userRole');
        localStorage.removeItem('rioneId');
        localStorage.removeItem('username');

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function checkAuth(requiredRole) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session?.user) {
        window.location.href = 'index.html';
        return false;
    }

    currentUser = session.user;
    await loadUserRoleAndMetadata();

    if (requiredRole && currentUserRole !== requiredRole) {
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

async function resetPassword(email) {
    try {
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/index.html?reset=true`
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getCurrentUser() {
    return currentUser;
}

function getCurrentUserRole() {
    return currentUserRole;
}

function getCurrentRioneId() {
    return currentRioneId;
}

async function updateUserPassword(newPassword) {
    try {
        const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

window.initializeAuth = initializeAuth;
window.signUp = signUp;
window.signInWithEmail = signInWithEmail;
window.signOut = signOut;
window.checkAuth = checkAuth;
window.resetPassword = resetPassword;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserRole = getCurrentUserRole;
window.getCurrentRioneId = getCurrentRioneId;
window.updateUserPassword = updateUserPassword;
