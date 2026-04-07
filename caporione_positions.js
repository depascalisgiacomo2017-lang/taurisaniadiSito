function loadFormazioniListWithPositions() {
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
        const players = squadra?.players || [];
        const positions = gioco.player_positions || [];
        const totalPlayers = gioco.total_players || positions.length || 5;

        return `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #8b6538;">
                <h3 style="margin-bottom: 15px;">${gioco.name}</h3>

                <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <p style="color: #5d4037; margin-bottom: 5px;">
                        <strong>Requisiti:</strong> ${totalPlayers} giocatori
                    </p>
                    ${gioco.bonus_per_player > 0 ? `<p style="color: #d32f2f; font-size: 0.9em;">
                        <strong>⚠ Bonus fuori fascia:</strong> ${gioco.bonus_per_player} punti/giocatore
                    </p>` : ''}
                </div>

                <div id="formazione-${gioco.id}">
                    ${Array.from({length: totalPlayers}, (_, i) => i + 1).map(pos => {
                        const posConfig = positions.find(p => p.position === pos) || {min_age: 0, max_age: 99, required_gender: null};
                        const assignedPlayer = players.find(p => p.position === pos);

                        return `
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 10px; border: 2px solid #8b6538;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <h4 style="color: #5d4037; margin: 0;">Posizione ${pos}</h4>
                                    <span style="font-size: 0.85em; color: #666;">
                                        Età: ${posConfig.min_age}-${posConfig.max_age} anni
                                        ${posConfig.required_gender ? ` | Sesso: ${posConfig.required_gender}` : ''}
                                    </span>
                                </div>

                                ${assignedPlayer ? `
                                    <div style="background: #e8f5e9; padding: 10px; border-radius: 3px; margin-bottom: 10px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <strong style="color: #2e7d32;">${assignedPlayer.player_name}</strong>
                                                <span style="color: #5d4037; font-size: 0.9em; margin-left: 10px;">
                                                    ${assignedPlayer.age} anni (${assignedPlayer.gender})
                                                </span>
                                                ${assignedPlayer.out_of_range ? `
                                                    <span style="color: #d32f2f; font-size: 0.85em; margin-left: 5px;">
                                                        ⚠ Fuori fascia
                                                    </span>
                                                ` : ''}
                                            </div>
                                            <button onclick="removePlayerFromPosition('${gioco.id}', ${pos})"
                                                    style="background: #d32f2f; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 0.85em;">
                                                Rimuovi
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}

                                ${atleti.length > 0 && !assignedPlayer ? `
                                    <div style="display: flex; gap: 10px;">
                                        <select id="atleta-pos-${gioco.id}-${pos}" style="flex: 1; padding: 8px; border: 2px solid #8b6538; border-radius: 5px;">
                                            <option value="">-- Seleziona atleta --</option>
                                            ${atleti.filter(a => !players.some(p => `${a.nome} ${a.cognome}` === p.player_name)).map(a => {
                                                const inFascia = a.eta >= posConfig.min_age && a.eta <= posConfig.max_age;
                                                const genderMatch = !posConfig.required_gender || a.sesso === posConfig.required_gender;
                                                const label = `${a.nome} ${a.cognome} - ${a.eta} anni (${a.sesso})`;
                                                const warning = (!inFascia || !genderMatch) ? ' ⚠' : '';
                                                const bonus = !inFascia && gioco.bonus_per_player > 0 ? ` [Bonus: ${gioco.bonus_per_player}]` : '';
                                                return `<option value="${a.id}" data-eta="${a.eta}" data-sesso="${a.sesso}" data-nome="${a.nome} ${a.cognome}">${label}${warning}${bonus}</option>`;
                                            }).join('')}
                                        </select>
                                        <button onclick="assignPlayerToPosition('${gioco.id}', ${pos})" class="btn" style="padding: 8px 15px;">
                                            Assegna
                                        </button>
                                    </div>
                                ` : (!assignedPlayer ? '<p style="color: #999; margin: 0;">Nessun atleta disponibile</p>' : '')}
                            </div>
                        `;
                    }).join('')}

                    <div id="validation-${gioco.id}" style="margin-top: 15px;"></div>
                </div>
            </div>
        `;
    }).join('');

    giochi.forEach(gioco => {
        const squadra = window.appState.squadre.find(s => s.game_id === gioco.id && s.rione_id === rioneId);
        if (squadra) {
            validateSquadWithPositions(gioco.id);
        }
    });
}

async function assignPlayerToPosition(gameId, position) {
    const select = document.getElementById(`atleta-pos-${gameId}-${position}`);
    const selectedOption = select.options[select.selectedIndex];

    if (!select.value) {
        showMessage('Seleziona un atleta', 'error');
        return;
    }

    const atletaNome = selectedOption.getAttribute('data-nome');
    const atletaEta = parseInt(selectedOption.getAttribute('data-eta'));
    const atletaSesso = selectedOption.getAttribute('data-sesso');
    const rioneId = localStorage.getItem('rioneId');

    const gioco = window.appState.giochi.find(g => g.id === gameId);
    const positions = gioco?.player_positions || [];
    const posConfig = positions.find(p => p.position === position) || {min_age: 0, max_age: 99, required_gender: null};

    const outOfRange = atletaEta < posConfig.min_age || atletaEta > posConfig.max_age;

    const playerData = {
        position: position,
        player_name: atletaNome,
        age: atletaEta,
        gender: atletaSesso,
        out_of_range: outOfRange
    };

    let squadra = window.appState.squadre.find(s => s.game_id === gameId && s.rione_id === rioneId);

    if (squadra) {
        const players = squadra.players || [];
        const existingIndex = players.findIndex(p => p.position === position);

        let newPlayers;
        if (existingIndex >= 0) {
            newPlayers = [...players];
            newPlayers[existingIndex] = playerData;
        } else {
            newPlayers = [...players, playerData];
        }

        const { error } = await window.supabaseClient
            .from('squadre')
            .update({ players: newPlayers })
            .eq('id', squadra.id);

        if (error) {
            showMessage('Errore assegnazione atleta: ' + error.message, 'error');
            return;
        }

        showMessage('Atleta assegnato con successo');
    } else {
        const { error } = await window.supabaseClient
            .from('squadre')
            .insert({
                game_id: gameId,
                rione_id: rioneId,
                players: [playerData]
            });

        if (error) {
            showMessage('Errore creazione squadra: ' + error.message, 'error');
            return;
        }

        showMessage('Squadra creata con successo');
    }

    await loadData();
    loadFormazioniListWithPositions();
}

async function removePlayerFromPosition(gameId, position) {
    const rioneId = localStorage.getItem('rioneId');
    const squadra = window.appState.squadre.find(s => s.game_id === gameId && s.rione_id === rioneId);

    if (!squadra) {
        showMessage('Squadra non trovata', 'error');
        return;
    }

    const players = squadra.players || [];
    const newPlayers = players.filter(p => p.position !== position);

    if (newPlayers.length === 0) {
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
            .update({ players: newPlayers })
            .eq('id', squadra.id);

        if (error) {
            showMessage('Errore rimozione atleta: ' + error.message, 'error');
            return;
        }

        showMessage('Atleta rimosso');
    }

    await loadData();
    loadFormazioniListWithPositions();
}

function validateSquadWithPositions(gameId) {
    const rioneId = localStorage.getItem('rioneId');
    const gioco = window.appState.giochi.find(g => g.id === gameId);
    const squadra = window.appState.squadre.find(s => s.game_id === gameId && s.rione_id === rioneId);
    const validationContainer = document.getElementById(`validation-${gameId}`);

    if (!squadra || !gioco || !validationContainer) return;

    const players = squadra.players || [];
    const positions = gioco.player_positions || [];
    const totalPlayers = gioco.total_players || positions.length || 5;
    const bonusPerPlayer = gioco.bonus_per_player || 0;

    const errors = [];
    const warnings = [];
    let outOfRangeCount = 0;

    if (players.length < totalPlayers) {
        errors.push(`Mancano ${totalPlayers - players.length} giocatori (richiesti: ${totalPlayers})`);
    }

    for (let i = 1; i <= totalPlayers; i++) {
        const posConfig = positions.find(p => p.position === i) || {min_age: 0, max_age: 99, required_gender: null};
        const assignedPlayer = players.find(p => p.position === i);

        if (!assignedPlayer) {
            continue;
        }

        if (posConfig.required_gender && assignedPlayer.gender !== posConfig.required_gender) {
            errors.push(`Posizione ${i}: richiesto sesso ${posConfig.required_gender}, assegnato ${assignedPlayer.gender}`);
        }

        if (assignedPlayer.out_of_range) {
            outOfRangeCount++;
            warnings.push(`${assignedPlayer.player_name} (Pos. ${i}) - ${assignedPlayer.age} anni (fascia: ${posConfig.min_age}-${posConfig.max_age})`);
        }
    }

    const totalBonus = outOfRangeCount * bonusPerPlayer;

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
        html += `<p style="color: #2e7d32;">Giocatori: ${players.length}/${totalPlayers}</p>`;
    }

    if (warnings.length > 0) {
        html += '<div style="margin-top: 10px; padding: 10px; background: #fff3e0; border: 1px solid #ff9800; border-radius: 3px;">';
        html += '<p style="font-weight: bold; color: #e65100; margin-bottom: 5px;">⚠ Giocatori fuori fascia età:</p>';
        html += '<ul style="margin: 0; padding-left: 20px; color: #e65100; font-size: 0.9em;">';
        warnings.forEach(warn => html += `<li>${warn}</li>`);
        html += '</ul>';
        if (bonusPerPlayer > 0) {
            html += `<p style="color: #e65100; font-weight: bold; margin-top: 8px;">Bonus consumati: ${totalBonus} punti (${outOfRangeCount} × ${bonusPerPlayer})</p>`;
        }
        html += '</div>';
    }

    html += '</div>';

    validationContainer.innerHTML = html;
}

window.loadFormazioniListWithPositions = loadFormazioniListWithPositions;
window.assignPlayerToPosition = assignPlayerToPosition;
window.removePlayerFromPosition = removePlayerFromPosition;
window.validateSquadWithPositions = validateSquadWithPositions;
