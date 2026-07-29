import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { 
  Users, QrCode, Monitor, Smartphone, Play, RefreshCw, Download, 
  CheckCircle2, ArrowRight, Shield, Database, Cpu, Layers, 
  Sparkles, Award, BarChart3, AlertTriangle, Zap, ChevronRight, UserCheck
} from 'lucide-react';

// Question dataset verbatim from DORA 2025 specification provided
const QUESTIONS = [
  {
    id: 1,
    category: "Postura Org. IA",
    shortLabel: "1. Postura IA",
    title: "1. Postura Organizacional sobre la IA",
    question: "¿Qué tan clara es la política de tu empresa sobre el uso de la IA?",
    options: [
      { val: 1, text: "(1) No existe política ni orientación oficial." },
      { val: 2, text: "(2) Hay rumores de una política, pero nadie la conoce con claridad." },
      { val: 3, text: "(3) Existe un documento, pero su aplicación es ambigua o inconsistente." },
      { val: 4, text: "(4) La política es clara y guía la mayoría de nuestros experimentos." },
      { val: 5, text: "(5) La postura es cristalina, comunicada y fomenta activamente la innovación segura." }
    ]
  },
  {
    id: 2,
    category: "Salud de Datos",
    shortLabel: "2. Salud Datos",
    title: "2. Salud del Ecosistema de Datos",
    question: "¿Cómo es la calidad y accesibilidad de tus datos internos?",
    options: [
      { val: 1, text: "(1) Los datos son de baja calidad y están totalmente aislados en silos." },
      { val: 2, text: "(2) Los datos existen, pero acceder a ellos es un proceso lento y manual." },
      { val: 3, text: "(3) Calidad aceptable, pero la unificación entre departamentos es inconsistente." },
      { val: 4, text: "(4) Datos de alta calidad, unificados y fácilmente accesibles para la mayoría." },
      { val: 5, text: "(5) Ecosistema de datos excelente, unificado y listo para consumo inmediato de la IA." }
    ]
  },
  {
    id: 3,
    category: "Accesibilidad Contexto",
    shortLabel: "3. Contexto IA",
    title: "3. Accesibilidad de Datos para la IA (Contexto)",
    question: "¿Con qué frecuencia usas datos internos de la empresa en tus prompts/agentes?",
    options: [
      { val: 1, text: "(1) Nunca; usamos la IA solo con información general de internet." },
      { val: 2, text: "(2) Rara vez; el proceso de dar contexto interno es muy complejo." },
      { val: 3, text: "(3) A veces; inyectamos contexto de forma manual y artesanal." },
      { val: 4, text: "(4) Casi siempre; las herramientas están conectadas a fuentes de datos clave." },
      { val: 5, text: "(5) Siempre; la IA opera con contexto rico y tiempo real de la organización." }
    ]
  },
  {
    id: 4,
    category: "Lotes Pequeños",
    shortLabel: "4. Lotes Pqs.",
    title: "4. Trabajo en Lotes Pequeños (Small Batches)",
    question: "¿Cómo se divide y entrega el trabajo asistido por IA?",
    options: [
      { val: 1, text: "(1) Entregas masivas y poco frecuentes (meses)." },
      { val: 2, text: "(2) Lotes grandes con dependencias complejas entre equipos." },
      { val: 3, text: "(3) Entregas moderadas; algunas tareas se dividen bien, otras no." },
      { val: 4, text: "(4) Trabajo fluido en unidades pequeñas que se completan en pocos días." },
      { val: 5, text: "(5) Lotes mínimos; realizamos múltiples despliegues exitosos al día." }
    ]
  },
  {
    id: 5,
    category: "Enfoque Usuario",
    shortLabel: "5. Usuario",
    title: "5. Enfoque Centrado en el Usuario",
    question: "¿Cuál es la prioridad al desarrollar soluciones con IA?",
    options: [
      { val: 1, text: "(1) La tecnología por sí misma; no tenemos métricas de usuario." },
      { val: 2, text: "(2) Cumplir con requerimientos técnicos internos principalmente." },
      { val: 3, text: "(3) Equilibrio entre necesidades técnicas y feedback ocasional del usuario." },
      { val: 4, text: "(4) La experiencia del usuario guía la mayoría de nuestras decisiones de IA." },
      { val: 5, text: "(5) El valor para el usuario final es nuestra brújula absoluta (North Star)." }
    ]
  },
  {
    id: 6,
    category: "Plataforma Interna",
    shortLabel: "6. Plataforma",
    title: "6. Calidad de la Plataforma Interna",
    question: "¿Tu plataforma oculta la complejidad y ofrece autoservicio?",
    options: [
      { val: 1, text: "(1) No hay plataforma; cada tarea requiere intervención manual de TI." },
      { val: 2, text: "(2) Hay herramientas básicas, pero la fricción operativa es muy alta." },
      { val: 3, text: "(3) Plataforma funcional, pero requiere mucho soporte para tareas complejas." },
      { val: 4, text: "(4) Ofrece buenas funciones de autoservicio y automatización confiable." },
      { val: 5, text: "(5) La plataforma es un multiplicador de fuerzas; autonomía total del equipo." }
    ]
  },
  {
    id: 7,
    category: "Versiones y Resiliencia",
    shortLabel: "7. Resiliencia",
    title: "7. Control de Versiones y Resiliencia",
    question: "¿Qué tan rápido pueden revertir un cambio si la IA genera código inestable?",
    options: [
      { val: 1, text: "(1) Imposible revertir rápido; las fallas causan crisis prolongadas." },
      { val: 2, text: "(2) Proceso de reversión lento y manual que toma horas o días." },
      { val: 3, text: "(3) Podemos revertir, pero el proceso es estresante y poco frecuente." },
      { val: 4, text: "(4) Prácticas sólidas; reversión rápida (rollbacks) en minutos." },
      { val: 5, text: "(5) Resiliencia total; infraestructura inmutable y reversión automática." }
    ]
  }
];

// Returns Archetype, Silhouette type, and DORA cluster details from average score
const getArchetypeInfo = (avg) => {
  if (avg <= 1.8) {
    return {
      silhouette: 'Contraída',
      cluster: 'Cluster 1: Foundational Challenges',
      status: 'Supervivencia',
      description: 'Agujeros profundos en procesos y estabilidad.',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      color: '#f43f5e',
      speakerNote: 'ALERTA: La IA funcionará como un "espejo del caos", magnificando las disfunciones existentes. Iniciar obligatoriamente por la Fase de Estabilización (3-6 meses) antes de intentar orquestar agentes autónomos.'
    };
  } else if (avg <= 2.5) {
    return {
      silhouette: 'Contraída',
      cluster: 'Cluster 2: Legacy Bottleneck',
      status: 'Reactividad',
      description: 'Sistemas inestables dictan el trabajo; alta deuda técnica.',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      color: '#f59e0b',
      speakerNote: 'ALERTA: Alta reactividad y deuda técnica. Priorizar saneamiento de datos y estandarización del control de versiones.'
    };
  } else if (avg <= 3.2) {
    return {
      silhouette: 'Irregular',
      cluster: 'Cluster 3: Constrained by Process',
      status: 'Fricción',
      description: 'Estables pero frenados por burocracia rígida y silos.',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      color: '#eab308',
      speakerNote: 'Procesos rígidos limitan el impacto de la IA. Enfocar en autonomía de plataforma y reducción del tamaño de lotes.'
    };
  } else if (avg <= 3.9) {
    return {
      silhouette: 'Irregular',
      cluster: 'Cluster 4 & 5: High Impact / Methodical',
      status: 'Transición',
      description: 'Buen trabajo pero lento o con picos de estrés operativo.',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      color: '#3b82f6',
      speakerNote: 'Transición activa. Promover el contexto enriquecido para IA y la resiliencia en entregas automatizadas.'
    };
  } else if (avg <= 4.5) {
    return {
      silhouette: 'Expandida',
      cluster: 'Cluster 6: Pragmatic Performers',
      status: 'Alto Rendimiento',
      description: 'Gran velocidad y estabilidad técnica general.',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      color: '#10b981',
      speakerNote: 'Equipo listo para Orquestación Agéntica Avanzada. Escalar pilotos exitosos y autonomía multi-agente.'
    };
  } else {
    return {
      silhouette: 'Expandida',
      cluster: 'Cluster 7: Harmonious High-Achievers',
      status: 'Excelencia',
      description: 'Ciclo virtuoso de valor, bienestar y baja fricción.',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      color: '#a855f7',
      speakerNote: 'Madurez Máxima. El equipo opera como benchmark global en orquestación agéntica y resiliencia.'
    };
  }
};

export default function App() {
  const [currentMode, setCurrentMode] = useState('attendee'); // 'attendee', 'speaker', 'qr'
  const [attendeesResponses, setAttendeesResponses] = useState([]);
  
  // Form State for Participant
  const [participantInfo, setParticipantInfo] = useState({ name: '', email: '' });
  const [answers, setAnswers] = useState({});
  const [currentQuestionStep, setCurrentQuestionStep] = useState(0);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Initialize with simulated sample cohort data for presentation preview
  useEffect(() => {
    const stored = localStorage.getItem('dora_vsm_responses');
    if (stored) {
      try {
        setAttendeesResponses(JSON.parse(stored));
      } catch (e) {
        generateInitialSimulatedData();
      }
    } else {
      generateInitialSimulatedData();
    }
  }, []);

  // Save changes to localStorage for broadcast simulation
  const updateResponsesState = (newResponses) => {
    setAttendeesResponses(newResponses);
    localStorage.setItem('dora_vsm_responses', JSON.stringify(newResponses));
  };

  const generateInitialSimulatedData = () => {
    const sampleNames = ['María González', 'Carlos Rodríguez', 'Ana Silva', 'Diego Morales', 'Laura Pérez', 'Felipe Castro', 'Sofia Gomez', 'Javier Fernandez', 'Elena Torres', 'Gabriel Rojas'];
    const initialData = [];
    
    // Create 45 diverse realistic initial entries
    for (let i = 0; i < 45; i++) {
      const qAnswers = {
        1: Math.floor(Math.random() * 3) + 2, // 2-4
        2: Math.floor(Math.random() * 3) + 1, // 1-3
        3: Math.floor(Math.random() * 3) + 2, // 2-4
        4: Math.floor(Math.random() * 3) + 2, // 2-4
        5: Math.floor(Math.random() * 4) + 2, // 2-5
        6: Math.floor(Math.random() * 3) + 1, // 1-3
        7: Math.floor(Math.random() * 3) + 2  // 2-4
      };
      
      const sum = Object.values(qAnswers).reduce((a, b) => a + b, 0);
      const avg = parseFloat((sum / 7).toFixed(2));
      
      initialData.push({
        id: 'user_' + i,
        name: sampleNames[i % sampleNames.length] + ` #${i+1}`,
        email: `asistente${i+1}@pmi2026.org`,
        answers: qAnswers,
        averageScore: avg,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString()
      });
    }
    
    updateResponsesState(initialData);
  };

  // Add 5 more simulated entries to show live update during demo
  const addSimulatedBatch = (count = 5) => {
    const updated = [...attendeesResponses];
    for (let i = 0; i < count; i++) {
      const qAnswers = {
        1: Math.floor(Math.random() * 5) + 1,
        2: Math.floor(Math.random() * 5) + 1,
        3: Math.floor(Math.random() * 5) + 1,
        4: Math.floor(Math.random() * 5) + 1,
        5: Math.floor(Math.random() * 5) + 1,
        6: Math.floor(Math.random() * 5) + 1,
        7: Math.floor(Math.random() * 5) + 1
      };
      const sum = Object.values(qAnswers).reduce((a, b) => a + b, 0);
      const avg = parseFloat((sum / 7).toFixed(2));
      updated.push({
        id: 'sim_' + Date.now() + '_' + i,
        name: `Asistente Envío Vivo #${updated.length + 1}`,
        email: `envio.envivo${updated.length + 1}@pmi.org`,
        answers: qAnswers,
        averageScore: avg,
        timestamp: new Date().toISOString()
      });
    }
    updateResponsesState(updated);
  };

  const clearAllResponses = () => {
    updateResponsesState([]);
    setSubmittedResult(null);
  };

  const aggregatedData = useMemo(() => {
    if (attendeesResponses.length === 0) {
      return {
        radarData: QUESTIONS.map(q => ({
          subject: q.shortLabel,
          fullCategory: q.category,
          Promedio: 0,
          benchmark: 4.5
        })),
        overallAverage: 0,
        totalParticipants: 0,
        archetype: getArchetypeInfo(0)
      };
    }

    const categorySums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    let totalSum = 0;

    attendeesResponses.forEach(resp => {
      Object.entries(resp.answers).forEach(([qId, val]) => {
        categorySums[qId] = (categorySums[qId] || 0) + val;
        totalSum += val;
      });
    });

    const count = attendeesResponses.length;
    const overallAvg = parseFloat((totalSum / (count * 7)).toFixed(2));

    const radar = QUESTIONS.map(q => {
      const avgVal = parseFloat((categorySums[q.id] / count).toFixed(2));
      return {
        id: q.id,
        subject: q.shortLabel,
        fullCategory: q.category,
        Promedio: avgVal,
        Benchmark: 4.5 // Benchmark target for high performance
      };
    });

    return {
      radarData: radar,
      overallAverage: overallAvg,
      totalParticipants: count,
      archetype: getArchetypeInfo(overallAvg)
    };
  }, [attendeesResponses]);

  // Handle Form Submission from Attendee
  const handleAttendeeSubmit = (e) => {
    e.preventDefault();
    if (!participantInfo.name || !participantInfo.email) {
      alert("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    if (Object.keys(answers).length < 7) {
      alert("Por favor responde a todas las 7 preguntas del cuestionario.");
      return;
    }

    const sum = Object.values(answers).reduce((a, b) => a + Number(b), 0);
    const avg = parseFloat((sum / 7).toFixed(2));

    const newResponse = {
      id: 'resp_' + Date.now(),
      name: participantInfo.name,
      email: participantInfo.email,
      answers: answers,
      averageScore: avg,
      timestamp: new Date().toISOString()
    };

    const newResponsesList = [...attendeesResponses, newResponse];
    updateResponsesState(newResponsesList);

    setSubmittedResult({
      name: participantInfo.name,
      avg: avg,
      answers: answers,
      archetype: getArchetypeInfo(avg)
    });
  };

  const handleOptionSelect = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    if (currentQuestionStep < 6) {
      setCurrentQuestionStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* GLOBAL TOP NAVIGATION HEADER */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">PMI Latam 2026</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Orquestación Agéntica</span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">Flash VSM: Diagnóstico DORA AI</h1>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentMode('attendee')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium ${
                currentMode === 'attendee' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Vista Asistente (Móvil)
            </button>

            <button
              onClick={() => setCurrentMode('speaker')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium ${
                currentMode === 'speaker' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Vista Speaker (Pantalla Vivo)
            </button>

            <button
              onClick={() => setCurrentMode('qr')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium ${
                currentMode === 'qr' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Código QR Acceso
            </button>
          </div>

        </div>
      </header>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ========================================================= */}
        {/* VIEW 1: ATTENDEE QUESTIONNAIRE (OPTIMIZED FOR SMARTPHONE) */}
        {/* ========================================================= */}
        {currentMode === 'attendee' && (
          <div className="max-w-2xl mx-auto">
            
            {!submittedResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Header info */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Cuestionario Express • 7 Preguntas
                  </div>
                  <h2 className="text-xl font-bold text-white">Evaluación Flash VSM (DORA 2025)</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Ingresa tus datos y responde para descubrir el arquetipo de tu equipo y sincronizar tu resultado con el radar en vivo del escenario.
                  </p>
                </div>

                {/* Step 0: User Registration Data */}
                <form onSubmit={handleAttendeeSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nombre Completo <span className="text-cyan-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Ana María Silva"
                        value={participantInfo.name}
                        onChange={(e) => setParticipantInfo({...participantInfo, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Correo Electrónico <span className="text-cyan-400">*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="ana.silva@empresa.com"
                        value={participantInfo.email}
                        onChange={(e) => setParticipantInfo({...participantInfo, email: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>

                  {/* Question Navigator Steps */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Pregunta {currentQuestionStep + 1} de {QUESTIONS.length}</span>
                      <span className="font-semibold text-cyan-400">
                        {Math.round(((currentQuestionStep + 1) / QUESTIONS.length) * 100)}% Completado
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${((currentQuestionStep + 1) / QUESTIONS.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Active Question Card */}
                    {(() => {
                      const q = QUESTIONS[currentQuestionStep];
                      const selectedVal = answers[q.id];
                      return (
                        <div key={q.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                          <h3 className="text-base font-bold text-white">{q.title}</h3>
                          <p className="text-sm text-slate-300 font-medium">{q.question}</p>

                          <div className="space-y-2 mt-3">
                            {q.options.map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => handleOptionSelect(q.id, opt.val)}
                                className={`w-full text-left p-3 rounded-lg text-xs sm:text-sm border transition flex items-start justify-between gap-3 ${
                                  selectedVal === opt.val 
                                    ? 'bg-cyan-500/20 border-cyan-500 text-white font-medium shadow-sm' 
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {selectedVal === opt.val && (
                                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={currentQuestionStep === 0}
                        onClick={() => setCurrentQuestionStep(prev => prev - 1)}
                        className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                      >
                        Anterior
                      </button>

                      {currentQuestionStep < QUESTIONS.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionStep(prev => prev + 1)}
                          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1"
                        >
                          Siguiente <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                        >
                          <SendIcon /> Enviar Diagnóstico en Vivo
                        </button>
                      )}
                    </div>

                  </div>

                </form>

              </div>
            ) : (
              /* ATTENDEE PERSONAL RESULT CARD */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">¡Diagnóstico Registrado!</h2>
                  <p className="text-xs text-slate-400">Gracias, <span className="text-white font-semibold">{submittedResult.name}</span>. Tus respuestas se incorporaron al radar general.</p>
                </div>

                {/* Score Summary Box */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center space-y-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Tu Puntaje Promedio</span>
                  <div className="text-4xl font-extrabold text-cyan-400">{submittedResult.avg} <span className="text-sm font-normal text-slate-500">/ 5.0</span></div>
                  
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${submittedResult.archetype.badgeBg}`}>
                      Silueta: {submittedResult.archetype.silhouette}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${submittedResult.archetype.badgeBg}`}>
                      Estado: {submittedResult.archetype.status}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-white pt-2 border-t border-slate-800">
                    {submittedResult.archetype.cluster}
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    "{submittedResult.archetype.description}"
                  </p>
                </div>

                {/* Personal Radar Chart */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 text-center uppercase tracking-wider">Tu Silueta de Capacidades</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={QUESTIONS.map(q => ({
                        subject: q.shortLabel,
                        Puntaje: submittedResult.answers[q.id] || 0
                      }))}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" />
                        <Radar name="Mi Equipo" dataKey="Puntaje" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSubmittedResult(null);
                    setAnswers({});
                    setCurrentQuestionStep(0);
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  Realizar otro diagnóstico
                </button>

              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SPEAKER STAGE VIEW (FOR MAIN PROJECTION SCREEN)   */}
        {/* ========================================================= */}
        {currentMode === 'speaker' && (
          <div className="space-y-6">
            
            {/* Speaker Dashboard Control Header */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total de Respuestas en Tiempo Real</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    {aggregatedData.totalParticipants} Asistentes
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      En vivo
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Speaker / Demo */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => addSimulatedBatch(5)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  +5 Respuestas de Prueba
                </button>

                <button
                  onClick={clearAllResponses}
                  className="px-3 py-2 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reiniciar Conteo
                </button>
              </div>
            </div>

            {/* Main Speaker Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: THE RADAR CHART (PRIMARY PROJECTION VISUAL) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Silueta de Madurez DORA 2025 de la Audiencia
                    </h2>
                    <span className="text-xs text-slate-400">7 Capacidades Flash VSM</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Proyección consolidada de las 7 capacidades medidas en escala 1.0 a 5.0.
                  </p>
                </div>

                {/* RADAR CHART COMPONENT */}
                <div className="h-[380px] w-full my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={aggregatedData.radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        stroke="#cbd5e1" 
                        tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 600 }} 
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" />
                      
                      {/* Actual Audience Radar */}
                      <Radar 
                        name="Audiencia PMI" 
                        dataKey="Promedio" 
                        stroke="#06b6d4" 
                        fill="#06b6d4" 
                        fillOpacity={0.5} 
                      />

                      {/* Benchmark High Performer Line */}
                      <Radar 
                        name="Target Excelencia (4.5)" 
                        dataKey="Benchmark" 
                        stroke="#38bdf8" 
                        strokeDasharray="4 4"
                        fill="transparent" 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-cyan-500/60 border border-cyan-400 inline-block"></span>
                    <span>Promedio Audiencia PMI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-0.5 bg-sky-400 border-t border-dashed border-sky-400 inline-block"></span>
                    <span>Benchmark Alto Rendimiento (4.5)</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DIAGNOSIS, SILHOUETTE & SPEAKER STRATEGIC GUIDELINES */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                
                {/* Result Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Diagnóstico Consolidado
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-4xl font-black text-cyan-400">
                        {aggregatedData.overallAverage}
                        <span className="text-sm font-normal text-slate-500"> / 5.0</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Promedio General de la Sala</div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${aggregatedData.archetype.badgeBg}`}>
                        Silueta {aggregatedData.archetype.silhouette}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400">Arquetipo Predominante:</div>
                    <div className="text-sm font-bold text-white">
                      {aggregatedData.archetype.cluster}
                    </div>
                    <div className="text-xs text-cyan-300 font-medium">
                      Estado: {aggregatedData.archetype.status} — {aggregatedData.archetype.description}
                    </div>
                  </div>

                  {/* Speaker Key Takeaway / Strategic Note */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Mensaje Clave para el Speaker (Slide 9)
                    </div>
                    <p className="leading-relaxed">
                      {aggregatedData.archetype.speakerNote}
                    </p>
                  </div>
                </div>

                {/* Score Breakdown per Capability */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Desglose por Capacidad (1.0 - 5.0)
                  </h3>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={aggregatedData.radarData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <XAxis type="number" domain={[0, 5]} stroke="#475569" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="subject" stroke="#cbd5e1" tick={{ fontSize: 10 }} width={75} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                        />
                        <Bar dataKey="Promedio" radius={[0, 4, 4, 0]}>
                          {aggregatedData.radarData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.Promedio < 2.5 ? '#f43f5e' : entry.Promedio < 3.5 ? '#f59e0b' : '#06b6d4'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: QR ACCESS DISPLAY (FOR MAIN STAGE SLIDE)          */}
        {/* ========================================================= */}
        {currentMode === 'qr' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl my-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold rounded-full">
                Congreso PMI Latam 2026
              </span>
              <h2 className="text-2xl font-black text-white">Únete al Diagnóstico en Vivo</h2>
              <p className="text-xs text-slate-400">
                Escanea el código con la cámara de tu teléfono para ingresar tus respuestas.
              </p>
            </div>

            {/* Generated QR Code SVG Placeholder */}
            <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl border-4 border-cyan-500/30">
              <svg className="w-56 h-56 text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2,2H10V10H2V2M4,4V8H8V4H4M11,2H13V4H11V2M14,2H22V10H14V2M16,4V8H20V4H16M2,14H10V22H2V14M4,16V20H8V16H4M11,6H13V8H11V6M11,10H13V12H11V10M13,8H14V10H13V8M11,14H13V16H11V14M13,12H15V14H13V12M14,14H16V16H14V14M16,11H18V13H16V11M18,10H20V11H18V10M19,13H21V15H19V13M11,18H13V20H11V18M13,16H14V18H13V16M14,18H16V20H14V18M16,16H18V18H16V16M18,16H20V18H18V16M18,20H20V22H18V20M20,18H22V20H20V18M20,13H22V15H20V13M16,13H18V14H16V13Z" />
              </svg>
            </div>

            <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              <div>URL Directa para Asistentes:</div>
              <div className="text-cyan-400 font-bold text-sm">https://pmi2026.app/dora-flash-vsm</div>
            </div>

            <button
              onClick={() => setCurrentMode('speaker')}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20"
            >
              Ir a Pantalla del Speaker (Ver Radar)
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-3 text-center text-xs text-slate-500">
        Congreso PMI Latam 2026 • Sesión "Orquestación agéntica estable" • Basado en reporte DORA AI 2025
      </footer>

    </div>
  );
}

// Icon helper
function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}