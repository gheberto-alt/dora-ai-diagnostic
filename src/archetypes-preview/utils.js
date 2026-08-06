import { OPTIONS, PREVIEW_BASE_PATH, QUESTIONS, SAMPLE_NAMES } from './data';

const HIGH_PERFORMANCE_IDS = new Set([1, 2, 3, 7, 8]);
const RISK_FACTOR_IDS = new Set([4, 5, 6]);

function normalizeScore(question, value) {
  const numeric = Number(value || 0);
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

export function calculateAverage(answers) {
  const total = QUESTIONS.reduce((sum, question) => sum + normalizeScore(question, answers?.[question.id]), 0);
  return Number((total / QUESTIONS.length).toFixed(2));
}

export function getArchetypeInfo(answers = {}, avg = 0) {
  const teamPerformance = Number(answers?.[1] ?? 0);
  const productPerformance = Number(answers?.[2] ?? 0);
  const valuableWork = Number(answers?.[3] ?? 0);
  const friction = Number(answers?.[4] ?? 0);
  const burnout = Number(answers?.[5] ?? 0);
  const instability = Number(answers?.[6] ?? 0);
  const individualEffectiveness = Number(answers?.[7] ?? 0);
  const throughput = Number(answers?.[8] ?? 0);

  if (avg <= 2.2 && friction >= 4 && burnout >= 4 && instability >= 4) {
    return {
      silhouette: 'Contraída',
      cluster: '1. Desafíos fundamentales',
      status: 'Supervivencia',
      description: 'Bajo rendimiento y efectividad, con fricción, burnout e inestabilidad en zona crítica.',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      color: '#f43f5e',
      speakerNote: 'El equipo está en modo supervivencia. Antes de acelerar, hay que estabilizar el sistema de trabajo y reducir el daño operativo.',
    };
  }

  if (productPerformance <= 2 && instability >= 4.5) {
    return {
      silhouette: 'Contraída',
      cluster: '2. El cuello de botella legado',
      status: 'Reactividad',
      description: 'El sistema antiguo impone el ritmo: producto débil, alta inestabilidad y trabajo reactivo.',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: '#f59e0b',
      speakerNote: 'La prioridad es intervenir el sistema legado y estabilizar la entrega antes de esperar mejores resultados de producto.',
    };
  }

  if (individualEffectiveness <= 2.5 && valuableWork <= 2.5 && instability <= 2.5 && friction >= 4) {
    return {
      silhouette: 'Irregular',
      cluster: '3. Limitados por el proceso',
      status: 'Fricción',
      description: 'La operación no es caótica, pero los procesos y obstáculos frenan el trabajo valioso y la efectividad.',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      color: '#eab308',
      speakerNote: 'La oportunidad está en remover burocracia y simplificar el flujo para liberar efectividad real del equipo.',
    };
  }

  if (productPerformance >= 4 && individualEffectiveness >= 4 && throughput <= 2.5 && instability >= 4) {
    return {
      silhouette: 'Irregular',
      cluster: '4. Alto impacto, baja cadencia',
      status: 'Tensión operativa',
      description: 'El equipo genera valor, pero entrega lento y bajo tensión por la inestabilidad operativa.',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      color: '#38bdf8',
      speakerNote: 'Hay valor claro, pero la cadencia es frágil. Conviene atacar confiabilidad de entrega y flujo de cambios.',
    };
  }

  if (productPerformance >= 4 && valuableWork >= 4 && burnout <= 2 && friction <= 2.5 && throughput <= 2.5) {
    return {
      silhouette: 'Estable',
      cluster: '5. Estables y metódicos',
      status: 'Calidad consistente',
      description: 'Buen nivel de calidad y valor, con poca fricción, pero aún sin una velocidad alta de entrega.',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      color: '#3b82f6',
      speakerNote: 'Son artesanos constantes: la mejora más natural es aumentar throughput sin sacrificar estabilidad ni calidad.',
    };
  }

  if (throughput >= 4 && instability <= 2.5 && burnout >= 2.5 && burnout <= 3.5 && friction >= 2.5 && friction <= 3.5) {
    return {
      silhouette: 'Expandida',
      cluster: '6. Ejecutores pragmáticos',
      status: 'Alto rendimiento funcional',
      description: 'Entregan bien y con estabilidad, aunque la experiencia del trabajo todavía no alcanza plena armonía.',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      color: '#10b981',
      speakerNote: 'El equipo ya funciona bien. El siguiente salto es fortalecer propósito, experiencia de trabajo y sostenibilidad.',
    };
  }

  if (
    teamPerformance >= 4.5 &&
    productPerformance >= 4.5 &&
    valuableWork >= 4.5 &&
    individualEffectiveness >= 4.5 &&
    throughput >= 4.5 &&
    friction <= 1.5 &&
    burnout <= 1.5 &&
    instability <= 1.5
  ) {
    return {
      silhouette: 'Expandida',
      cluster: '7. Triunfadores armoniosos',
      status: 'Excelencia',
      description: 'Máximo rendimiento, alta efectividad y mínimo desgaste operativo. Es el patrón de excelencia.',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      color: '#a855f7',
      speakerNote: 'Este es el benchmark: alto rendimiento con bajo desgaste. Aquí la IA puede escalar sobre una base realmente saludable.',
    };
  }

  if (avg >= 4.1) {
    return {
      silhouette: 'Expandida',
      cluster: '6-7. Operación madura',
      status: 'Madurez alta',
      description: 'La mayoría de los factores están sanos, con una base sólida para rendimiento sostenido.',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      color: '#8b5cf6',
      speakerNote: 'La base es fuerte. Conviene ahora mirar brechas finas entre velocidad, sostenibilidad y valor entregado.',
    };
  }

  return {
    silhouette: avg >= 3 ? 'Irregular' : 'Contraída',
    cluster: 'Zona intermedia',
    status: avg >= 3 ? 'Transición' : 'Atención',
    description: 'El equipo muestra señales mixtas: algunas capacidades están sanas y otras aún generan fricción o desgaste.',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    color: '#06b6d4',
    speakerNote: 'Revisa qué factores de riesgo se estiran hacia afuera y qué factores de rendimiento quedan comprimidos. Ahí está la brecha prioritaria.',
  };
}

export function aggregateResponses(responses) {
  if (!responses.length) {
    const radarData = QUESTIONS.map((question) => ({
      id: question.id,
      subject: question.shortLabel,
      fullCategory: question.category,
      Promedio: 0,
      Benchmark: question.reverseScore ? 1 : 4.5,
    }));

    return {
      radarData,
      overallAverage: 0,
      totalParticipants: 0,
      archetype: getArchetypeInfo({}, 0),
    };
  }

  const sums = Object.fromEntries(QUESTIONS.map((question) => [question.id, 0]));
  const normalizedSums = Object.fromEntries(QUESTIONS.map((question) => [question.id, 0]));
  let totalNormalized = 0;

  responses.forEach((response) => {
    QUESTIONS.forEach((question) => {
      const rawValue = Number(response.answers?.[question.id] ?? response.answers?.[String(question.id)] ?? 0);
      const normalizedValue = normalizeScore(question, rawValue);
      sums[question.id] += rawValue;
      normalizedSums[question.id] += normalizedValue;
      totalNormalized += normalizedValue;
    });
  });

  const count = responses.length;
  const radarData = QUESTIONS.map((question) => ({
    id: question.id,
    subject: question.shortLabel,
    fullCategory: question.category,
    Promedio: Number((sums[question.id] / count).toFixed(2)),
    Normalizado: Number((normalizedSums[question.id] / count).toFixed(2)),
    Benchmark: question.reverseScore ? 1 : 4.5,
    kind: HIGH_PERFORMANCE_IDS.has(question.id) ? 'performance' : RISK_FACTOR_IDS.has(question.id) ? 'risk' : 'neutral',
  }));

  const overallAverage = Number((totalNormalized / (count * QUESTIONS.length)).toFixed(2));

  const averageAnswers = Object.fromEntries(
    QUESTIONS.map((question) => [question.id, Number((sums[question.id] / count).toFixed(2))])
  );

  return {
    radarData,
    overallAverage,
    totalParticipants: count,
    archetype: getArchetypeInfo(averageAnswers, overallAverage),
  };
}

export function generateSimulatedResponses(count = 18) {
  return Array.from({ length: count }, (_, index) => {
    const answers = Object.fromEntries(
      QUESTIONS.map((question) => {
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