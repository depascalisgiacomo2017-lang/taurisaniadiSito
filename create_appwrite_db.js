const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69d4d02a0002bbac0b96')
    .setKey('standard_b545ddcb1520121391855aac24a7b8b777f7a6da3880e84ee714fa0c108f24b6ce1fcba30cbc3b2648e60646b5918d838d6503eb626c1366d3cccd766fb6ac8f4ee96c832e3b5b235286a4dea4e3a1c4f19cb1381b040810fbb0571bd2fc03d230225425831bb986647f9a5b38abee1a4313c74150483b2ec39f245bc8ea24a9');

const databases = new sdk.Databases(client);

// Helper function to sleep
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function setup() {
    console.log("Creazione Database iniziata...");
    const dbId = 'TaurisaniadiDB';
    try {
        await databases.create(dbId, 'TaurisaniadiDB');
        console.log("✅ Database 'TaurisaniadiDB' creato con successo.");
    } catch (e) {
        if (e.code === 409) {
            console.log("ℹ️ Il Database 'TaurisaniadiDB' esiste già.");
        } else {
            console.error("Errore critico durante la creazione del DB:", e.message);
            return;
        }
    }

    const collections = [
        {
            id: 'rioni', name: 'Rioni',
            attributes: [
                { type: 'string', key: 'nome', size: 100, required: true },
                { type: 'string', key: 'username', size: 50, required: true },
                { type: 'string', key: 'password', size: 255, required: true },
                { type: 'string', key: 'color', size: 50, required: false }
            ]
        },
        {
            id: 'atleti', name: 'Atleti',
            attributes: [
                { type: 'string', key: 'rione_id', size: 50, required: false },
                { type: 'string', key: 'nome', size: 100, required: true },
                { type: 'string', key: 'cognome', size: 100, required: false },
                { type: 'string', key: 'eta', size: 50, required: true },
                { type: 'string', key: 'sesso', size: 10, required: true },
                { type: 'string', key: 'note', size: 5000, required: false }
            ]
        },
        {
            id: 'messaggi', name: 'Messaggi',
            attributes: [
                { type: 'string', key: 'sender_name', size: 100, required: true },
                { type: 'string', key: 'sender_type', size: 50, required: true },
                { type: 'string', key: 'sender_rione_id', size: 50, required: false },
                { type: 'string', key: 'text', size: 5000, required: false },
                { type: 'string', key: 'file_url', size: 1024, required: false },
                { type: 'string', key: 'file_name', size: 255, required: false }
            ]
        },
        {
            id: 'giochi', name: 'Giochi',
            attributes: [
                { type: 'string', key: 'name', size: 255, required: true },
                { type: 'string', key: 'slots', size: 5000, required: false }, // JSON stringified
                { type: 'integer', key: 'mandatory_women', required: false },
                { type: 'string', key: 'restricted_rioni', size: 5000, required: false }, // JSON stringified
                { type: 'string', key: 'description', size: 5000, required: false },
                { type: 'string', key: 'desc_spectator', size: 5000, required: false },
                { type: 'string', key: 'location', size: 255, required: false },
                { type: 'string', key: 'date', size: 50, required: false },
                { type: 'string', key: 'time_start', size: 50, required: false },
                { type: 'string', key: 'time_end', size: 50, required: false },
                { type: 'string', key: 'bracket_image_url', size: 1024, required: false },
                { type: 'boolean', key: 'in_progress', required: false }
            ]
        },
        {
            id: 'squadre', name: 'Squadre',
            attributes: [
                { type: 'string', key: 'game_id', size: 50, required: false },
                { type: 'string', key: 'rione_id', size: 50, required: false },
                { type: 'string', key: 'player_names', size: 5000, required: false } // JSON stringified
            ]
        },
        {
            id: 'impostazioni', name: 'Impostazioni',
            attributes: [
                { type: 'string', key: 'key', size: 100, required: true },
                { type: 'string', key: 'value', size: 5000, required: true } // JSON stringified
            ]
        },
        {
            id: 'momenti_salienti', name: 'Momenti Salienti',
            attributes: [
                { type: 'string', key: 'title', size: 255, required: false },
                { type: 'string', key: 'description', size: 5000, required: false },
                { type: 'string', key: 'url', size: 1024, required: true },
                { type: 'string', key: 'type', size: 50, required: true },
                { type: 'string', key: 'highlight_date', size: 50, required: false }
            ]
        },
        {
            id: 'mappe', name: 'Mappe',
            attributes: [
                { type: 'string', key: 'url', size: 1024, required: true },
                { type: 'string', key: 'description', size: 5000, required: false }
            ]
        }
    ];

    for (let c of collections) {
        try {
            console.log(`\nCreazione Collection '${c.name}'...`);
            // Creates the collection with document-level security enabled and read/write for anyone (like public access in Supabase)
            // It allows the frontend to easily fetch data.
            await databases.createCollection(dbId, c.id, c.name, [
                sdk.Permission.read(sdk.Role.any()), 
                sdk.Permission.write(sdk.Role.any()),
                sdk.Permission.update(sdk.Role.any()),
                sdk.Permission.delete(sdk.Role.any())
            ], true);
            console.log(`✅ Collection '${c.name}' creata.`);
        } catch(e) {
            if (e.code === 409) console.log(`ℹ️ Collection '${c.name}' esiste già.`);
            else console.error(`❌ Errore creazione ${c.name}:`, e.message);
        }

        console.log(`Aggiungendo attributi a '${c.name}'...`);
        for (let a of c.attributes) {
            try {
                if (a.type === 'string') {
                    await databases.createStringAttribute(dbId, c.id, a.key, a.size || 255, a.required || false);
                } else if (a.type === 'integer') {
                    await databases.createIntegerAttribute(dbId, c.id, a.key, a.required || false);
                } else if (a.type === 'boolean') {
                    await databases.createBooleanAttribute(dbId, c.id, a.key, a.required || false);
                }
                console.log(`   + Attributo '${a.key}' configurato.`);
                // Appwrite rate-limiting protection + processing time for attributes
                await sleep(500);
            } catch (e) {
                if (e.code === 409) console.log(`   = Attributo '${a.key}' esiste già.`);
                else console.error(`   ! Errore su attributo '${a.key}':`, e.message);
            }
        }
    }
    console.log("\n🚀 Setup del Database Appwrite Completato con Successo! Tutte le 8 tabelle e gli attributi sono pronti per il progetto.");
}

setup().catch(console.error);
