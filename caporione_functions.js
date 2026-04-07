async function sendMessageAsRione(text, fileUrl = null, fileName = null) {
    const rioneId = localStorage.getItem('rioneId');
    const rione = window.appState.rioni.find(r => r.id === rioneId);

    if (!rione) {
        return { success: false, error: 'Rione non trovato' };
    }

    const { data, error } = await supabaseClient
        .from('messaggi')
        .insert({
            sender_name: rione.nome,
            sender_type: 'rione',
            sender_rione_id: rioneId,
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

function getCurrentRione() {
    const rioneId = localStorage.getItem('rioneId');
    return window.appState.rioni.find(r => r.id === rioneId);
}

function getRioneAtleti() {
    const rioneId = localStorage.getItem('rioneId');
    return window.appState.atleti.filter(a => a.rione_id === rioneId);
}

function getRioneGiochi() {
    const rioneId = localStorage.getItem('rioneId');
    return window.appState.squadre
        .filter(s => s.rione_id === rioneId)
        .map(squadra => {
            const gioco = window.appState.giochi.find(g => g.id === squadra.game_id);
            return {
                ...gioco,
                squadra: squadra
            };
        });
}

window.sendMessageAsRione = sendMessageAsRione;
window.getCurrentRione = getCurrentRione;
window.getRioneAtleti = getRioneAtleti;
window.getRioneGiochi = getRioneGiochi;
