async function updateAdminCredentials(newUsername, newPassword) {
    const { data, error } = await supabaseClient
        .from('admin_credentials')
        .update({ username: newUsername, password: newPassword, updated_at: new Date().toISOString() })
        .eq('username', localStorage.getItem('username'));

    if (error) {
        console.error('Error updating credentials:', error);
        return { success: false, error };
    }

    localStorage.setItem('username', newUsername);
    return { success: true };
}

async function updateRioneCredentials(rioneId, newUsername, newPassword) {
    const { data, error } = await supabaseClient
        .from('rioni')
        .update({ username: newUsername, password: newPassword })
        .eq('id', rioneId);

    if (error) {
        console.error('Error updating rione credentials:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function sendMessageToRione(text, fileUrl = null, fileName = null) {
    const { data, error } = await supabaseClient
        .from('messaggi')
        .insert({
            sender_name: 'Amministratore',
            sender_type: 'admin',
            text: text,
            file_url: fileUrl,
            file_name: fileName
        });

    if (error) {
        console.error('Error sending message:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function updateMinDonneDefault(value) {
    const { data, error } = await supabaseClient
        .from('impostazioni')
        .upsert({ key: 'min_donne_default', value: value });

    if (error) {
        console.error('Error updating min donne:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function addFasciaEta(nome, minEta, maxEta) {
    const { data, error } = await supabaseClient
        .from('fasce_eta')
        .insert({ nome, min_eta: minEta, max_eta: maxEta });

    if (error) {
        console.error('Error adding age group:', error);
        return { success: false, error };
    }

    return { success: true, data };
}

async function deleteFasciaEta(id) {
    const { data, error } = await supabaseClient
        .from('fasce_eta')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting age group:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function updateGame(gameId, updates) {
    const mappedUpdates = {};

    if (updates.nome !== undefined) mappedUpdates.name = updates.nome;
    if (updates.luogo !== undefined) mappedUpdates.location = updates.luogo;
    if (updates.data !== undefined) mappedUpdates.date = updates.data;
    if (updates.ora_inizio !== undefined) mappedUpdates.time_start = updates.ora_inizio;
    if (updates.ora_fine !== undefined) mappedUpdates.time_end = updates.ora_fine;
    if (updates.live_stream_url !== undefined) mappedUpdates.live_stream_url = updates.live_stream_url;
    if (updates.bracket_image_url !== undefined) mappedUpdates.bracket_image_url = updates.bracket_image_url;
    if (updates.mandatory_women !== undefined) mappedUpdates.mandatory_women = updates.mandatory_women;

    const { data, error } = await supabaseClient
        .from('giochi')
        .update(mappedUpdates)
        .eq('id', gameId);

    if (error) {
        console.error('Error updating game:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function deleteGame(gameId) {
    await supabaseClient.from('squadre').delete().eq('game_id', gameId);

    const { data, error } = await supabaseClient
        .from('giochi')
        .delete()
        .eq('id', gameId);

    if (error) {
        console.error('Error deleting game:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function updateLiveStreamUrl(gameId, liveStreamUrl) {
    const { data, error } = await supabaseClient
        .from('giochi')
        .update({ live_stream_url: liveStreamUrl })
        .eq('id', gameId);

    if (error) {
        console.error('Error updating live stream:', error);
        return { success: false, error };
    }

    return { success: true };
}

async function updateBracketImage(gameId, bracketImageUrl) {
    const { data, error } = await supabaseClient
        .from('giochi')
        .update({ bracket_image_url: bracketImageUrl })
        .eq('id', gameId);

    if (error) {
        console.error('Error updating bracket image:', error);
        return { success: false, error };
    }

    return { success: true };
}

function getAthleteStats() {
    const stats = {};

    window.appState.atleti.forEach(atleta => {
        const rioneNome = window.appState.rioni.find(r => r.id === atleta.rione_id)?.nome || 'Sconosciuto';

        if (!stats[rioneNome]) {
            stats[rioneNome] = [];
        }

        const partecipazioni = window.appState.squadre.filter(squadra => {
            if (squadra.rione_id !== atleta.rione_id) return false;
            const playerNames = squadra.player_names || [];
            return playerNames.some(name =>
                name.toLowerCase().includes(atleta.nome.toLowerCase()) ||
                name.toLowerCase().includes(atleta.cognome.toLowerCase())
            );
        }).length;

        stats[rioneNome].push({
            id: atleta.id,
            nome: `${atleta.nome} ${atleta.cognome}`,
            eta: atleta.eta,
            sesso: atleta.sesso,
            partecipazioni: partecipazioni
        });
    });

    return stats;
}

window.updateAdminCredentials = updateAdminCredentials;
window.updateRioneCredentials = updateRioneCredentials;
window.sendMessageToRione = sendMessageToRione;
window.updateMinDonneDefault = updateMinDonneDefault;
window.addFasciaEta = addFasciaEta;
window.deleteFasciaEta = deleteFasciaEta;
window.updateGame = updateGame;
window.deleteGame = deleteGame;
window.updateLiveStreamUrl = updateLiveStreamUrl;
window.updateBracketImage = updateBracketImage;
window.getAthleteStats = getAthleteStats;
