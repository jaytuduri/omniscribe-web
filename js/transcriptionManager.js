// Manages saving, loading, and deleting transcriptions using localStorage

const STORAGE_KEY = 'omniscribe_transcriptions';
const MAX_RECENT_TRANSCRIPTIONS = 6; // Show up to 6 recent transcriptions on start page

// Get all saved transcriptions
export function getAllTranscriptions() {
    const transcriptions = localStorage.getItem(STORAGE_KEY);
    const parsed = transcriptions ? JSON.parse(transcriptions) : [];
    console.log('📚 Retrieved all transcriptions:', parsed.length, 'items');
    return parsed;
}

// Get recent transcriptions for the start page
export function getRecentTranscriptions() {
    const transcriptions = getAllTranscriptions();
    const recent = transcriptions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, MAX_RECENT_TRANSCRIPTIONS);
    console.log('🕒 Retrieved recent transcriptions:', recent.length, 'items');
    return recent;
}

// Save a new transcription
export function saveTranscription(text, options = {}) {
    const transcriptions = getAllTranscriptions();
    const transcription = {
        id: Date.now().toString(),
        timestamp: '2024-12-09T20:51:23+01:00',
        text,
        options
    };
    
    transcriptions.push(transcription);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transcriptions));
    console.log('💾 Saved new transcription:', { id: transcription.id, timestamp: transcription.timestamp });
    return transcription;
}

// Delete a specific transcription
export function deleteTranscription(id) {
    const transcriptions = getAllTranscriptions();
    const filteredTranscriptions = transcriptions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTranscriptions));
    console.log('🗑️ Deleted transcription:', id);
}

// Clear all transcriptions
export function clearAllTranscriptions() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 Cleared all transcriptions');
}

// Get a specific transcription by ID
export function getTranscription(id) {
    const transcriptions = getAllTranscriptions();
    const transcription = transcriptions.find(t => t.id === id);
    console.log('🔍 Retrieved transcription by ID:', id, transcription ? 'found' : 'not found');
    return transcription;
}

// Format timestamp for display
export function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}
