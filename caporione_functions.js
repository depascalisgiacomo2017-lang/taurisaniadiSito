// Funzioni Capo-Rione

async function addAtleta() {
    const rioneId = sessionStorage.getItem('rioneId');
    const nome = document.getElementById('atleta-nome').value;
    const cognome = document.getElementById('atleta-cognome').value;
    const eta = parseInt(document.getElementById('atleta-eta').value);
    const sesso = document.getElementById('atleta-sesso').value;
    const note = document.getElementById('atleta-note').value;

    if (!nome || !cognome || !eta) {
        showMessage('Compilare tutti i campi obbligatori', 'error');
        return;
    }

    const { error } = await supabaseClient.from('atleti').insert([{
        rione_id: rioneId,
        nome,
        cognome,
        eta,
        sesso,
        note
    }]);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Atleta aggiunto con successo');
    document.getElementById('atleta-nome').value = '';
    document.getElementById('atleta-cognome').value = '';
    document.getElementById('atleta-eta').value = '';
    document.getElementById('atleta-note').value = '';

    await loadData();
    loadAtletiList();
}

async function deleteAtleta(id) {
    if (!confirm('Confermi eliminazione atleta?')) return;

    const { error } = await supabaseClient.from('atleti').delete().eq('id', id);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Atleta eliminato');
    await loadData();
    loadAtletiList();
}

function loadAtletiList() {
    const rioneId = sessionStorage.getItem('rioneId');
    const atleti = window.appState.atleti.filter(a => a.rione_id === rioneId);

    const list = document.getElementById('atleti-list');
    if (atleti.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">Nessun atleta registrato</p>';
        return;
    }

    list.innerHTML = atleti.map(atleta => `
        <div class="list-item">
            <div>
                <h3>${atleta.nome} ${atleta.cognome}</h3>
                <p>Età: ${atleta.eta} | Sesso: ${atleta.sesso} ${atleta.note ? '| Note: ' + atleta.note : ''}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteAtleta('${atleta.id}')">Elimina</button>
        </div>
    `).join('');
}

function loadFormazioniList() {
    const rioneId = sessionStorage.getItem('rioneId');
    const giochi = window.appState.giochi;
    const atletiRione = window.appState.atleti.filter(a => a.rione_id === rioneId);

    const list = document.getElementById('formazioni-list');

    if (giochi.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">Nessun gioco disponibile</p>';
        return;
    }

    list.innerHTML = giochi.map(gioco => {
        const squadra = window.appState.squadre.find(s => s.game_id === gioco.id && s.rione_id === rioneId);

        return `
            <div class="game-card">
                <h3>${gioco.name}</h3>
                <p>${gioco.description || ''}</p>
                ${gioco.location ? `<p><strong>Luogo:</strong> ${gioco.location}</p>` : ''}
                ${gioco.date ? `<p><strong>Data:</strong> ${new Date(gioco.date).toLocaleDateString('it-IT')} ${gioco.time_start || ''}</p>` : ''}

                <h4 style="margin-top: 15px; margin-bottom: 10px;">Selezione Atleti</h4>
                <div id="players-${gioco.id}">
                    ${atletiRione.map((atleta, index) => `
                        <div class="player-select">
                            <input type="checkbox" id="player-${gioco.id}-${atleta.id}"
                                ${squadra && squadra.player_names.includes(atleta.id) ? 'checked' : ''}>
                            <label for="player-${gioco.id}-${atleta.id}">${atleta.nome} ${atleta.cognome} (${atleta.eta} anni, ${atleta.sesso})</label>
                        </div>
                    `).join('')}
                </div>

                <button class="btn" onclick="saveFormazione('${gioco.id}')">Salva Formazione</button>
            </div>
        `;
    }).join('');
}

async function saveFormazione(giocoId) {
    const rioneId = sessionStorage.getItem('rioneId');
    const atletiRione = window.appState.atleti.filter(a => a.rione_id === rioneId);

    const selectedPlayers = [];
    atletiRione.forEach(atleta => {
        const checkbox = document.getElementById(`player-${giocoId}-${atleta.id}`);
        if (checkbox && checkbox.checked) {
            selectedPlayers.push(atleta.id);
        }
    });

    const squadraEsistente = window.appState.squadre.find(s => s.game_id === giocoId && s.rione_id === rioneId);

    if (squadraEsistente) {
        const { error } = await supabaseClient.from('squadre')
            .update({ player_names: selectedPlayers })
            .eq('id', squadraEsistente.id);

        if (error) {
            showMessage('Errore: ' + error.message, 'error');
            return;
        }
    } else {
        const { error } = await supabaseClient.from('squadre').insert([{
            game_id: giocoId,
            rione_id: rioneId,
            player_names: selectedPlayers
        }]);

        if (error) {
            showMessage('Errore: ' + error.message, 'error');
            return;
        }
    }

    showMessage('Formazione salvata con successo');
    await loadData();
    loadFormazioniList();
}

async function loadChatMessages() {
    const chatContainer = document.getElementById('chat-messages');

    if (window.appState.messaggi.length === 0) {
        chatContainer.innerHTML = '<p style="text-align: center; color: #999;">Nessun messaggio</p>';
        return;
    }

    chatContainer.innerHTML = window.appState.messaggi.map(msg => `
        <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
            <strong style="color: #f57c00;">${msg.sender_name}</strong>
            <small style="color: #999; margin-left: 10px;">${new Date(msg.created_at).toLocaleString('it-IT')}</small>
            <p style="margin-top: 5px;">${msg.text || ''}</p>
            ${msg.file_url ? `<a href="${msg.file_url}" target="_blank">${msg.file_name || 'File allegato'}</a>` : ''}
        </div>
    `).join('');

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    const rioneId = sessionStorage.getItem('rioneId');
    const rioneName = sessionStorage.getItem('rioneName');
    const text = document.getElementById('chat-message').value;

    if (!text) {
        showMessage('Scrivi un messaggio', 'error');
        return;
    }

    const { error } = await supabaseClient.from('messaggi').insert([{
        sender_name: rioneName,
        sender_type: 'rione',
        sender_rione_id: rioneId,
        text: text
    }]);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    document.getElementById('chat-message').value = '';
    await loadData();
    loadChatMessages();
}
