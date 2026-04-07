function loadCredentialsManagement() {
    const section = document.getElementById('credentials-section');
    if (!section) return;

    section.innerHTML = `
        <h3>Gestione Credenziali</h3>

        <div class="credentials-block">
            <h4>Credenziali Amministratore</h4>
            <input type="text" id="admin-username" placeholder="Nuovo Username">
            <input type="password" id="admin-password" placeholder="Nuova Password">
            <button onclick="saveAdminCredentials()">Salva Credenziali Admin</button>
        </div>

        <div class="credentials-block">
            <h4>Credenziali Rioni</h4>
            <div id="rioni-credentials-list"></div>
        </div>
    `;

    loadRioniCredentials();
}

function loadRioniCredentials() {
    const list = document.getElementById('rioni-credentials-list');
    if (!list) return;

    list.innerHTML = window.appState.rioni.map(rione => `
        <div class="rione-credentials-item">
            <strong>${rione.nome}</strong>
            <input type="text" id="rione-user-${rione.id}" value="${rione.username}" placeholder="Username">
            <input type="password" id="rione-pass-${rione.id}" placeholder="Nuova Password">
            <button onclick="saveRioneCredentials('${rione.id}')">Salva</button>
        </div>
    `).join('');
}

async function saveAdminCredentials() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (!username || !password) {
        alert('Inserisci username e password');
        return;
    }

    const result = await updateAdminCredentials(username, password);

    if (result.success) {
        alert('Credenziali amministratore aggiornate con successo');
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
    } else {
        alert('Errore durante aggiornamento credenziali');
    }
}

async function saveRioneCredentials(rioneId) {
    const username = document.getElementById(`rione-user-${rioneId}`).value;
    const password = document.getElementById(`rione-pass-${rioneId}`).value;

    if (!username) {
        alert('Inserisci username');
        return;
    }

    const result = await updateRioneCredentials(rioneId, username, password || null);

    if (result.success) {
        alert('Credenziali rione aggiornate con successo');
        await loadData();
        loadRioniCredentials();
    } else {
        alert('Errore durante aggiornamento credenziali');
    }
}

function loadChatSection() {
    const section = document.getElementById('chat-section');
    if (!section) return;

    section.innerHTML = `
        <h3>Chat con Capi-Rione</h3>

        <div class="chat-container">
            <div class="chat-messages" id="chat-messages"></div>

            <div class="chat-input-area">
                <textarea id="chat-message" placeholder="Scrivi un messaggio..." rows="3"></textarea>
                <input type="text" id="file-url" placeholder="URL File (opzionale)">
                <input type="text" id="file-name" placeholder="Nome File (opzionale)">
                <button onclick="sendChatMessage()">Invia Messaggio</button>
            </div>
        </div>
    `;

    loadChatMessages();
}

function loadChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML = window.appState.messaggi.map(msg => {
        const time = new Date(msg.created_at).toLocaleString('it-IT');
        return `
            <div class="message ${msg.sender_type}">
                <div class="message-header">
                    <strong>${msg.sender_name}</strong>
                    <span class="message-time">${time}</span>
                </div>
                ${msg.text ? `<div class="message-text">${msg.text}</div>` : ''}
                ${msg.file_url ? `<div class="message-file"><a href="${msg.file_url}" target="_blank">${msg.file_name || 'File'}</a></div>` : ''}
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const text = document.getElementById('chat-message').value;
    const fileUrl = document.getElementById('file-url').value;
    const fileName = document.getElementById('file-name').value;

    if (!text && !fileUrl) {
        alert('Inserisci un messaggio o un file');
        return;
    }

    const result = await sendMessageToRione(text, fileUrl || null, fileName || null);

    if (result.success) {
        document.getElementById('chat-message').value = '';
        document.getElementById('file-url').value = '';
        document.getElementById('file-name').value = '';
        await loadData();
        loadChatMessages();
    } else {
        alert('Errore durante invio messaggio');
    }
}

function loadAgeGroupsManagement() {
    const section = document.getElementById('age-groups-section');
    if (!section) return;

    section.innerHTML = `
        <h3>Gestione Fasce di Età</h3>

        <div class="age-groups-block">
            <h4>Aggiungi Nuova Fascia</h4>
            <input type="text" id="fascia-nome" placeholder="Nome Fascia (es. Under 18)">
            <input type="number" id="fascia-min" placeholder="Età Minima">
            <input type="number" id="fascia-max" placeholder="Età Massima (lascia vuoto per illimitato)">
            <button onclick="addNewAgeGroup()">Aggiungi Fascia</button>
        </div>

        <div class="age-groups-list">
            <h4>Fasce Esistenti</h4>
            <div id="age-groups-items"></div>
        </div>
    `;

    loadAgeGroupsList();
}

function loadAgeGroupsList() {
    const container = document.getElementById('age-groups-items');
    if (!container) return;

    container.innerHTML = window.appState.fasce_eta.map(fascia => `
        <div class="age-group-item">
            <span>${fascia.nome} (${fascia.min_eta}${fascia.max_eta ? `-${fascia.max_eta}` : '+'})</span>
            <button onclick="removeAgeGroup('${fascia.id}')">Elimina</button>
        </div>
    `).join('');
}

async function addNewAgeGroup() {
    const nome = document.getElementById('fascia-nome').value;
    const min = parseInt(document.getElementById('fascia-min').value);
    const max = document.getElementById('fascia-max').value ? parseInt(document.getElementById('fascia-max').value) : null;

    if (!nome || isNaN(min)) {
        alert('Inserisci nome e età minima');
        return;
    }

    const result = await addFasciaEta(nome, min, max);

    if (result.success) {
        alert('Fascia di età aggiunta con successo');
        document.getElementById('fascia-nome').value = '';
        document.getElementById('fascia-min').value = '';
        document.getElementById('fascia-max').value = '';
        await loadData();
        loadAgeGroupsList();
    } else {
        alert('Errore durante aggiunta fascia');
    }
}

async function removeAgeGroup(id) {
    if (!confirm('Sei sicuro di voler eliminare questa fascia?')) return;

    const result = await deleteFasciaEta(id);

    if (result.success) {
        alert('Fascia eliminata con successo');
        await loadData();
        loadAgeGroupsList();
    } else {
        alert('Errore durante eliminazione fascia');
    }
}

function loadAthleteStats() {
    const section = document.getElementById('athlete-stats-section');
    if (!section) return;

    const stats = getAthleteStats();

    section.innerHTML = `
        <h3>Statistiche Atleti per Rione</h3>
        <div class="athlete-stats">
            ${Object.keys(stats).map(rioneNome => `
                <div class="rione-stats-block">
                    <h4>${rioneNome}</h4>
                    <table class="athlete-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Età</th>
                                <th>Sesso</th>
                                <th>Partecipazioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats[rioneNome].map(atleta => `
                                <tr>
                                    <td>${atleta.nome}</td>
                                    <td>${atleta.eta}</td>
                                    <td>${atleta.sesso}</td>
                                    <td><strong>${atleta.partecipazioni}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
    `;
}

function loadGamesManagement() {
    const section = document.getElementById('games-management-section');
    if (!section) return;

    section.innerHTML = `
        <h3>Gestione Giochi</h3>
        <div class="games-list">
            ${window.appState.giochi.map(gioco => `
                <div class="game-management-item">
                    <h4>${gioco.name}</h4>
                    <div class="game-management-fields">
                        <label>Data: <input type="date" id="game-date-${gioco.id}" value="${gioco.date || ''}"></label>
                        <label>Ora Inizio: <input type="time" id="game-time-start-${gioco.id}" value="${gioco.time_start || ''}"></label>
                        <label>Ora Fine: <input type="time" id="game-time-end-${gioco.id}" value="${gioco.time_end || ''}"></label>
                        <label>Luogo: <input type="text" id="game-location-${gioco.id}" value="${gioco.location || ''}" placeholder="Luogo"></label>
                        <label>URL Live Stream: <input type="text" id="game-live-${gioco.id}" value="${gioco.live_stream_url || ''}" placeholder="URL Diretta"></label>
                        <label>URL Tabellone: <input type="text" id="game-bracket-${gioco.id}" value="${gioco.bracket_image_url || ''}" placeholder="URL Immagine Tabellone"></label>
                        <button onclick="updateGameDetails('${gioco.id}')">Aggiorna Gioco</button>
                        <button class="delete-btn" onclick="deleteGameConfirm('${gioco.id}')">Elimina Gioco</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function updateGameDetails(gameId) {
    const updates = {
        date: document.getElementById(`game-date-${gameId}`).value || null,
        time_start: document.getElementById(`game-time-start-${gameId}`).value || null,
        time_end: document.getElementById(`game-time-end-${gameId}`).value || null,
        location: document.getElementById(`game-location-${gameId}`).value || null,
        live_stream_url: document.getElementById(`game-live-${gameId}`).value || null,
        bracket_image_url: document.getElementById(`game-bracket-${gameId}`).value || null
    };

    const result = await updateGame(gameId, updates);

    if (result.success) {
        alert('Gioco aggiornato con successo');
        await loadData();
    } else {
        alert('Errore durante aggiornamento gioco');
    }
}

async function deleteGameConfirm(gameId) {
    if (!confirm('Sei sicuro di voler eliminare questo gioco? Questa azione è irreversibile.')) return;

    const result = await deleteGame(gameId);

    if (result.success) {
        alert('Gioco eliminato con successo');
        await loadData();
        loadGamesManagement();
    } else {
        alert('Errore durante eliminazione gioco');
    }
}

window.loadCredentialsManagement = loadCredentialsManagement;
window.saveAdminCredentials = saveAdminCredentials;
window.saveRioneCredentials = saveRioneCredentials;
window.loadChatSection = loadChatSection;
window.loadChatMessages = loadChatMessages;
window.sendChatMessage = sendChatMessage;
window.loadAgeGroupsManagement = loadAgeGroupsManagement;
window.loadAgeGroupsList = loadAgeGroupsList;
window.addNewAgeGroup = addNewAgeGroup;
window.removeAgeGroup = removeAgeGroup;
window.loadAthleteStats = loadAthleteStats;
window.loadGamesManagement = loadGamesManagement;
window.updateGameDetails = updateGameDetails;
window.deleteGameConfirm = deleteGameConfirm;
