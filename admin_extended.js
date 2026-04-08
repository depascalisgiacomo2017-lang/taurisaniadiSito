function showMessage(text, isError = false) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = isError ? 'message error' : 'message success';
    setTimeout(() => {
        msg.className = 'message';
    }, 3000);
}

async function changeAdminCredentials() {
    const username = document.getElementById('admin-new-username').value;
    const password = document.getElementById('admin-new-password').value;

    if (!username || !password) {
        showMessage('Inserisci username e password', true);
        return;
    }

    const result = await updateAdminCredentials(username, password);
    if (result.success) {
        showMessage('Credenziali amministratore aggiornate con successo');
        document.getElementById('admin-new-username').value = '';
        document.getElementById('admin-new-password').value = '';
    } else {
        showMessage('Errore aggiornamento credenziali', true);
    }
}

function loadRioniCredentials() {
    const container = document.getElementById('rioni-credentials-list');
    if (!container) return;

    container.innerHTML = '';

    window.appState.rioni.forEach(rione => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'flex-start';
        item.innerHTML = `
            <h3>${rione.nome}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; margin-top: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Username</label>
                    <input type="text" id="rione-user-${rione.id}" value="${rione.username}"
                        style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Password</label>
                    <input type="text" id="rione-pass-${rione.id}" value="${rione.password}"
                        style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                </div>
            </div>
            <button class="btn" style="margin-top: 10px;" onclick="updateRioneCredentialsUI('${rione.id}')">
                Aggiorna Credenziali
            </button>
        `;
        container.appendChild(item);
    });
}

async function updateRioneCredentialsUI(rioneId) {
    const username = document.getElementById(`rione-user-${rioneId}`).value;
    const password = document.getElementById(`rione-pass-${rioneId}`).value;

    if (!username || !password) {
        showMessage('Inserisci username e password', true);
        return;
    }

    const result = await updateRioneCredentials(rioneId, username, password);
    if (result.success) {
        showMessage('Credenziali rione aggiornate con successo');
        await loadData();
    } else {
        showMessage('Errore aggiornamento credenziali', true);
    }
}

async function uploadFile(file, bucket) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const apiUrl = `${window.SUPABASE_URL}/functions/v1/upload-file`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || 'Upload failed');
        }

        return { success: true, url: data.url, fileName: data.fileName };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

async function sendChatMessage() {
    const text = document.getElementById('chat-text').value;
    const fileInput = document.getElementById('chat-file');
    const file = fileInput.files[0];

    if (!text && !file) {
        showMessage('Inserisci un messaggio o un file', true);
        return;
    }

    let fileUrl = null;
    let fileName = null;

    if (file) {
        showMessage('Caricamento file in corso...');
        const uploadResult = await uploadFile(file, 'chat-files');

        if (!uploadResult.success) {
            showMessage('Errore caricamento file: ' + uploadResult.error, true);
            return;
        }

        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
    }

    const result = await sendMessageToRione(text || '', fileUrl, fileName);
    if (result.success) {
        showMessage('Messaggio inviato con successo');
        document.getElementById('chat-text').value = '';
        fileInput.value = '';
        await loadData();
        loadChatMessages();
    } else {
        showMessage('Errore invio messaggio', true);
    }
}

async function forceDataRefresh() {
    showMessage('Aggiornamento dati in corso...');
    await loadData();

    loadRioniList();
    loadGiochiList();
    loadHighlightsList();
    loadConfigForm();
    loadRioniCredentials();
    loadFasceList();
    loadChatMessages();

    showMessage('Dati aggiornati con successo');
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

async function clearAllChatMessages() {
    if (!confirm('Sei sicuro di voler eliminare TUTTI i messaggi della chat? Questa azione non può essere annullata.')) {
        return;
    }

    const { error } = await window.supabaseClient
        .from('messaggi')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        showMessage('Errore eliminazione messaggi: ' + error.message, true);
        return;
    }

    showMessage('Chat svuotata con successo');
    await loadData();
    loadChatMessages();
}

async function addNewFasciaEta() {
    const nome = document.getElementById('fascia-nome').value;
    const minEta = parseInt(document.getElementById('fascia-min').value);
    const maxEta = parseInt(document.getElementById('fascia-max').value);

    if (!nome || isNaN(minEta) || isNaN(maxEta)) {
        showMessage('Compila tutti i campi', true);
        return;
    }

    if (minEta >= maxEta) {
        showMessage('Età minima deve essere minore di età massima', true);
        return;
    }

    const result = await addFasciaEta(nome, minEta, maxEta);
    if (result.success) {
        showMessage('Fascia età aggiunta con successo');
        document.getElementById('fascia-nome').value = '';
        document.getElementById('fascia-min').value = '';
        document.getElementById('fascia-max').value = '';
        await loadData();
        loadFasceList();
    } else {
        showMessage('Errore aggiunta fascia età', true);
    }
}

function loadFasceList() {
    const container = document.getElementById('fasce-list');
    if (!container) return;

    container.innerHTML = '';

    const fasce = window.appState.fasce_eta || [];

    fasce.forEach(fascia => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div>
                <h3>${fascia.nome}</h3>
                <p style="color: #5d4037; margin-top: 5px;">Età: ${fascia.min_eta} - ${fascia.max_eta}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteFasciaEtaUI('${fascia.id}')">
                Elimina
            </button>
        `;
        container.appendChild(item);
    });
}

async function deleteFasciaEtaUI(id) {
    if (!confirm('Sei sicuro di voler eliminare questa fascia di età?')) return;

    const result = await deleteFasciaEta(id);
    if (result.success) {
        showMessage('Fascia età eliminata con successo');
        await loadData();
        loadFasceList();
    } else {
        showMessage('Errore eliminazione fascia età', true);
    }
}

function loadAthleteStats() {
    const stats = getAthleteStats();
    const container = document.getElementById('stats-container');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(stats).forEach(rioneName => {
        const rioneDiv = document.createElement('div');
        rioneDiv.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 2px solid #8b6538;
        `;

        let html = `<h3 style="margin-bottom: 15px; color: #2c1810;">${rioneName}</h3>`;

        if (stats[rioneName].length === 0) {
            html += '<p style="color: #999;">Nessun atleta</p>';
        } else {
            html += `<table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #8b6538; color: #f4e8d0;">
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: center;">Età</th>
                        <th style="padding: 10px; text-align: center;">Sesso</th>
                        <th style="padding: 10px; text-align: center;">Partecipazioni</th>
                    </tr>
                </thead>
                <tbody>`;

            stats[rioneName].forEach((atleta, idx) => {
                html += `
                    <tr style="background: ${idx % 2 === 0 ? '#f5f5f5' : 'white'}; border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px;">${atleta.nome}</td>
                        <td style="padding: 10px; text-align: center;">${atleta.eta}</td>
                        <td style="padding: 10px; text-align: center;">${atleta.sesso}</td>
                        <td style="padding: 10px; text-align: center; font-weight: bold;">
                            ${atleta.partecipazioni}
                        </td>
                    </tr>
                `;
            });

            html += `</tbody></table>`;
        }

        rioneDiv.innerHTML = html;
        container.appendChild(rioneDiv);
    });
}

function loadGiochiList() {
    const container = document.getElementById('giochi-list');
    if (!container) return;

    container.innerHTML = '';

    const giochi = window.appState.giochi || [];

    giochi.forEach(gioco => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.style.cursor = 'pointer';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'flex-start';

        const date = gioco.date ? new Date(gioco.date).toLocaleDateString('it-IT') : 'N/A';

        const womenCount = gioco.mandatory_women !== null ? gioco.mandatory_women :
            (gioco.player_positions?.filter(p => p.required_gender === 'F').length || 0);

        item.innerHTML = `
            <div style="width: 100%;">
                <h3>${gioco.name}</h3>
                <p style="color: #5d4037; margin-top: 5px;">
                    📅 ${date} | ⏰ ${gioco.time_start || 'N/A'} - ${gioco.time_end || 'N/A'}<br>
                    📍 ${gioco.location || 'N/A'} | 👩 Min. donne: ${womenCount} ${gioco.mandatory_women === null ? '(auto)' : '(manuale)'}
                    ${gioco.live_stream_url ? '<br>📹 Live attivo' : ''}
                    ${gioco.bracket_image_url ? '<br>🏆 Tabellone presente' : ''}
                </p>
                <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn" onclick="openEditGameModal('${gioco.id}')">Modifica</button>
                    <button class="btn btn-danger" onclick="deleteGameUI('${gioco.id}')">Elimina</button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function editGame(gameId) {
    const gioco = window.appState.giochi.find(g => g.id === gameId);
    if (!gioco) return;

    const nome = prompt('Nome gioco:', gioco.name);
    if (nome === null) return;

    const luogo = prompt('Luogo:', gioco.location || '');
    const data = prompt('Data (YYYY-MM-DD):', gioco.date || '');
    const oraInizio = prompt('Ora inizio (HH:MM):', gioco.time_start || '');
    const oraFine = prompt('Ora fine (HH:MM):', gioco.time_end || '');
    const liveUrl = prompt('URL Live Stream:', gioco.live_stream_url || '');
    const bracketUrl = prompt('URL Tabellone:', gioco.bracket_image_url || '');
    const minDonne = prompt('Numero minimo donne (lascia vuoto per calcolo automatico):', gioco.mandatory_women !== null ? gioco.mandatory_women : '');

    const updates = {
        nome: nome || gioco.name,
        luogo: luogo || gioco.location,
        data: data || gioco.date,
        ora_inizio: oraInizio || gioco.time_start,
        ora_fine: oraFine || gioco.time_end,
        live_stream_url: liveUrl || null,
        bracket_image_url: bracketUrl || null,
        mandatory_women: minDonne ? parseInt(minDonne) : null
    };

    updateGame(gameId, updates).then(result => {
        if (result.success) {
            showMessage('Gioco aggiornato con successo');
            loadData().then(() => loadGiochiList());
        } else {
            showMessage('Errore aggiornamento gioco', true);
        }
    });
}

async function deleteGameUI(gameId) {
    if (!confirm('Sei sicuro di voler eliminare questo gioco? Verranno eliminate anche tutte le squadre associate.')) {
        return;
    }

    const result = await deleteGame(gameId);
    if (result.success) {
        showMessage('Gioco eliminato con successo');
        await loadData();
        loadGiochiList();
    } else {
        showMessage('Errore eliminazione gioco', true);
    }
}

async function addRione() {
    const nome = document.getElementById('rione-nome').value;
    const username = document.getElementById('rione-username').value;
    const password = document.getElementById('rione-password').value;
    const colore = document.getElementById('rione-color').value;

    if (!nome || !username || !password) {
        showMessage('Compila tutti i campi', true);
        return;
    }

    const rioneData = {
        nome: nome,
        username: username,
        password: password,
        colore: colore || '#000000',
        punteggio: 0
    };

    const { data, error } = await window.supabaseClient
        .from('rioni')
        .insert(rioneData);

    if (error) {
        showMessage('Errore creazione rione: ' + error.message, true);
        return;
    }

    showMessage('Rione creato con successo');

    document.getElementById('rione-nome').value = '';
    document.getElementById('rione-username').value = '';
    document.getElementById('rione-password').value = '';
    document.getElementById('rione-color').value = '#FF5722';

    await loadData();
    loadRioniList();
}

async function addGioco() {
    const nome = document.getElementById('gioco-nome').value;
    const luogo = document.getElementById('gioco-luogo').value;
    const data = document.getElementById('gioco-data').value;
    const oraInizio = document.getElementById('gioco-inizio').value;
    const oraFine = document.getElementById('gioco-fine').value;
    const descTecnica = document.getElementById('gioco-desc-tecnica').value;
    const descSpettatori = document.getElementById('gioco-desc-spettatori').value;
    const liveUrl = document.getElementById('gioco-live-url').value;
    const whatsappLink = document.getElementById('gioco-whatsapp').value;
    const totalPlayers = parseInt(document.getElementById('gioco-total-players').value) || 1;
    const bonusPerPlayer = parseInt(document.getElementById('gioco-bonus-per-player').value) || 0;
    const mandatoryWomenInput = document.getElementById('gioco-mandatory-women').value;
    const mandatoryWomen = mandatoryWomenInput ? parseInt(mandatoryWomenInput) : null;
    const bracketFile = document.getElementById('gioco-bracket-file').files[0];

    if (!nome) {
        showMessage('Inserisci il nome del gioco', true);
        return;
    }

    const playerPositions = [];
    for (let i = 1; i <= totalPlayers; i++) {
        const minAge = parseInt(document.getElementById(`pos-${i}-min-age`)?.value) || 0;
        const maxAge = parseInt(document.getElementById(`pos-${i}-max-age`)?.value) || 99;
        const requiredGender = document.getElementById(`pos-${i}-gender`)?.value || null;

        playerPositions.push({
            position: i,
            min_age: minAge,
            max_age: maxAge,
            required_gender: requiredGender === 'any' ? null : requiredGender
        });
    }

    let bracketUrl = null;

    if (bracketFile) {
        showMessage('Caricamento tabellone in corso...');
        const uploadResult = await uploadFile(bracketFile, 'game-brackets');

        if (!uploadResult.success) {
            showMessage('Errore caricamento tabellone: ' + uploadResult.error, true);
            return;
        }

        bracketUrl = uploadResult.url;
    }

    const gameData = {
        name: nome,
        location: luogo || null,
        date: data || null,
        time_start: oraInizio || null,
        time_end: oraFine || null,
        description: descTecnica || null,
        desc_spectator: descSpettatori || null,
        live_stream_url: liveUrl || null,
        whatsapp_link: whatsappLink || null,
        bracket_image_url: bracketUrl,
        total_players: totalPlayers,
        bonus_per_player: bonusPerPlayer,
        mandatory_women: mandatoryWomen,
        player_positions: playerPositions,
        slots: [],
        restricted_rioni: [],
        in_progress: false
    };

    const { data: insertedData, error } = await window.supabaseClient
        .from('giochi')
        .insert(gameData);

    if (error) {
        showMessage('Errore creazione gioco: ' + error.message, true);
        return;
    }

    showMessage('Gioco creato con successo');

    document.getElementById('gioco-nome').value = '';
    document.getElementById('gioco-luogo').value = '';
    document.getElementById('gioco-data').value = '';
    document.getElementById('gioco-inizio').value = '';
    document.getElementById('gioco-fine').value = '';
    document.getElementById('gioco-desc-tecnica').value = '';
    document.getElementById('gioco-desc-spettatori').value = '';
    document.getElementById('gioco-live-url').value = '';
    document.getElementById('gioco-bracket-file').value = '';
    document.getElementById('gioco-total-players').value = '5';
    document.getElementById('gioco-bonus-per-player').value = '0';
    document.getElementById('positions-config').innerHTML = '';

    await loadData();
    loadGiochiList();
}

function updatePositionsConfig() {
    const totalPlayers = parseInt(document.getElementById('gioco-total-players').value) || 0;
    const container = document.getElementById('positions-config');

    if (!container || totalPlayers === 0) return;

    let html = '<div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">';
    html += '<h4 style="margin-bottom: 15px; color: #2c1810;">Configurazione Posizioni</h4>';

    for (let i = 1; i <= totalPlayers; i++) {
        html += `
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px; border: 2px solid #8b6538;">
                <h5 style="margin-bottom: 10px; color: #5d4037;">Posizione ${i}</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">Età Min</label>
                        <input type="number" id="pos-${i}-min-age" value="0" min="0"
                            style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">Età Max</label>
                        <input type="number" id="pos-${i}-max-age" value="99" min="0"
                            style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">Sesso Richiesto</label>
                        <select id="pos-${i}-gender"
                            style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                            <option value="any">Qualsiasi</option>
                            <option value="M">Maschio</option>
                            <option value="F">Femmina</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function loadRioniList() {
    const container = document.getElementById('rioni-list');
    if (!container) return;

    container.innerHTML = '';

    window.appState.rioni.forEach(rione => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div>
                <h3 style="color: ${rione.colore};">${rione.nome}</h3>
                <p style="color: #5d4037; margin-top: 5px;">
                    Punteggio: ${rione.punteggio || 0} |
                    Username: ${rione.username}
                </p>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadHighlightsList() {
    const container = document.getElementById('highlights-list');
    if (!container) return;

    container.innerHTML = '';

    window.appState.momenti_salienti.forEach(highlight => {
        const item = document.createElement('div');
        item.className = 'list-item';
        const date = new Date(highlight.created_at).toLocaleDateString('it-IT');
        item.innerHTML = `
            <div>
                <h3>${highlight.titolo}</h3>
                <p style="color: #5d4037; margin-top: 5px;">${date}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadConfigForm() {
    const bonusLimit = window.appState.config['bonus_limit'] || 3;
    const instagram = window.appState.config['instagram_link'] || '';
    const facebook = window.appState.config['facebook_link'] || '';
    const youtube = window.appState.config['youtube_link'] || '';
    const whatsapp = window.appState.config['whatsapp_link'] || '';
    const discord = window.appState.config['discord_link'] || '';

    const bonusInput = document.getElementById('config-bonus');
    const instagramInput = document.getElementById('config-instagram');
    const facebookInput = document.getElementById('config-facebook');
    const youtubeInput = document.getElementById('config-youtube');
    const whatsappInput = document.getElementById('config-whatsapp');
    const discordInput = document.getElementById('config-discord');

    if (bonusInput) bonusInput.value = bonusLimit;
    if (instagramInput) instagramInput.value = instagram;
    if (facebookInput) facebookInput.value = facebook;
    if (youtubeInput) youtubeInput.value = youtube;
    if (whatsappInput) whatsappInput.value = whatsapp;
    if (discordInput) discordInput.value = discord;
}

async function saveConfig() {
    const bonusLimit = document.getElementById('config-bonus').value;
    const instagram = document.getElementById('config-instagram').value;
    const facebook = document.getElementById('config-facebook').value;
    const youtube = document.getElementById('config-youtube').value;
    const whatsapp = document.getElementById('config-whatsapp').value;
    const discord = document.getElementById('config-discord').value;

    const updates = [
        { key: 'bonus_limit', value: bonusLimit },
        { key: 'instagram_link', value: instagram },
        { key: 'facebook_link', value: facebook },
        { key: 'youtube_link', value: youtube },
        { key: 'whatsapp_link', value: whatsapp },
        { key: 'discord_link', value: discord }
    ];

    for (const update of updates) {
        const { error } = await window.supabaseClient
            .from('impostazioni')
            .upsert(update);

        if (error) {
            showMessage('Errore salvataggio configurazioni: ' + error.message, true);
            return;
        }
    }

    showMessage('Configurazioni salvate con successo');
    await loadData();
}

window.showMessage = showMessage;
window.changeAdminCredentials = changeAdminCredentials;
window.loadRioniCredentials = loadRioniCredentials;
window.updateRioneCredentialsUI = updateRioneCredentialsUI;
window.uploadFile = uploadFile;
window.sendChatMessage = sendChatMessage;
window.loadChatMessages = loadChatMessages;
window.clearAllChatMessages = clearAllChatMessages;
window.forceDataRefresh = forceDataRefresh;
window.addNewFasciaEta = addNewFasciaEta;
window.loadFasceList = loadFasceList;
window.deleteFasciaEtaUI = deleteFasciaEtaUI;
window.loadAthleteStats = loadAthleteStats;
window.loadGiochiList = loadGiochiList;
window.editGame = editGame;
window.deleteGameUI = deleteGameUI;
window.addRione = addRione;
window.addGioco = addGioco;
window.updatePositionsConfig = updatePositionsConfig;
window.loadRioniList = loadRioniList;
window.loadHighlightsList = loadHighlightsList;
window.loadConfigForm = loadConfigForm;
window.saveConfig = saveConfig;
