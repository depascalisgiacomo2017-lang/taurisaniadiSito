async function loadSpectatorData() {
    await loadData();
    loadGames();
    loadCalendar();
    loadHighlights();
    loadClassifica();
}

function loadGames() {
    const gamesList = document.getElementById('games-list');

    if (!window.appState || !window.appState.giochi) {
        gamesList.innerHTML = '<div class="empty-state"><p>Nessun gioco disponibile</p></div>';
        return;
    }

    const games = window.appState.giochi;

    if (games.length === 0) {
        gamesList.innerHTML = '<div class="empty-state"><p>Nessun gioco disponibile</p></div>';
        return;
    }

    gamesList.innerHTML = games.map(game => `
        <div class="game-card">
            <h3>${game.name}</h3>
            <p>${game.desc_spectator || game.description || ''}</p>
            <div class="game-info">
                ${game.location ? `<div class="info-item"><span class="info-label">Luogo:</span> ${game.location}</div>` : ''}
                ${game.date ? `<div class="info-item"><span class="info-label">Data:</span> ${window.formatDateIT(game.date)}</div>` : ''}
                ${game.time_start ? `<div class="info-item"><span class="info-label">Orario:</span> ${window.formatTimeIT(game.time_start)} - ${window.formatTimeIT(game.time_end || '')}</div>` : ''}
            </div>

            ${game.bracket_image_url ? `
                <div style="margin: 15px 0;">
                    <h4 style="color: #2c1810; margin-bottom: 10px;">Tabellone Scontri</h4>
                    <img src="${game.bracket_image_url}" alt="Tabellone ${game.name}"
                        style="max-width: 100%; border-radius: 8px; border: 2px solid #8b6538;">
                </div>
            ` : ''}

            ${game.live_stream_url ? `
                <div style="margin-top: 15px;">
                    <a href="${game.live_stream_url}" target="_blank"
                        style="display: inline-block; padding: 12px 24px; background: linear-gradient(180deg, #d32f2f 0%, #b71c1c 100%);
                        color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        📹 Guarda la Diretta Live
                    </a>
                </div>
            ` : ''}

            ${game.whatsapp_link ? `
                <div style="margin-top: 10px;">
                    <a href="${game.whatsapp_link}" target="_blank"
                        style="display: inline-block; padding: 12px 24px; background: linear-gradient(180deg, #25d366 0%, #1da851 100%);
                        color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        💬 Unisciti al Gruppo WhatsApp
                    </a>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function loadCalendar() {
    const calendarList = document.getElementById('calendar-list');

    const gamesWithDates = window.appState.giochi.filter(g => g.date).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (gamesWithDates.length === 0) {
        calendarList.innerHTML = '<div class="empty-state"><p>Nessun evento in calendario</p></div>';
        return;
    }

    calendarList.innerHTML = gamesWithDates.map(game => `
        <div class="game-card">
            <h3>${game.name}</h3>
            <div class="game-info">
                <div class="info-item"><span class="info-label">Data:</span> ${window.formatDateIT(game.date)}</div>
                ${game.time_start ? `<div class="info-item"><span class="info-label">Orario:</span> ${window.formatTimeIT(game.time_start)} - ${window.formatTimeIT(game.time_end || '')}</div>` : ''}
                ${game.location ? `<div class="info-item"><span class="info-label">Luogo:</span> ${game.location}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function loadHighlights() {
    const highlightsList = document.getElementById('highlights-list');

    const highlights = window.appState.momenti_salienti || [];

    if (highlights.length === 0) {
        highlightsList.innerHTML = '<div class="empty-state"><p>Nessun momento saliente disponibile</p></div>';
        return;
    }

    highlightsList.innerHTML = highlights.map(highlight => `
        <div class="game-card">
            <h3>${highlight.titolo}</h3>
            ${highlight.descrizione ? `<p style="color: #5d4037; margin: 10px 0;">${highlight.descrizione}</p>` : ''}

            ${highlight.media_url ? `
                <div style="margin: 15px 0;">
                    ${highlight.media_type === 'video' ? `
                        <video controls style="width: 100%; max-width: 100%; border-radius: 8px; border: 2px solid #8b6538;">
                            <source src="${highlight.media_url}" type="video/mp4">
                            Il tuo browser non supporta i video.
                        </video>
                    ` : `
                        <img src="${highlight.media_url}" alt="${highlight.titolo}"
                            style="width: 100%; max-width: 100%; border-radius: 8px; border: 2px solid #8b6538;">
                    `}
                </div>
            ` : ''}

            ${highlight.link_esterno ? `
                <div style="margin-top: 10px;">
                    <a href="${highlight.link_esterno}" target="_blank"
                        style="display: inline-block; padding: 10px 20px; background: linear-gradient(180deg, #8b6538 0%, #6d4c2a 100%);
                        color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        🔗 Vai al Video Originale
                    </a>
                </div>
            ` : ''}

            <small style="color: #999; display: block; margin-top: 10px;">
                ${window.formatDateTimeIT(highlight.created_at)}
            </small>
        </div>
    `).join('');
}

function loadClassifica() {
    const classificaContainer = document.getElementById('classifica-container');

    if (!window.appState.classifica || !window.appState.classifica.image_url) {
        classificaContainer.innerHTML = '<div class="empty-state"><p>Classifica non ancora disponibile</p></div>';
        return;
    }

    classificaContainer.innerHTML = `
        <div style="text-align: center;">
            <img src="${window.appState.classifica.image_url}" alt="Classifica"
                style="max-width: 100%; border-radius: 8px; border: 3px solid #8b6538; box-shadow: 0 5px 20px rgba(0,0,0,0.3);">
            <p style="color: #5d4037; margin-top: 15px; font-size: 0.9em;">
                Ultimo aggiornamento: ${window.formatDateTimeIT(window.appState.classifica.updated_at)}
            </p>
        </div>
    `;
}

window.loadSpectatorData = loadSpectatorData;
window.loadGames = loadGames;
window.loadCalendar = loadCalendar;
window.loadHighlights = loadHighlights;
window.loadClassifica = loadClassifica;
