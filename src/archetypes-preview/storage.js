import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { generateSimulatedResponses } from './utils';

const STORAGE_KEY = 'dora_preview_archetypes_responses';
const SESSION_KEY = 'dora_preview_archetypes_session_id';
const RESET_MARKER_NAME = '__DORA_RESET_MARKER__';
const RESET_MARKER_EMAIL = 'reset@dora.internal';
const PREVIEW_PREFIX = 'preview-arquetipos';

function isResetMarker(response) {
  return response?.name === RESET_MARKER_NAME && response?.email === RESET_MARKER_EMAIL;
}

function filterResponsesAfterLastReset(responses) {
  const lastResetIndex = [...responses].map((response, index) => ({ response, index })).filter(({ response }) => isResetMarker(response)).at(-1)?.index;
  const scopedResponses = lastResetIndex == null ? responses : responses.slice(lastResetIndex + 1);
  return scopedResponses.filter((response) => !isResetMarker(response));
}

function createResetMarker() {
  return {
    session_id: `${PREVIEW_PREFIX}:system-reset`,
    name: RESET_MARKER_NAME,
    email: RESET_MARKER_EMAIL,
    answers: {},
    average_score: 0,
  };
}

function readLocalResponses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

export function getSessionId() {
  const current = localStorage.getItem(SESSION_KEY);
  if (current) return current;

  const next = `${PREVIEW_PREFIX}:${crypto.randomUUID()}`;
  localStorage.setItem(SESSION_KEY, next);
  return next;
}

export async function listResponses() {
  if (!isSupabaseConfigured) {
    const existing = readLocalResponses();
    if (existing.length) return filterResponsesAfterLastReset(existing);

    const seeded = generateSimulatedResponses();
    writeLocalResponses(seeded);
    return filterResponsesAfterLastReset(seeded);
  }

  const { data, error } = await supabase.from('responses').select('*').like('session_id', `${PREVIEW_PREFIX}:%`).order('created_at', { ascending: true });
  if (error) throw error;
  return filterResponsesAfterLastReset(data ?? []);
}

export async function createResponse(payload) {
  if (!isSupabaseConfigured) {
    const responses = readLocalResponses();
    const entry = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...payload,
    };
    writeLocalResponses([...responses, entry]);
    window.dispatchEvent(new CustomEvent('dora-preview-storage-updated'));
    return entry;
  }

  const { data, error } = await supabase.from('responses').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function clearResponses() {
  if (!isSupabaseConfigured) {
    const responses = readLocalResponses();
    const marker = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...createResetMarker(),
    };
    writeLocalResponses([...responses, marker]);
    window.dispatchEvent(new CustomEvent('dora-preview-storage-updated'));
    return;
  }

  const { error } = await supabase.from('responses').insert(createResetMarker());
  if (error) throw error;
}

export function subscribeToResponses(onChange) {
  if (!isSupabaseConfigured) {
    const handler = () => onChange();
    window.addEventListener('storage', handler);
    window.addEventListener('dora-preview-storage-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('dora-preview-storage-updated', handler);
    };
  }

  const channel = supabase
    .channel('preview-archetypes-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}