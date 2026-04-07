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

    const rioneId = localStorage.getItem('rioneId');
    const atleti = getRioneAtleti();

    container.innerHTML = giochi.map(gioco => {
        const squadra = window.appState.squadre.find(s => s.game_id === gioco.id && s.rione_id === rioneId);
        const playerNames = squadra?.player_names || [];

        return `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #8b6538;">
                <h3 style="margin-bottom: 15px;">${gioco.name}</h3>

                <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <p style="color: #5d4037; margin-bottom: 5px;">
                        <strong>Requisiti:</strong> ${gioco.total_players || 5} giocatori (min ${gioco.mandatory_women || 0} donne)
                    </p>
                    <p style="color: #5d4037; margin-bottom: 5px;">
                        <strong>Fascia Età:</strong> ${gioco.min_age || 0} - ${gioco.max_age || 99} anni
                    </p>
                    ${gioco.bonus_per_player > 0 ? `<p style="color: #d32f2f; font-size: 0.9em;">
                        <strong>⚠ Bonus fuori fascia:</strong> ${gioco.bonus_per_player} punti/giocatore
                    </p>` : ''}
                </div>

                <div id="formazione-${gioco.id}">
                    ${squadra ? `
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                            <p style="color: #2e7d32; font-weight: bold; margin-bottom: 10px;">✓ Squadra registrata</p>
                            <div id="players-list-${gioco.id}">
                                ${playerNames.map((name, idx) => `
                                    <div style="padding: 8px; background: white; margin-bottom: 5px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center;">
                                        <span>${idx + 1}. ${name}</span>
                                        <button onclick="removePlayerFromSquad('${gioco.id}', ${idx})"
                                                style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                                            Rimuovi
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${atleti.length > 0 ? `
                        <div style="margin-top: 15px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 8px;">
                                ${squadra ? 'Aggiungi altro atleta:' : 'Seleziona atleti:'}
                            </label>
                            <select id="atleta-select-${gioco.id}" style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px; margin-bottom: 10px;">
                                <option value="">-- Seleziona atleta --</option>
                                ${atleti.map(a => {
                                    const inFascia = a.eta >= (gioco.min_age || 0) && a.eta <= (gioco.max_age || 99);
                                    const label = `${a.nome} ${a.cognome} - ${a.eta} anni (${a.sesso})`;
                                    const bonus = !inFascia && gioco.bonus_per_player > 0 ? ` [Bonus: ${gioco.bonus_per_player}]` : '';
                                    const warning = !inFascia ? ' ⚠' : '';
                                    return `<option value="${a.id}" data-eta="${a.eta}" data-sesso="${a.sesso}" data-nome="${a.nome} ${a.cognome}">${label}${warning}${bonus}</option>`;
                                }).join('')}
                            </select>
                            <button onclick="addPlayerToSquad('${gioco.id}')" class="btn" style="width: 100%;">
                                ${squadra ? 'Aggiungi Atleta' : 'Crea Squadra'}
                            </button>
                        </div>
                    ` : '<p style="color: #999; margin-top: 10px;">Nessun atleta disponibile. Aggiungi atleti nella sezione "Atleti".</p>'}

                    ${squadra ? `
                        <div id="validation-${gioco.id}" style="margin-top: 15px;"></div>
                        <button onclick="validateSquad('${gioco.id}')" class="btn" style="width: 100%; margin-top: 10px; background: #2e7d32;">
                            Verifica Requisiti
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    giochi.forEach(gioco => {
        const squadra = window.appState.squadre.find(s => s.game_id === gioco.id && s.rione_id === rioneId);
        if (squadra) {
            validateSquad(gioco.id);
        }
    });
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

async function addPlayerToSquad(gameId) {
    const select = document.getElementById(`atleta-select-${gameId}`);
    const selectedOption = select.options[select.selectedIndex];

    if (!select.value) {
        showMessage('Seleziona un atleta', 'error');
        return;
    }

    const atletaId = select.value;
    const atletaNome = selectedOption.getAttribute('data-nome');
    const rioneId = localStorage.getItem('rioneId');

    const squadra = window.appState.squadre.find(s => s.game_id === gameId && s.rione_id === rioneId);

    if (squadra) {
        const playerNames = squadra.player_names || [];

        if (playerNames.includes(atletaNome)) {
            showMessage('Atleta già presente nella squadra', 'error');
            return;
        }

        const { data, error } = await window.supabaseClient
            .from('squadre')
            .update({ player_names: [...playerNames, atletaNome] })
            .eq('id', squadra.id);

        if (error) {
            showMessage('Errore aggiunta atleta: ' + error.message, 'error');
            return;
        }

        showMessage('Atleta aggiunto con successo');
    } else {
        const { data, error } = await window.supabaseClient
            .from('squadre')
            .insert({
                game_id: gameId,
                rione_id: rioneId,
                player_names: [atletaNome]
            });

        if (error) {
            showMessage('Errore creazione squadra: ' + error.message, 'error');
            return;
        }

        showMessage('Squadra creata con successo');
    }

    select.value = '';
    await loadData();
    loadFormazioniList();
}

async function removePlayerFromSquad(gameId, playerIndex) {
    const rioneId = localStorage.getItem('rioneId');
    const squadra = window.appState.squadre.find(s => s.game_id === gameId && s.rione_id === rioneId);

    if (!squadra) {
        showMessage('Squadra non trovata', 'error');
        return;
    }

    const playerNames = squadra.player_names || [];
    const newPlayerNames = playerNames.filter((_, idx) => idx !== playerIndex);

    if (newPlayerNames.length === 0) {
        const { error } = await window.supabaseClient
            .from('squadre')
            .delete()
            .eq('id', squadra.id);

        if (error) {
            showMessage('Errore eliminazione squadra: ' + error.message, 'error');
            return;
        }

        showMessage('Squadra eliminata');
    } else {
        const { error } = await window.supabaseClient
            .from('squadre')
            .update({ player_names: newPlayerNames })
            .eq('id', squadra.id);

        if (error) {
            showMessage('Errore rimozione atleta: ' + error.message, 'error');
            return;
        }

        showMessage('Atleta rimosso');
    }

    await loadData();
    loadFormazioniList();
}

function validateSquad(gameId) {
    const rioneId = localStorage.getItem('rioneId');
    const gioco = window.appState.giochi.find(g => g.id === gameId);
    const squadra = window.appState.squadre.find(s => s.game_id === gameId && s.rione_id === rioneId);
    const validationContainer = document.getElementById(`validation-${gameId}`);

    if (!squadra || !gioco || !validationContainer) return;

    const playerNames = squadra.player_names || [];
    const atleti = getRioneAtleti();

    const totalPlayers = gioco.total_players || 5;
    const mandatoryWomen = gioco.mandatory_women || 0;
    const minAge = gioco.min_age || 0;
    const maxAge = gioco.max_age || 99;
    const bonusPerPlayer = gioco.bonus_per_player || 0;

    let womenCount = 0;
    let outOfAgeCount = 0;
    const errors = [];
    const warnings = [];

    playerNames.forEach(name => {
        const atleta = atleti.find(a => `${a.nome} ${a.cognome}` === name);
        if (atleta) {
            if (atleta.sesso === 'F') womenCount++;
            if (atleta.eta < minAge || atleta.eta > maxAge) {
                outOfAgeCount++;
                warnings.push(`${name} (${atleta.eta} anni) è fuori fascia età`);
            }
        }
    });

    if (playerNames.length < totalPlayers) {
        errors.push(`Mancano ${totalPlayers - playerNames.length} giocatori (richiesti: ${totalPlayers})`);
    } else if (playerNames.length > totalPlayers) {
        errors.push(`Troppi giocatori (richiesti: ${totalPlayers}, presenti: ${playerNames.length})`);
    }

    if (womenCount < mandatoryWomen) {
        errors.push(`Mancano ${mandatoryWomen - womenCount} donne (minimo richiesto: ${mandatoryWomen})`);
    }

    const totalBonus = outOfAgeCount * bonusPerPlayer;

    let html = '<div style="padding: 15px; border-radius: 5px; border: 2px solid ';

    if (errors.length > 0) {
        html += '#d32f2f; background: #ffebee;">';
        html += '<p style="font-weight: bold; color: #d32f2f; margin-bottom: 10px;">❌ Requisiti non soddisfatti:</p>';
        html += '<ul style="margin: 0; padding-left: 20px; color: #d32f2f;">';
        errors.forEach(err => html += `<li>${err}</li>`);
        html += '</ul>';
    } else {
        html += '#2e7d32; background: #e8f5e9;">';
        html += '<p style="font-weight: bold; color: #2e7d32; margin-bottom: 10px;">✅ Tutti i requisiti soddisfatti!</p>';
        html += `<p style="color: #2e7d32;">Giocatori: ${playerNames.length}/${totalPlayers}</p>`;
        html += `<p style="color: #2e7d32;">Donne: ${womenCount}/${mandatoryWomen}</p>`;
    }

    if (warnings.length > 0) {
        html += '<div style="margin-top: 10px; padding: 10px; background: #fff3e0; border: 1px solid #ff9800; border-radius: 3px;">';
        html += '<p style="font-weight: bold; color: #e65100; margin-bottom: 5px;">⚠ Giocatori fuori fascia età:</p>';
        html += '<ul style="margin: 0; padding-left: 20px; color: #e65100; font-size: 0.9em;">';
        warnings.forEach(warn => html += `<li>${warn}</li>`);
        html += '</ul>';
        if (bonusPerPlayer > 0) {
            html += `<p style="color: #e65100; font-weight: bold; margin-top: 8px;">Bonus consumati: ${totalBonus} punti (${outOfAgeCount} × ${bonusPerPlayer})</p>`;
        }
        html += '</div>';
    }

    html += '</div>';

    validationContainer.innerHTML = html;
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
window.addPlayerToSquad = addPlayerToSquad;
window.removePlayerFromSquad = removePlayerFromSquad;
window.validateSquad = validateSquad;
