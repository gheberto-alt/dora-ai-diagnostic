import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { QUESTIONS, SAMPLE_NAMES } from '../src/data.js';

const RESET_MARKER_NAME = '__DORA_RESET_MARKER__';
const RESET_MARKER_EMAIL = 'reset@dora.internal';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  const entries = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    entries[key] = value;
  }

  return entries;
}

function getEnv() {
  const cwd = process.cwd();
  const envFromFile = {
    ...loadEnvFile(path.join(cwd, '.env.local')),
    ...loadEnvFile(path.join(cwd, '.env')),
  };

  return {
    ...envFromFile,
    ...process.env,
  };
}

function parseArgs(argv) {
  const defaults = {
    total: 100,
    concurrency: 25,
    rampMs: 15000,
    jitterMs: 250,
    resetFirst: false,
    mode: 'ramp',
    label: `evento-${new Date().toISOString().replace(/[:.]/g, '-')}`,
  };

  const config = { ...defaults };

  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, rawValue] = arg.slice(2).split('=');
    const key = rawKey.trim();
    const value = rawValue ?? 'true';

    if (['total', 'concurrency', 'rampMs', 'jitterMs'].includes(key)) {
      config[key] = Number(value);
      continue;
    }

    if (key === 'resetFirst') {
      config.resetFirst = value === 'true';
      continue;
    }

    if (key === 'mode') {
      config.mode = value;
      continue;
    }

    if (key === 'label') {
      config.label = value;
    }
  }

  if (!Number.isFinite(config.total) || config.total <= 0) throw new Error('El parámetro --total debe ser mayor que 0.');
  if (!Number.isFinite(config.concurrency) || config.concurrency <= 0) throw new Error('El parámetro --concurrency debe ser mayor que 0.');
  if (!Number.isFinite(config.rampMs) || config.rampMs < 0) throw new Error('El parámetro --rampMs no puede ser negativo.');
  if (!Number.isFinite(config.jitterMs) || config.jitterMs < 0) throw new Error('El parámetro --jitterMs no puede ser negativo.');
  if (!['ramp', 'burst'].includes(config.mode)) throw new Error('El parámetro --mode debe ser ramp o burst.');

  return config;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickName(index) {
  const base = SAMPLE_NAMES[index % SAMPLE_NAMES.length];
  return `${base} Test ${index + 1}`;
}

function buildAnswers() {
  return Object.fromEntries(
    QUESTIONS.map((question) => {
      const weighted = Math.random();
      const value = weighted < 0.1 ? 1 : weighted < 0.25 ? 2 : weighted < 0.55 ? 3 : weighted < 0.82 ? 4 : 5;
      return [question.id, value];
    }),
  );
}

function calculateAverage(answers) {
  const values = Object.values(answers).map(Number);
  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function createPayload(index, label) {
  const answers = buildAnswers();
  const average = calculateAverage(answers);
  const randomSuffix = Math.random().toString(36).slice(2, 10);

  return {
    session_id: `${label}-session-${index + 1}-${randomSuffix}`,
    name: pickName(index),
    email: `${label}-asistente-${index + 1}@example.test`,
    answers,
    average_score: average,
  };
}

async function insertResetMarker(supabase, label) {
  const { error } = await supabase.from('responses').insert({
    session_id: `system-reset-${label}`,
    name: RESET_MARKER_NAME,
    email: RESET_MARKER_EMAIL,
    answers: {},
    average_score: 0,
  });

  if (error) throw error;
}

async function runWithConcurrency(tasks, concurrency) {
  const results = new Array(tasks.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= tasks.length) return;
      results[index] = await tasks[index]();
    }
  }

  const workerCount = Math.min(concurrency, tasks.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function main() {
  const env = getEnv();
  const config = parseArgs(process.argv.slice(2));
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY en .env, .env.local o variables de entorno.');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('--- DORA AI Load Test ---');
  console.log(JSON.stringify(config, null, 2));

  if (config.resetFirst) {
    console.log('Insertando marcador de reset lógico antes de iniciar...');
    await insertResetMarker(supabase, config.label);
  }

  const tasks = Array.from({ length: config.total }, (_, index) => async () => {
    const plannedDelay = config.mode === 'burst'
      ? randomInt(0, config.jitterMs)
      : Math.round((index * config.rampMs) / Math.max(config.total - 1, 1)) + randomInt(0, config.jitterMs);

    if (plannedDelay > 0) await sleep(plannedDelay);

    const payload = createPayload(index, config.label);
    const startedAt = performance.now();
    const { error } = await supabase.from('responses').insert(payload);
    const durationMs = Number((performance.now() - startedAt).toFixed(2));

    if (error) {
      return {
        ok: false,
        durationMs,
        index,
        message: error.message,
        code: error.code,
      };
    }

    return {
      ok: true,
      durationMs,
      index,
    };
  });

  const suiteStartedAt = performance.now();
  const results = await runWithConcurrency(tasks, config.concurrency);
  const suiteDurationMs = Number((performance.now() - suiteStartedAt).toFixed(2));

  const success = results.filter((result) => result.ok);
  const failed = results.filter((result) => !result.ok);
  const latencies = success.map((result) => result.durationMs).sort((a, b) => a - b);
  const averageLatency = latencies.length ? Number((latencies.reduce((sum, value) => sum + value, 0) / latencies.length).toFixed(2)) : 0;
  const p95Latency = latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * 0.95))] : 0;
  const maxLatency = latencies.length ? latencies[latencies.length - 1] : 0;
  const errorRate = Number(((failed.length / results.length) * 100).toFixed(2));

  console.log('\n--- Resumen ---');
  console.table({
    totalSolicitudes: results.length,
    exitosas: success.length,
    fallidas: failed.length,
    tasaErrorPct: errorRate,
    duracionTotalMs: suiteDurationMs,
    latenciaPromedioMs: averageLatency,
    latenciaP95Ms: p95Latency,
    latenciaMaxMs: maxLatency,
  });

  if (failed.length) {
    console.log('\n--- Primeros errores ---');
    console.table(failed.slice(0, 10).map(({ index, code, message, durationMs }) => ({ index: index + 1, code, message, durationMs })));
  }

  console.log('\nSugerencia: revisa https://dora-ai-diagnostic.vercel.app/speaker durante y después de la prueba.');

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nError ejecutando la prueba de carga:\n');
  console.error(error.message);
  process.exitCode = 1;
});