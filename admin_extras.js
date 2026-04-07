/**
 * admin_extras.js
 * Funzioni aggiuntive per l'amministrazione Taurisaniadi (Appwrite Migration)
 */

window.forceCloudSaveAll = async function() {
    // Verifichiamo la connessione (l'adapter espone supabaseClient)
    if (!window.supabaseClient) {
        alert("Errore: connessione al Cloud assente o non inizializzata!");
        return;
    }

    const btn = document.getElementById('btn-force-save');
    const originalText = btn ? btn.innerText : "";
    if (btn) {
        btn.innerText = "Salvataggio in corso... ⏳";
        btn.disabled = true;
    }

    try {
        console.log("Inizio salvataggio forzato di tutti i dati locali su Appwrite...");

        // 1. Salvataggio Giochi
        if (typeof getSavedGames === 'function') {
            const games = getSavedGames();
            for (let g of games) {
                await window.supabaseClient.from('giochi').upsert({
                    id: g.id,
                    name: g.name,
                    slots: g.slots,
                    mandatory_women: g.mandatoryWomen,
                    restricted_rioni: g.restrictedRioni,
                    description: g.description,
                    desc_spectator: g.descSpectator,
                    location: g.location,
                    date: g.date,
                    time_start: g.timeStart,
                    time_end: g.timeEnd,
                    bracket_image_url: g.bracketImage
                });
            }
            console.log("Giochi sincronizzati.");
        }

        // 2. Salvataggio Impostazioni Globali
        if (typeof getGlobalConfig === 'function') {
            const conf = getGlobalConfig();
            await window.supabaseClient.from('impostazioni').upsert({ 
                key: 'global_config', 
                value: conf 
            });
        }

        // 3. Altre impostazioni (se presenti in supabaseData)
        if (window.supabaseData) {
            const data = window.supabaseData;
            if (data.adminCreds) {
                await window.supabaseClient.from('impostazioni').upsert({ key: 'admin_creds', value: data.adminCreds });
            }
            if (data.adminDocs) {
                await window.supabaseClient.from('impostazioni').upsert({ key: 'admin_docs', value: data.adminDocs });
            }
            if (data.mapImage) {
                await window.supabaseClient.from('impostazioni').upsert({ key: 'map_image', value: data.mapImage });
            }
            if (data.classifica) {
                await window.supabaseClient.from('impostazioni').upsert({ key: 'classifica', value: data.classifica });
            }
        }

        // 4. Salvataggio Rioni
        if (typeof initRioni === 'function') {
            const rioni = initRioni();
            for (let r of rioni) {
                await window.supabaseClient.from('rioni').upsert(r);
            }
            console.log("Rioni sincronizzati.");
        }

        alert("🎉 Sincronizzazione completata! Tutti i dati locali sono stati salvati correttamente su Appwrite.");
    } catch (error) {
        console.error("Errore durante il salvataggio forzato:", error);
        alert("Si è verificato un errore durante il salvataggio: " + (error.message || error));
    } finally {
        if (btn) {
            btn.innerText = "☁️ Forza Salvataggio Cloud";
            btn.disabled = false;
        }
    }
};
