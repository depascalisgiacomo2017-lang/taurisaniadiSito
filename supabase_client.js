// Configurazione Supabase Client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabase;

// Stato globale
window.appState = {
    rioni: [],
    atleti: [],
    giochi: [],
    squadre: [],
    messaggi: [],
    momenti_salienti: [],
    config: {},
    currentUser: null
};

// Funzione di caricamento dati
window.loadData = async function() {
    try {
        const { data: rioniData } = await supabase.from('rioni').select('*');
        if (rioniData) window.appState.rioni = rioniData;

        const { data: atletiData } = await supabase.from('atleti').select('*');
        if (atletiData) window.appState.atleti = atletiData;

        const { data: giochiData } = await supabase.from('giochi').select('*');
        if (giochiData) window.appState.giochi = giochiData;

        const { data: squadreData } = await supabase.from('squadre').select('*');
        if (squadreData) window.appState.squadre = squadreData;

        const { data: messaggiData } = await supabase.from('messaggi').select('*').order('created_at', { ascending: true });
        if (messaggiData) window.appState.messaggi = messaggiData;

        const { data: highlightsData } = await supabase.from('momenti_salienti').select('*').order('created_at', { ascending: false });
        if (highlightsData) window.appState.momenti_salienti = highlightsData;

        const { data: configData } = await supabase.from('impostazioni').select('*');
        if (configData) {
            window.appState.config = {};
            configData.forEach(item => {
                window.appState.config[item.key] = item.value;
            });
        }

        console.log('Dati caricati con successo');
    } catch (error) {
        console.error('Errore caricamento dati:', error);
    }
};

// Carica dati all'avvio
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
