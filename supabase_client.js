const SUPABASE_URL = 'https://zhairixyldlctaiuwqto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYWlyaXh5bGRsY3RhaXV3cXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NTg2MzAsImV4cCI6MjA5MTEzNDYzMH0.Q2-UGHxggbvDUIbDQ7vJtqaL2Z_QjRr25LyigYr48JI';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabaseClient;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

window.appState = {
    rioni: [],
    atleti: [],
    giochi: [],
    squadre: [],
    messaggi: [],
    momenti_salienti: [],
    fasce_eta: [],
    config: {},
    currentUser: null
};

window.loadData = async function() {
    try {
        const { data: rioniData } = await supabaseClient.from('rioni').select('*');
        if (rioniData) window.appState.rioni = rioniData;

        const { data: atletiData } = await supabaseClient.from('atleti').select('*');
        if (atletiData) window.appState.atleti = atletiData;

        const { data: giochiData } = await supabaseClient.from('giochi').select('*');
        if (giochiData) window.appState.giochi = giochiData;

        const { data: squadreData } = await supabaseClient.from('squadre').select('*');
        if (squadreData) window.appState.squadre = squadreData;

        const { data: messaggiData } = await supabaseClient.from('messaggi').select('*').order('created_at', { ascending: true });
        if (messaggiData) window.appState.messaggi = messaggiData;

        const { data: highlightsData } = await supabaseClient.from('momenti_salienti').select('*').order('created_at', { ascending: false });
        if (highlightsData) window.appState.momenti_salienti = highlightsData;

        const { data: fasceData } = await supabaseClient.from('fasce_eta').select('*').order('min_eta', { ascending: true });
        if (fasceData) window.appState.fasce_eta = fasceData;

        const { data: configData } = await supabaseClient.from('impostazioni').select('*');
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

function setupRealtimeSubscription() {
    const channel = supabaseClient.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rioni' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'atleti' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'giochi' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'squadre' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'momenti_salienti' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messaggi' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fasce_eta' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'impostazioni' }, () => loadData())
        .subscribe();

    return channel;
}

window.setupRealtimeSubscription = setupRealtimeSubscription;
