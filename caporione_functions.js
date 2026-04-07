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

async function uploadFile(file, bucket) {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await window.supabaseClient.storage
        .from('taurisaniadi-files')
        .upload(filePath, file);

    if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }

    const { data: urlData } = window.supabaseClient.storage
        .from('taurisaniadi-files')
        .getPublicUrl(filePath);

    return {
        success: true,
        url: urlData.publicUrl,
        fileName: file.name
    };
}

async function sendMessage() {
    const text = document.getElementById('chat-message').value;
    const fileInput = document.getElementById('chat-file-rione');
    const file = fileInput ? fileInput.files[0] : null;

    if (!text && !file) {
        showMessage('Inserisci un messaggio o un file', 'error');
        return;
    }

    let fileUrl = null;
    let fileName = null;

    if (file) {
        showMessage('Caricamento file in corso...');
        const uploadResult = await uploadFile(file, 'chat-files');

        if (!uploadResult.success) {
            showMessage('Errore caricamento file: ' + uploadResult.error, 'error');
            return;
        }

        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
    }

    const result = await sendMessageAsRione(text || '', fileUrl, fileName);
    if (result.success) {
        showMessage('Messaggio inviato con successo');
        document.getElementById('chat-message').value = '';
        if (fileInput) fileInput.value = '';
        await loadData();
        loadChatMessages();
    } else {
        showMessage('Errore invio messaggio', 'error');
    }
}

function loadChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML = '';

    const messages = window.appState.messaggi || [];

    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Nessun messaggio</p>';
        return;
    }

    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 8px;
            background: ${msg.sender_type === 'admin' ? '#e3f2fd' : '#fff3e0'};
            border-left: 4px solid ${msg.sender_type === 'admin' ? '#2196f3' : '#ff9800'};
        `;

        const date = new Date(msg.created_at);
        msgDiv.innerHTML = `
            <div style="font-weight: bold; color: #2c1810; margin-bottom: 5px;">
                ${msg.sender_name} - ${date.toLocaleString('it-IT')}
            </div>
            <div style="color: #5d4037;">${msg.text || ''}</div>
            ${msg.file_url ? `<div style="margin-top: 8px;">
                <a href="${msg.file_url}" target="_blank" download="${msg.file_name || 'file'}"
                   style="color: #1976d2; text-decoration: none; display: inline-block; padding: 5px 10px;
                          background: #e3f2fd; border-radius: 5px; border: 1px solid #2196f3;">
                    📎 ${msg.file_name || 'File allegato'} - Scarica
                </a>
            </div>` : ''}
        `;
        container.appendChild(msgDiv);
    });

    container.scrollTop = container.scrollHeight;
}

function loadAtletiList() {
    const container = document.getElementById('atleti-list');
    if (!container) return;

    const atleti = getRioneAtleti();

    if (atleti.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Nessun atleta registrato</p>';
        return;
    }

    container.innerHTML = atleti.map(atleta => `
        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 2px solid #8b6538;">
            <h3 style="margin-bottom: 10px;">${atleta.nome} ${atleta.cognome}</h3>
            <p><strong>Età:</strong> ${atleta.eta} anni</p>
            <p><strong>Sesso:</strong> ${atleta.sesso === 'M' ? 'Maschio' : 'Femmina'}</p>
            ${atleta.note ? `<p><strong>Note:</strong> ${atleta.note}</p>` : ''}
        </div>
    `).join('');
}

function loadFormazioniList() {
    const container = document.getElementById('formazioni-list');
    if (!container) return;

    const giochi = window.appState.giochi || [];

    if (giochi.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Nessun gioco disponibile</p>';
        return;
    }

    container.innerHTML = giochi.map(gioco => {
        const rioneId = localStorage.getItem('rioneId');
        const squadra = window.appState.squadre.find(s => s.game_id === gioco.id && s.rione_id === rioneId);
        const atleti = getRioneAtleti();

        return `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #8b6538;">
                <h3 style="margin-bottom: 10px;">${gioco.name}</h3>
                <p style="color: #5d4037; margin-bottom: 10px;">
                    <strong>Requisiti:</strong> ${gioco.total_players || 5} giocatori (min ${gioco.mandatory_women || 0} donne)
                </p>
                <p style="color: #5d4037; margin-bottom: 10px;">
                    <strong>Fascia Età:</strong> ${gioco.min_age || 0} - ${gioco.max_age || 99} anni
                    ${gioco.bonus_per_player > 0 ? `<br><small>Bonus fuori fascia: ${gioco.bonus_per_player} punti/giocatore</small>` : ''}
                </p>
                ${squadra ? `
                    <div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 5px;">
                        <p style="color: #2e7d32; font-weight: bold;">✓ Squadra registrata</p>
                    </div>
                ` : `
                    <div style="margin-top: 15px;">
                        <p style="color: #d32f2f; margin-bottom: 10px;">⚠ Squadra non ancora registrata</p>
                        <p style="font-size: 0.9em; color: #666;">Contatta l'amministratore per registrare la squadra</p>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

async function addAtleta() {
    const nome = document.getElementById('atleta-nome').value;
    const cognome = document.getElementById('atleta-cognome').value;
    const eta = parseInt(document.getElementById('atleta-eta').value);
    const sesso = document.getElementById('atleta-sesso').value;
    const note = document.getElementById('atleta-note').value;
    const rioneId = localStorage.getItem('rioneId');

    if (!nome || !cognome || !eta || !sesso) {
        showMessage('Compila tutti i campi obbligatori', 'error');
        return;
    }

    const { data, error } = await window.supabaseClient
        .from('atleti')
        .insert({
            rione_id: rioneId,
            nome: nome,
            cognome: cognome,
            eta: eta,
            sesso: sesso,
            note: note || null
        });

    if (error) {
        showMessage('Errore creazione atleta: ' + error.message, 'error');
        return;
    }

    showMessage('Atleta aggiunto con successo');
    document.getElementById('atleta-nome').value = '';
    document.getElementById('atleta-cognome').value = '';
    document.getElementById('atleta-eta').value = '';
    document.getElementById('atleta-sesso').value = 'M';
    document.getElementById('atleta-note').value = '';

    await loadData();
    loadAtletiList();
}

window.sendMessageAsRione = sendMessageAsRione;
window.getCurrentRione = getCurrentRione;
window.getRioneAtleti = getRioneAtleti;
window.getRioneGiochi = getRioneGiochi;
window.uploadFile = uploadFile;
window.sendMessage = sendMessage;
window.loadChatMessages = loadChatMessages;
window.loadAtletiList = loadAtletiList;
window.loadFormazioniList = loadFormazioniList;
window.addAtleta = addAtleta;
