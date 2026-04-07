// === Appwrite to Supabase Adapter ===
// Garantisce che tutto il codice Supabase funzioni nativamente su Appwrite

const { Client, Databases, ID, Query } = Appwrite;

const appwriteClient = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69d4d02a0002bbac0b96');

const db = new Databases(appwriteClient);
const DB_ID = 'TaurisaniadiDB';

// Il proxy che inganna l'app facendole credere di star parlando con Supabase
window.supabaseClient = {
    from: function(table) {
        return new AppwriteAdapterQueryBuilder(table);
    }
};

class AppwriteAdapterQueryBuilder {
    constructor(table) {
        this.table = table;
        this.action = null;
        this.payload = null;
        this.queries = [];
        this.isSingle = false;
    }
    
    select(cols) { this.action = 'select'; return this; }
    insert(payload) { this.action = 'insert'; this.payload = payload; return this; }
    upsert(payload, opts) { this.action = 'upsert'; this.payload = payload; return this; }
    update(payload) { this.action = 'update'; this.payload = payload; return this; }
    delete() { this.action = 'delete'; return this; }
    
    eq(key, val) { this.queries.push(Query.equal(key, val)); return this; }
    is(key, val) { 
        if (val === null) this.queries.push(Query.isNull(key)); 
        else this.queries.push(Query.equal(key, val));
        return this; 
    }
    order(key, opts) {
        if (opts && opts.ascending) this.queries.push(Query.orderAsc(key));
        else this.queries.push(Query.orderDesc(key));
        return this;
    }
    single() { this.isSingle = true; return this; }
    
    then(resolve, reject) {
        return this.execute().then(resolve, reject);
    }
    catch(reject) {
        return this.execute().catch(reject);
    }

    // Ricostruisce stringhe JSON nei veri array/oggetti richiesti dall'app
    _parseAppwriteData(doc) {
        let clean = { 
            ...doc, 
            id: doc.$id,
            created_at: doc.$createdAt,
            updated_at: doc.$updatedAt
        };
        for (let k in clean) {
            if (typeof clean[k] === 'string' && (clean[k].startsWith('{') || clean[k].startsWith('['))) {
                try { clean[k] = JSON.parse(clean[k]); } catch(e) {}
            }
        }
        return clean;
    }

    // Codifica oggetti in stringhe JSON dato che Appwrite schema è a Stringhe
    _prepareAppwritePayload(payload) {
        let clean = { ...payload };
        delete clean.id; // rimuovi id prima di inviare ad Appwrite (useremo $id o custom)
        
        for (let k in clean) {
            if (typeof clean[k] === 'object' && clean[k] !== null) {
                clean[k] = JSON.stringify(clean[k]);
            }
            if (clean[k] === undefined) {
                clean[k] = null;
            }
        }
        return clean;
    }

    async execute() {
        try {
            if (this.action === 'select') {
                const res = await db.listDocuments(DB_ID, this.table, this.queries);
                let data = res.documents.map(d => this._parseAppwriteData(d));
                
                if (this.isSingle) {
                    if (data.length === 0) return { data: null, error: { code: 'PGRST116', message: "No rows returned" } };
                    return { data: data[0], error: null };
                }
                return { data: data, error: null };
            }
            
            if (this.action === 'insert') {
                let items = Array.isArray(this.payload) ? this.payload : [this.payload];
                let res = [];
                for(let item of items) {
                    let docId = item.id || ID.unique();
                    let cleanItem = this._prepareAppwritePayload(item);
                    let created = await db.createDocument(DB_ID, this.table, docId, cleanItem);
                    res.push(this._parseAppwriteData(created));
                }
                return { data: res, error: null };
            }
            
            if (this.action === 'upsert') {
                let items = Array.isArray(this.payload) ? this.payload : [this.payload];
                let res = [];
                for(let item of items) {
                    let id = item.id;
                    
                    // Gestione bug Impostazioni e LIVE
                    if (!id && this.table === 'impostazioni' && item.key) {
                        const existing = await db.listDocuments(DB_ID, 'impostazioni', [Query.equal('key', item.key)]);
                        if (existing.documents.length > 0) {
                            id = existing.documents[0].$id;
                        }
                    }
                    if (!id && this.table === 'squadre' && item.game_id && item.rione_id) {
                        const existing = await db.listDocuments(DB_ID, 'squadre', [Query.equal('game_id', item.game_id), Query.equal('rione_id', item.rione_id)]);
                        if (existing.documents.length > 0) id = existing.documents[0].$id;
                    }
                    
                    let cleanItem = this._prepareAppwritePayload(item);
                    
                    if (id) {
                        try {
                            let updated = await db.updateDocument(DB_ID, this.table, id, cleanItem);
                            res.push(this._parseAppwriteData(updated));
                        } catch(e) {
                             if (e.code === 404) {
                                 let created = await db.createDocument(DB_ID, this.table, id, cleanItem);
                                 res.push(this._parseAppwriteData(created));
                             } else throw e;
                        }
                    } else {
                        let created = await db.createDocument(DB_ID, this.table, ID.unique(), cleanItem);
                        res.push(this._parseAppwriteData(created));
                    }
                }
                
                return { data: Array.isArray(this.payload) ? res : res[0], error: null };
            }
            
            if (this.action === 'delete') {
                const res = await db.listDocuments(DB_ID, this.table, this.queries);
                for (let doc of res.documents) {
                    await db.deleteDocument(DB_ID, this.table, doc.$id);
                }
                return { data: null, error: null };
            }
            
        } catch (err) {
            console.error("Appwrite Adapter Error in '" + this.action + "':", err);
            return { data: null, error: err };
        }
    }
}
