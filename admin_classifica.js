async function loadClassifica() {
    const { data, error } = await window.supabaseClient
        .from('classifica')
        .select('*')
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Errore caricamento classifica:', error);
        return;
    }

    const currentImageUrl = data?.image_url || null;
    const container = document.getElementById('classifica-section');

    if (!container) return;

    container.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #8b6538;">
            <h3 style="margin-bottom: 15px;">Immagine Classifica Corrente</h3>

            ${currentImageUrl ? `
                <div style="margin-bottom: 20px;">
                    <img src="${currentImageUrl}" alt="Classifica" style="max-width: 100%; border-radius: 5px; border: 2px solid #8b6538;">
                </div>
            ` : '<p style="color: #999; text-align: center; padding: 20px;">Nessuna classifica caricata</p>'}

            <div class="form-group">
                <label>Carica Nuova Immagine Classifica</label>
                <input type="file" id="classifica-file" accept="image/*">
            </div>

            <button class="btn" onclick="uploadClassificaImage()">Aggiorna Classifica</button>
        </div>
    `;
}

async function uploadClassificaImage() {
    const fileInput = document.getElementById('classifica-file');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('Seleziona un file immagine', true);
        return;
    }

    showMessage('Caricamento in corso...');

    const uploadResult = await uploadFile(file, 'classifica');

    if (!uploadResult.success) {
        showMessage('Errore caricamento immagine: ' + uploadResult.error, true);
        return;
    }

    const { data, error } = await window.supabaseClient
        .from('classifica')
        .update({
            image_url: uploadResult.url,
            updated_at: new Date().toISOString()
        })
        .eq('id', (await window.supabaseClient.from('classifica').select('id').single()).data?.id);

    if (error) {
        showMessage('Errore aggiornamento classifica: ' + error.message, true);
        return;
    }

    showMessage('Classifica aggiornata con successo');
    loadClassifica();
}

async function loadMomentiSalienti() {
    await loadData();

    const momenti = window.appState.momenti_salienti || [];
    const container = document.getElementById('highlights-list');

    if (!container) return;

    if (momenti.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Nessun momento saliente</p>';
        return;
    }

    container.innerHTML = momenti.map(momento => `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #8b6538;">
            <h3>${momento.titolo}</h3>
            <p style="color: #5d4037; margin: 10px 0;">${momento.descrizione || ''}</p>
            ${momento.media_url ? `
                <div style="margin: 15px 0;">
                    ${momento.media_type === 'video' ? `
                        <video controls style="max-width: 100%; border-radius: 5px;">
                            <source src="${momento.media_url}" type="video/mp4">
                        </video>
                    ` : `
                        <img src="${momento.media_url}" alt="${momento.titolo}" style="max-width: 100%; border-radius: 5px;">
                    `}
                </div>
            ` : ''}
            ${momento.link_esterno ? `
                <a href="${momento.link_esterno}" target="_blank" style="color: #8b6538; text-decoration: underline;">
                    Vai al video originale
                </a>
            ` : ''}
            <div style="margin-top: 15px;">
                <button class="btn btn-danger" onclick="deleteMomentoSaliente('${momento.id}')">Elimina</button>
            </div>
        </div>
    `).join('');
}

async function addMomentoSaliente() {
    const titolo = document.getElementById('momento-titolo').value;
    const descrizione = document.getElementById('momento-descrizione').value;
    const linkEsterno = document.getElementById('momento-link').value;
    const mediaFile = document.getElementById('momento-media').files[0];

    if (!titolo) {
        showMessage('Inserisci almeno un titolo', true);
        return;
    }

    let mediaUrl = null;
    let mediaType = null;

    if (mediaFile) {
        showMessage('Caricamento media in corso...');

        const uploadResult = await uploadFile(mediaFile, 'momenti-salienti');

        if (!uploadResult.success) {
            showMessage('Errore caricamento media: ' + uploadResult.error, true);
            return;
        }

        mediaUrl = uploadResult.url;
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
    }

    const momentoData = {
        titolo: titolo,
        descrizione: descrizione,
        media_url: mediaUrl,
        media_type: mediaType,
        link_esterno: linkEsterno || null
    };

    const { data, error } = await window.supabaseClient
        .from('momenti_salienti')
        .insert(momentoData);

    if (error) {
        showMessage('Errore creazione momento saliente: ' + error.message, true);
        return;
    }

    showMessage('Momento saliente creato con successo');

    document.getElementById('momento-titolo').value = '';
    document.getElementById('momento-descrizione').value = '';
    document.getElementById('momento-link').value = '';
    document.getElementById('momento-media').value = '';

    loadMomentiSalienti();
}

async function deleteMomentoSaliente(momentoId) {
    if (!confirm('Vuoi davvero eliminare questo momento saliente?')) return;

    const { error } = await window.supabaseClient
        .from('momenti_salienti')
        .delete()
        .eq('id', momentoId);

    if (error) {
        showMessage('Errore eliminazione: ' + error.message, true);
        return;
    }

    showMessage('Momento saliente eliminato');
    loadMomentiSalienti();
}

window.loadClassifica = loadClassifica;
window.uploadClassificaImage = uploadClassificaImage;
window.loadMomentiSalienti = loadMomentiSalienti;
window.addMomentoSaliente = addMomentoSaliente;
window.deleteMomentoSaliente = deleteMomentoSaliente;
