import { QUESTIONS, SAMPLE_NAMES } from './data';

export function getArchetypeInfo(avg) {
  if (avg <= 1.8) {
    return {
      silhouette: 'Contraída',
      cluster: 'Cluster 1: Foundational Challenges',
      status: 'Supervivencia',
      description: 'Agujeros profundos en procesos y estabilidad.',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      color: '#f43f5e',
      speakerNote: 'ALERTA: La IA magnificará el caos existente. Iniciar por una fase de estabilización antes de escalar agentes autónomos.',
    };
  }
  if (avg <= 2.5) {
    return {
      silhouette: 'Contraída',
      cluster: 'Cluster 2: Legacy Bottleneck',
      status: 'Reactividad',
      description: 'Sistemas inestables dictan el trabajo; alta deuda técnica.',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: '#f59e0b',
      speakerNote: 'Priorizar saneamiento de datos, reducción de deuda técnica y estandarización del control de versiones.',
    };
  }
  if (avg <= 3.2) {
    return {
      silhouette: 'Irregular',
      cluster: 'Cluster 3: Constrained by Process',
      status: 'Fricción',
      description: 'Estables pero frenados por burocracia rígida y silos.',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      color: '#eab308',
      speakerNote: 'Enfocar en autonomía de plataforma, lotes pequeños y menos fricción operativa.',
    };
  }
  if (avg <= 3.9) {
    return {
      silhouette: 'Irregular',
      cluster: 'Cluster 4 & 5: High Impact / Methodical',
      status: 'Transición',
      description: 'Buen trabajo pero lento o con picos de estrés operativo.',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      color: '#3b82f6',
      speakerNote: 'Promover contexto enriquecido para IA y mayor resiliencia en entregas automatizadas.',
    };
  }
  if (avg <= 4.5) {
    return {
      silhouette: 'Expandida',
      cluster: 'Cluster 6: Pragmatic Performers',
      status: 'Alto Rendimiento',
      description: 'Gran velocidad y estabilidad técnica general.',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      color: '#10b981',
      speakerNote: 'Listos para escalar pilotos exitosos y avanzar hacia orquestación agéntica avanzada.',
    };
  }

  return {
    silhouette: 'Expandida',
    cluster: 'Cluster 7: Harmonious High-Achievers',
    status: 'Excelencia',
    description: 'Ciclo virtuoso de valor, bienestar y baja fricción.',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    color: '#a855f7',
    speakerNote: 'Madurez máxima. Operan como benchmark de resiliencia y orquestación.',
  };
}

export function calculateAverage(answers) {
  const values = Object.values(answers).map(Number);
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Number((sum / QUESTIONS.length).toFixed(2));
}

export function aggregateResponses(responses) {
  if (!responses.length) {
    return {
      radarData: QUESTIONS.map((question) => ({
        id: question.id,
        subject: question.shortLabel,
        fullCategory: question.category,
        Promedio: 0,
        Benchmark: 4.5,
      })),
      overallAverage: 0,
      totalParticipants: 0,
      archetype: getArchetypeInfo(0),
    };
  }

  const sums = Object.fromEntries(QUESTIONS.map((question) => [question.id, 0]));
  let total = 0;

  responses.forEach((response) => {
    QUESTIONS.forEach((question) => {
      const value = Number(response.answers?.[question.id] ?? response.answers?.[String(question.id)] ?? 0);
      sums[question.id] += value;
      total += value;
    });
  });

  const count = responses.length;
  const radarData = QUESTIONS.map((question) => ({
    id: question.id,
    subject: question.shortLabel,
    fullCategory: question.category,
    Promedio: Number((sums[question.id] / count).toFixed(2)),
    Benchmark: 4.5,
  }));

  const overallAverage = Number((total / (count * QUESTIONS.length)).toFixed(2));

  return {
    radarData,
    overallAverage,
    totalParticipants: count,
    archetype: getArchetypeInfo(overallAverage),
  };
}

export function generateSimulatedResponses(count = 18) {
  return Array.from({ length: count }, (_, index) => {
    const answers = Object.fromEntries(
      QUESTIONS.map((question) => [question.id, Math.floor(Math.random() * 3) + (question.id % 2 === 0 ? 1 : 2)])
    );

    return {
      id: `seed-${index + 1}`,
      session_id: `seed-session-${index + 1}`,
      name: `${SAMPLE_NAMES[index % SAMPLE_NAMES.length]} #${index + 1}`,
      email: `asistente${index + 1}@evento-demo.com`,
      answers,
      average_score: calculateAverage(answers),
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 45).toISOString(),
    };
  });
}

export function buildQrUrl(targetUrl) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(targetUrl)}`;
}

export function getBaseUrl() {
  return import.meta.env.VITE_APP_BASE_URL || window.location.origin;
}

export function getRouteMode(pathname) {
  if (pathname === '/speaker') return 'speaker';
  if (pathname === '/qr') return 'qr';
  return 'attendee';
}