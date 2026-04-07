// Funzioni amministrative

async function addRione() {
    const nome = document.getElementById('rione-nome').value;
    const username = document.getElementById('rione-username').value;
    const password = document.getElementById('rione-password').value;
    const color = document.getElementById('rione-color').value;

    if (!nome || !username || !password) {
        showMessage('Compilare tutti i campi', 'error');
        return;
    }

    const { data, error } = await supabaseClient.from('rioni').insert([
        { nome, username, password, color }
    ]);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Rione aggiunto con successo');
    document.getElementById('rione-nome').value = '';
    document.getElementById('rione-username').value = '';
    document.getElementById('rione-password').value = '';
    await loadData();
    loadRioniList();
}

async function deleteRione(id) {
    if (!confirm('Confermi eliminazione?')) return;

    const { error } = await supabaseClient.from('rioni').delete().eq('id', id);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Rione eliminato');
    await loadData();
    loadRioniList();
}

function loadRioniList() {
    const list = document.getElementById('rioni-list');
    list.innerHTML = window.appState.rioni.map(rione => `
        <div class="list-item">
            <div>
                <h3 style="color: ${rione.color}">${rione.nome}</h3>
                <p>Username: ${rione.username} | Password: ${rione.password}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteRione('${rione.id}')">Elimina</button>
        </div>
    `).join('');
}

async function addGioco() {
    const nome = document.getElementById('gioco-nome').value;
    const luogo = document.getElementById('gioco-luogo').value;
    const data = document.getElementById('gioco-data').value;
    const inizio = document.getElementById('gioco-inizio').value;
    const fine = document.getElementById('gioco-fine').value;
    const descTecnica = document.getElementById('gioco-desc-tecnica').value;
    const descSpettatori = document.getElementById('gioco-desc-spettatori').value;

    if (!nome) {
        showMessage('Inserire almeno il nome del gioco', 'error');
        return;
    }

    const { error } = await supabaseClient.from('giochi').insert([{
        name: nome,
        location: luogo,
        date: data || null,
        time_start: inizio || null,
        time_end: fine || null,
        description: descTecnica,
        desc_spectator: descSpettatori
    }]);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Gioco aggiunto con successo');
    document.getElementById('gioco-nome').value = '';
    document.getElementById('gioco-luogo').value = '';
    document.getElementById('gioco-data').value = '';
    document.getElementById('gioco-inizio').value = '';
    document.getElementById('gioco-fine').value = '';
    document.getElementById('gioco-desc-tecnica').value = '';
    document.getElementById('gioco-desc-spettatori').value = '';
    await loadData();
    loadGiochiList();
}

async function deleteGioco(id) {
    if (!confirm('Confermi eliminazione?')) return;

    const { error } = await supabaseClient.from('giochi').delete().eq('id', id);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Gioco eliminato');
    await loadData();
    loadGiochiList();
}

function loadGiochiList() {
    const list = document.getElementById('giochi-list');
    list.innerHTML = window.appState.giochi.map(gioco => `
        <div class="list-item">
            <div>
                <h3>${gioco.name}</h3>
                <p>${gioco.location || ''} ${gioco.date ? '| ' + new Date(gioco.date).toLocaleDateString('it-IT') : ''}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteGioco('${gioco.id}')">Elimina</button>
        </div>
    `).join('');
}

async function addHighlight() {
    const titolo = document.getElementById('highlight-titolo').value;
    const desc = document.getElementById('highlight-desc').value;
    const url = document.getElementById('highlight-url').value;
    const tipo = document.getElementById('highlight-tipo').value;
    const data = document.getElementById('highlight-data').value;

    if (!url) {
        showMessage('Inserire almeno l\'URL', 'error');
        return;
    }

    const { error } = await supabaseClient.from('momenti_salienti').insert([{
        title: titolo,
        description: desc,
        url: url,
        type: tipo,
        highlight_date: data || null
    }]);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Momento aggiunto con successo');
    document.getElementById('highlight-titolo').value = '';
    document.getElementById('highlight-desc').value = '';
    document.getElementById('highlight-url').value = '';
    document.getElementById('highlight-data').value = '';
    await loadData();
    loadHighlightsList();
}

async function deleteHighlight(id) {
    if (!confirm('Confermi eliminazione?')) return;

    const { error } = await supabaseClient.from('momenti_salienti').delete().eq('id', id);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Momento eliminato');
    await loadData();
    loadHighlightsList();
}

function loadHighlightsList() {
    const list = document.getElementById('highlights-list');
    list.innerHTML = window.appState.momenti_salienti.map(h => `
        <div class="list-item">
            <div>
                <h3>${h.title || 'Senza titolo'}</h3>
                <p>${h.type === 'photo' ? 'Foto' : 'Video'} | ${h.highlight_date ? new Date(h.highlight_date).toLocaleDateString('it-IT') : ''}</p>
                <small>${h.url}</small>
            </div>
            <button class="btn btn-danger" onclick="deleteHighlight('${h.id}')">Elimina</button>
        </div>
    `).join('');
}

async function saveConfig() {
    const bonus = document.getElementById('config-bonus').value;
    const whatsapp = document.getElementById('config-whatsapp').value;
    const discord = document.getElementById('config-discord').value;

    const globalConfig = {
        bonusLimit: parseInt(bonus),
        whatsappLink: whatsapp,
        discordLink: discord,
        ageRanges: ["16-18", "19-25", "26-35", "36-50", "51+"]
    };

    const { error } = await supabaseClient.from('impostazioni')
        .upsert([{ key: 'global_config', value: globalConfig }]);

    if (error) {
        showMessage('Errore: ' + error.message, 'error');
        return;
    }

    showMessage('Configurazioni salvate');
    await loadData();
}

function loadConfigForm() {
    const config = window.appState.config.global_config || {};
    document.getElementById('config-bonus').value = config.bonusLimit || 3;
    document.getElementById('config-whatsapp').value = config.whatsappLink || '';
    document.getElementById('config-discord').value = config.discordLink || '';
}
