import { generateSimulatedResponses } from '../utils';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEY = 'dora_diagnostic_responses';
const SESSION_KEY = 'dora_diagnostic_session_id';

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

  const next = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, next);
  return next;
}

export async function listResponses() {
  if (!isSupabaseConfigured) {
    const existing = readLocalResponses();
    if (existing.length) return existing;

    const seeded = generateSimulatedResponses();
    writeLocalResponses(seeded);
    return seeded;
  }

  const { data, error } = await supabase.from('responses').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
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
    window.dispatchEvent(new CustomEvent('dora-local-storage-updated'));
    return entry;
  }

  const { data, error } = await supabase.from('responses').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function clearResponses() {
  if (!isSupabaseConfigured) {
    writeLocalResponses([]);
    window.dispatchEvent(new CustomEvent('dora-local-storage-updated'));
    return;
  }

  const { error } = await supabase.from('responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

export function subscribeToResponses(onChange) {
  if (!isSupabaseConfigured) {
    const handler = () => onChange();
    window.addEventListener('storage', handler);
    window.addEventListener('dora-local-storage-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('dora-local-storage-updated', handler);
    };
  }

  const channel = supabase
    .channel('responses-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}