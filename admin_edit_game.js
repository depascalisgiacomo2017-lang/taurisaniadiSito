let currentEditingGameId = null;

function openEditGameModal(gameId) {
    currentEditingGameId = gameId;
    const gioco = window.appState.giochi.find(g => g.id === gameId);
    if (!gioco) return;

    const modal = document.getElementById('edit-game-modal');
    if (!modal) {
        createEditGameModal();
        return openEditGameModal(gameId);
    }

    document.getElementById('edit-gioco-nome').value = gioco.name || '';
    document.getElementById('edit-gioco-luogo').value = gioco.location || '';
    document.getElementById('edit-gioco-data').value = gioco.date || '';
    document.getElementById('edit-gioco-inizio').value = gioco.time_start || '';
    document.getElementById('edit-gioco-fine').value = gioco.time_end || '';
    document.getElementById('edit-gioco-desc-tecnica').value = gioco.description || '';
    document.getElementById('edit-gioco-desc-spettatori').value = gioco.desc_spectator || '';
    document.getElementById('edit-gioco-live-url').value = gioco.live_stream_url || '';
    document.getElementById('edit-gioco-whatsapp').value = gioco.whatsapp_link || '';
    document.getElementById('edit-gioco-total-players').value = gioco.total_players || 5;
    document.getElementById('edit-gioco-mandatory-women').value = gioco.mandatory_women !== null ? gioco.mandatory_women : '';

    updateEditPositionsConfig(gioco);

    modal.style.display = 'block';
}

function createEditGameModal() {
    const modalHtml = `
        <div id="edit-game-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; overflow-y: auto;">
            <div style="background: #f4e8d0; max-width: 900px; margin: 50px auto; padding: 30px; border-radius: 15px; border: 4px solid #8b6538;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #2c1810;">Modifica Gioco</h2>
                    <button onclick="closeEditGameModal()" style="background: #d32f2f; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 1.1em;">✕</button>
                </div>

                <div class="form-group">
                    <label>Nome Gioco</label>
                    <input type="text" id="edit-gioco-nome">
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label>Luogo</label>
                        <input type="text" id="edit-gioco-luogo">
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="edit-gioco-data">
                    </div>
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label>Ora Inizio</label>
                        <input type="time" id="edit-gioco-inizio">
                    </div>
                    <div class="form-group">
                        <label>Ora Fine</label>
                        <input type="time" id="edit-gioco-fine">
                    </div>
                </div>

                <div class="form-group">
                    <label>Descrizione Tecnica (per Capi-rione)</label>
                    <textarea id="edit-gioco-desc-tecnica" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label>Descrizione per Spettatori</label>
                    <textarea id="edit-gioco-desc-spettatori" rows="3"></textarea>
                </div>

                <div class="form-group">
                    <label>URL Live Stream</label>
                    <input type="url" id="edit-gioco-live-url" placeholder="https://...">
                </div>

                <div class="form-group">
                    <label>Link WhatsApp</label>
                    <input type="url" id="edit-gioco-whatsapp" placeholder="https://chat.whatsapp.com/...">
                </div>

                <div class="form-group">
                    <label>Tabellone Scontri (opzionale)</label>
                    <input type="file" id="edit-gioco-bracket-file" accept="image/*">
                </div>

                <div class="grid-2">
                    <div class="form-group">
                        <label>Numero Totale Giocatori</label>
                        <input type="number" id="edit-gioco-total-players" min="1" onchange="updateEditPositionsConfig()">
                    </div>
                   
                </div>

                <div class="form-group">
                    <label>Numero Minimo Donne (opzionale)</label>
                    <input type="number" id="edit-gioco-mandatory-women" placeholder="Lascia vuoto per calcolo automatico" min="0">
                </div>

                <div id="edit-positions-config"></div>

                <button class="btn" onclick="saveEditedGame()">Salva Modifiche</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeEditGameModal() {
    const modal = document.getElementById('edit-game-modal');
    if (modal) modal.style.display = 'none';
    currentEditingGameId = null;
}

function updateEditPositionsConfig(gioco) {
    const totalPlayers = parseInt(document.getElementById('edit-gioco-total-players').value) || 5;
    const container = document.getElementById('edit-positions-config');

    if (!container) return;

    const positions = gioco?.player_positions || [];
    const fasce = window.appState.fasce_eta || []; // Recupero le fasce salvate

    let html = '<div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">';
    html += '<h4 style="margin-bottom: 15px; color: #2c1810;">Configurazione Posizioni</h4>';

    for (let i = 1; i <= totalPlayers; i++) {
        const posConfig = positions.find(p => p.position === i) || {min_age: 0, max_age: 99, required_gender: null, fascia_nome: 'Libera'};

        // Genero le opzioni della tendina e preseleziono quella già salvata per questa posizione
        let fasceOptionsHTML = fasce.map(f => {
            const isSelected = (posConfig.fascia_nome === f.nome) ? 'selected' : '';
            return `<option value="${f.id}" data-min="${f.min_eta}" data-max="${f.max_eta}" data-nome="${f.nome}" ${isSelected}>
                ${f.nome} (${f.min_eta}-${f.max_eta} anni)
            </option>`;
        }).join('');

        html += `
            <div style="background: white; padding: 15px; border-radius: 5px; margin-bottom: 15px; border: 2px solid #8b6538;">
                <h5 style="margin-bottom: 10px; color: #5d4037;">Posizione ${i}</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">Fascia Età</label>
                        <select id="edit-pos-${i}-fascia" style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                            <option value="" data-min="0" data-max="99" ${!posConfig.fascia_nome || posConfig.fascia_nome === 'Libera' ? 'selected' : ''}>Nessun limite (0-99)</option>
                            ${fasceOptionsHTML}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 0.9em;">Sesso Richiesto</label>
                        <select id="edit-pos-${i}-gender"
                            style="width: 100%; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                            <option value="any" ${!posConfig.required_gender || posConfig.required_gender === 'any' ? 'selected' : ''}>Qualsiasi</option>
                            <option value="M" ${posConfig.required_gender === 'M' ? 'selected' : ''}>Maschio</option>
                            <option value="F" ${posConfig.required_gender === 'F' ? 'selected' : ''}>Femmina</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

async function saveEditedGame() {
    if (!currentEditingGameId) return;

    const nome = document.getElementById('edit-gioco-nome').value;
    const luogo = document.getElementById('edit-gioco-luogo').value;
    const data = document.getElementById('edit-gioco-data').value;
    const oraInizio = document.getElementById('edit-gioco-inizio').value;
    const oraFine = document.getElementById('edit-gioco-fine').value;
    const descTecnica = document.getElementById('edit-gioco-desc-tecnica').value;
    const descSpettatori = document.getElementById('edit-gioco-desc-spettatori').value;
    const liveUrl = document.getElementById('edit-gioco-live-url').value;
    const whatsappLink = document.getElementById('edit-gioco-whatsapp').value;
    const totalPlayers = parseInt(document.getElementById('edit-gioco-total-players').value) || 5;
    const bonusPerPlayer = parseInt(document.getElementById('edit-gioco-bonus-per-player').value) || 0;
    const mandatoryWomenInput = document.getElementById('edit-gioco-mandatory-women').value;
    const mandatoryWomen = mandatoryWomenInput ? parseInt(mandatoryWomenInput) : null;
    const bracketFile = document.getElementById('edit-gioco-bracket-file').files[0];

    if (!nome) {
        showMessage('Inserisci il nome del gioco', true);
        return;
    }

    const playerPositions = [];
    for (let i = 1; i <= totalPlayers; i++) {
        // NOTA: Usiamo "edit-pos-" perché siamo nel modale di modifica
        const fasciaSelect = document.getElementById(`edit-pos-${i}-fascia`);
        const selectedOption = fasciaSelect ? fasciaSelect.options[fasciaSelect.selectedIndex] : null;
        
        // Estraiamo i dati nascosti nella tendina
        const minAge = selectedOption && fasciaSelect.value ? parseInt(selectedOption.getAttribute('data-min')) : 0;
        const maxAge = selectedOption && fasciaSelect.value ? parseInt(selectedOption.getAttribute('data-max')) : 99;
        const fasciaNome = selectedOption && fasciaSelect.value ? selectedOption.getAttribute('data-nome') : 'Libera';

        const requiredGender = document.getElementById(`edit-pos-${i}-gender`)?.value || null;

        playerPositions.push({
            position: i,
            min_age: minAge,
            max_age: maxAge,
            fascia_nome: fasciaNome,
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

    const updateData = {
        name: nome,
        location: luogo || null,
        date: data || null,
        time_start: oraInizio || null,
        time_end: oraFine || null,
        description: descTecnica || null,
        desc_spectator: descSpettatori || null,
        live_stream_url: liveUrl || null,
        whatsapp_link: whatsappLink || null,
        total_players: totalPlayers,
        bonus_per_player: bonusPerPlayer,
        mandatory_women: mandatoryWomen,
        player_positions: playerPositions
    };

    if (bracketUrl) {
        updateData.bracket_image_url = bracketUrl;
    }

    const { error } = await window.supabaseClient
        .from('giochi')
        .update(updateData)
        .eq('id', currentEditingGameId);

    if (error) {
        showMessage('Errore aggiornamento gioco: ' + error.message, true);
        return;
    }

    showMessage('Gioco aggiornato con successo');
    closeEditGameModal();
    await loadData();
    loadGiochiList();
}

window.openEditGameModal = openEditGameModal;
window.closeEditGameModal = closeEditGameModal;
window.updateEditPositionsConfig = updateEditPositionsConfig;
window.saveEditedGame = saveEditedGame;
