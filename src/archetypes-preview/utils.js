import { OPTIONS, PREVIEW_BASE_PATH, QUESTIONS, SAMPLE_NAMES } from './data';

// Factor IDs by type
const POSITIVE_IDS = new Set([1, 2, 3, 7, 8]); // higher = better, used as-is
const NEGATIVE_IDS = new Set([4, 5, 6]);        // higher = worse, inverted with 6 - value

/**
 * Normalize a single raw response value for a factor.
 * Positive factors: use value as-is.
 * Negative factors (friction, burnout, instability): invert → 6 - value
 */
function normalizeScore(question, value) {
  const numeric = Number(value || 0);
  if (numeric === 0) return 0;
  return question.reverseScore ? 6 - numeric : numeric;
}

function isPreviewPath(pathname) {
  return pathname === PREVIEW_BASE_PATH || pathname.startsWith(`${PREVIEW_BASE_PATH}/`);
}

export function getRouteMode(pathname) {
  if (pathname === `${PREVIEW_BASE_PATH}/speaker` || pathname === '/speaker') return 'speaker';
  return 'attendee';
}

export function getNavigationPath(mode) {
  const pathname = window.location.pathname;
  if (isPreviewPath(pathname)) {
    return mode === 'speaker' ? `${PREVIEW_BASE_PATH}/speaker` : PREVIEW_BASE_PATH;
  }
  return mode === 'speaker' ? '/speaker' : '/';
}

export function isPreviewRoute(pathname) {
  return isPreviewPath(pathname);
}

/**
 * Calculate the normalized average score for a set of answers.
 * Each answer is normalized (negative factors inverted) then averaged.
 */
export function calculateAverage(answers) {
  const total = QUESTIONS.reduce(
    (sum, question) => sum + normalizeScore(question, answers?.[question.id]),
    0
  );
  return Number((total / QUESTIONS.length).toFixed(2));
}

/**
 * Classify the archetype based on the normalized scores vector.
 *
 * Model (derived from the radar shape interpretation in the scoring document):
 *
 * All factor scores after normalization are on 1–5 scale where 5 = excellent.
 *
 * Shape classification:
 *  - "Expandida" (large, balanced): avg ≥ 4.0 and no factor below 3.0
 *  - "Estable" (steady): avg ≥ 3.0 and no factor below 2.0, max spread < 2.5
 *  - "Irregular" (unbalanced): avg ≥ 3.0 but high spread (max - min ≥ 2.5)
 *  - "Contraída" (small): avg < 3.0
 *
 * Within each shape, specific factor patterns determine the archetype cluster.
 */
export function getArchetypeInfo(answers = {}, avg = 0) {
  // Build normalized vector
  const scores = {};
  QUESTIONS.forEach((q) => {
    scores[q.id] = normalizeScore(q, Number(answers?.[q.id] ?? 0));
  });

  const teamPerf    = scores[1];
  const productPerf = scores[2];
  const valuableWork= scores[3];
  const friction    = scores[4]; // already inverted: high = low friction = good
  const burnout     = scores[5]; // already inverted: high = low burnout = good
  const instability = scores[6]; // already inverted: high = low instability = good
  const individual  = scores[7];
  const throughput  = scores[8];

  const validScores = Object.values(scores).filter((v) => v > 0);
  const allFactorsPresent = validScores.length === QUESTIONS.length;

  // If no data at all, return placeholder
  if (!allFactorsPresent && avg === 0) {
    return {
      silhouette: '—',
      cluster: 'Sin datos',
      status: 'Esperando respuestas',
      description: 'Aún no hay suficientes respuestas para clasificar el equipo.',
      badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      color: '#64748b',
      speakerNote: 'Invita a los participantes a responder el cuestionario para ver el diagnóstico del equipo.',
    };
  }

  const minScore = Math.min(...validScores);
  const maxScore = Math.max(...validScores);
  const spread = maxScore - minScore;

  // ── ARCHETYPE 7: Triunfadores armoniosos (large + balanced, all excellent)
  if (avg >= 4.2 && minScore >= 3.5) {
    return {
      silhouette: 'Expandida',
      cluster: '7. Triunfadores armoniosos',
      status: 'Excelencia sostenida',
      description: 'Forma grande y equilibrada: alto rendimiento en todos los factores con bajo desgaste operativo. Patrón de excelencia DORA.',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      color: '#a855f7',
      speakerNote: 'Su equipo opera en la cima. Bajo burnout, alta velocidad, producto sólido y colaboración real. Escalar IA aquí tiene una base real.',
    };
  }

  // ── ARCHETYPE 6: Ejecutores pragmáticos (large + stable delivery, moderate friction/burnout)
  if (avg >= 3.8 && throughput >= 4 && instability >= 3.5 && minScore >= 2.5) {
    return {
      silhouette: 'Expandida',
      cluster: '6. Ejecutores pragmáticos',
      status: 'Alto rendimiento funcional',
      description: 'Forma amplia con buena cadencia de entrega y estabilidad. El equipo funciona bien aunque hay margen en experiencia de trabajo.',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      color: '#10b981',
      speakerNote: 'Entregan con consistencia y ritmo. El siguiente salto es fortalecer el propósito y reducir el desgaste residual para alcanzar excelencia sostenida.',
    };
  }

  // ── ARCHETYPE 5: Estables y metódicos (steady shape, good quality, slow throughput)
  if (avg >= 3.5 && productPerf >= 4 && valuableWork >= 4 && throughput < 3.5 && spread < 2.5) {
    return {
      silhouette: 'Estable',
      cluster: '5. Estables y metódicos',
      status: 'Calidad consistente',
      description: 'Forma estable con buen producto y trabajo valioso, pero cadencia de entrega todavía moderada. Artesanos de calidad.',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      color: '#3b82f6',
      speakerNote: 'Hacen bien su trabajo y lo que entregan tiene impacto. La mejora más natural es acelerar la cadencia sin sacrificar calidad ni bienestar.',
    };
  }

  // ── ARCHETYPE 4: Alto impacto, baja cadencia (irregular: high product/individual, low throughput/instability)
  if (productPerf >= 4 && individual >= 4 && (throughput < 3 || instability < 3) && spread >= 2) {
    return {
      silhouette: 'Irregular',
      cluster: '4. Alto impacto, baja cadencia',
      status: 'Tensión operativa',
      description: 'Forma irregular: alta efectividad y producto sólido, pero limitados por cadencia o inestabilidad en la entrega.',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      color: '#38bdf8',
      speakerNote: 'El potencial está ahí. La prioridad es atacar lo que frena la cadencia: estabilidad de entrega y reducción de dependencias críticas.',
    };
  }

  // ── ARCHETYPE 3: Limitados por el proceso (irregular: low friction/individual, high spread)
  if (friction < 3 && (individual < 3 || valuableWork < 3) && spread >= 2) {
    return {
      silhouette: 'Irregular',
      cluster: '3. Limitados por el proceso',
      status: 'Fricción sistémica',
      description: 'Forma irregular: la burocracia y las dependencias reducen la efectividad individual y el trabajo valioso.',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      color: '#eab308',
      speakerNote: 'Los procesos están frenando a las personas. Remover burocracia y simplificar el flujo libera capacidad sin necesidad de agregar recursos.',
    };
  }

  // ── ARCHETYPE 2: Cuello de botella legado (contracted: weak product + high instability)
  if (productPerf < 3 && instability < 2.5) {
    return {
      silhouette: 'Contraída',
      cluster: '2. El cuello de botella legado',
      status: 'Reactividad sistémica',
      description: 'Forma pequeña con producto débil y alta inestabilidad. El sistema legado dicta el ritmo y genera trabajo reactivo constante.',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: '#f59e0b',
      speakerNote: 'Antes de acelerar, hay que intervenir el sistema de entrega. La inestabilidad consume energía que no se convierte en valor.',
    };
  }

  // ── ARCHETYPE 1: Desafíos fundamentales (contracted: low avg + multiple risk factors critical)
  if (avg < 2.8 && friction < 2.5 && burnout < 2.5) {
    return {
      silhouette: 'Contraída',
      cluster: '1. Desafíos fundamentales',
      status: 'Supervivencia',
      description: 'Forma pequeña y comprimida: bajo rendimiento generalizado, alta fricción y burnout en zona crítica.',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      color: '#f43f5e',
      speakerNote: 'El equipo está en modo supervivencia. Antes de cualquier mejora técnica o de proceso, hay que estabilizar el bienestar y reducir la fricción.',
    };
  }

  // ── FALLBACK: Zona de transición
  const silhouette = avg >= 4.0 ? 'Expandida' : avg >= 3.0 ? (spread >= 2.5 ? 'Irregular' : 'Estable') : 'Contraída';
  return {
    silhouette,
    cluster: 'Zona intermedia',
    status: avg >= 3.5 ? 'Transición positiva' : avg >= 3.0 ? 'Transición' : 'Atención',
    description: 'El equipo muestra señales mixtas: algunos factores sanos, otros con fricción o desgaste. La forma del radar revela dónde está la brecha.',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    color: '#06b6d4',
    speakerNote: 'Mira qué factores se comprimen hacia el centro: ahí está la prioridad. Los factores de riesgo (fricción, burnout, inestabilidad) son los que más limitan el potencial.',
  };
}

/**
 * Aggregate responses from multiple participants into team-level radar data.
 * Radar uses NORMALIZED values (all factors comparable on 1–5 scale, higher = better).
 */
export function aggregateResponses(responses) {
  if (!responses.length) {
    const radarData = QUESTIONS.map((question) => ({
      id: question.id,
      subject: question.shortLabel,
      fullCategory: question.category,
      Promedio: 0,
      Benchmark: 4.5,
      kind: POSITIVE_IDS.has(question.id) ? 'performance' : 'risk',
    }));

    return {
      radarData,
      overallAverage: 0,
      totalParticipants: 0,
      archetype: getArchetypeInfo({}, 0),
    };
  }

  const normalizedSums = Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]));
  let totalNormalized = 0;

  responses.forEach((response) => {
    QUESTIONS.forEach((question) => {
      const rawValue = Number(
        response.answers?.[question.id] ??
        response.answers?.[String(question.id)] ??
        0
      );
      const normalizedValue = normalizeScore(question, rawValue);
      normalizedSums[question.id] += normalizedValue;
      totalNormalized += normalizedValue;
    });
  });

  const count = responses.length;

  const radarData = QUESTIONS.map((question) => ({
    id: question.id,
    subject: question.shortLabel,
    fullCategory: question.category,
    Promedio: Number((normalizedSums[question.id] / count).toFixed(2)),
    Benchmark: 4.5,
    kind: POSITIVE_IDS.has(question.id) ? 'performance' : 'risk',
  }));

  const overallAverage = Number((totalNormalized / (count * QUESTIONS.length)).toFixed(2));

  // For archetype classification we pass normalized averages per factor
  const averageNormalizedAnswers = Object.fromEntries(
    QUESTIONS.map((q) => [q.id, Number((normalizedSums[q.id] / count).toFixed(2))])
  );

  return {
    radarData,
    overallAverage,
    totalParticipants: count,
    archetype: getArchetypeInfo(averageNormalizedAnswers, overallAverage),
  };
}

/**
 * Generate simulated responses for demo/preview purposes.
 */
export function generateSimulatedResponses(count = 18) {
  return Array.from({ length: count }, (_, index) => {
    const answers = Object.fromEntries(
      QUESTIONS.map((question) => {
        // Positive factors: bias toward 3-5, negative factors: bias toward 1-3 (raw, before inversion)
        const value = question.reverseScore
          ? Math.floor(Math.random() * 3) + 1
          : Math.floor(Math.random() * 3) + 3;
        return [question.id, Math.min(5, Math.max(1, value))];
      })
    );

    return {
      id: `preview-seed-${index + 1}`,
      session_id: `preview-session-${index + 1}`,
      name: `${SAMPLE_NAMES[index % SAMPLE_NAMES.length]} #${index + 1}`,
      email: `preview${index + 1}@evento-demo.com`,
      answers,
      average_score: calculateAverage(answers),
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 45).toISOString(),
    };
  });
}

export function getQuestionOptions() {
  return OPTIONS;
}
