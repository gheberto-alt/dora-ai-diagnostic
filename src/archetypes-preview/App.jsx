import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  Users,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { QUESTIONS } from './data';
import { clearResponses, createResponse, getSessionId, listResponses, subscribeToResponses } from './storage';
import { aggregateResponses, calculateAverage, getArchetypeInfo, getRouteMode, normalizeAnswers } from './utils';

// ─── Attendee redesign constants ──────────────────────────────────────────────
const STEP_SIZE = 2; // questions per screen
const TOTAL_STEPS = Math.ceil(QUESTIONS.length / STEP_SIZE);

// ─── Attendee styles (scoped via inline / style tag approach using Tailwind where possible)
// We inject a minimal global style for the gradient background and card design
const AttendeeStyles = () => (
  <style>{`
    .att-page {
      min-height: 100vh;
      background:
        radial-gradient(circle at 15% 20%, rgba(255,98,0,.34), transparent 25%),
        radial-gradient(circle at 85% 10%, rgba(182,98,255,.28), transparent 22%),
        radial-gradient(circle at 70% 85%, rgba(247,44,115,.18), transparent 16%),
        linear-gradient(135deg, #26011f 0%, #4c073d 24%, #600f39 48%, #791835 72%, #fb150c 100%);
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 18px 14px 34px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .att-card {
      width: min(100%, 620px);
      background: rgba(18,9,30,.78);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 28px;
      box-shadow: 0 22px 60px rgba(0,0,0,.32);
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .att-hero {
      padding: 20px 18px 16px;
      border-bottom: 1px solid rgba(255,255,255,.12);
    }
    .att-eyebrow {
      display: inline-flex;
      padding: 8px 12px;
      border-radius: 999px;
      background: linear-gradient(90deg, #f72c73, #b662ff);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: white;
    }
    .att-h1 {
      margin: 14px 0 8px;
      font-size: clamp(22px, 5vw, 30px);
      line-height: 1.08;
      color: white;
      font-weight: 800;
    }
    .att-subcopy {
      margin: 0;
      color: rgba(255,255,255,.76);
      font-size: 14px;
      line-height: 1.55;
    }
    .att-progress-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 18px;
      color: rgba(255,255,255,.76);
      font-size: 12px;
      font-weight: 700;
    }
    .att-progress {
      height: 10px;
      border-radius: 999px;
      background: rgba(255,255,255,.08);
      overflow: hidden;
      margin-top: 8px;
    }
    .att-progress-bar {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #ff6200, #f72c73, #b662ff);
      transition: width .25s ease;
    }
    .att-content {
      padding: 16px 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex: 1;
    }
    .att-step-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      color: rgba(255,255,255,.76);
      font-size: 13px;
      font-weight: 700;
    }
    .att-question {
      padding: 14px;
      border-radius: 18px;
      background: rgba(255,255,255,.045);
      border: 1px solid rgba(255,255,255,.08);
    }
    .att-question-top {
      display: grid;
      grid-template-columns: 36px 1fr;
      gap: 12px;
      align-items: start;
      margin-bottom: 12px;
    }
    .att-index {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 14px;
      color: white;
      background: linear-gradient(135deg, rgba(255,98,0,.25), rgba(247,44,115,.25));
      border: 1px solid rgba(255,255,255,.12);
      flex-shrink: 0;
    }
    .att-q-label {
      font-size: 13px;
      font-weight: 800;
      color: white;
      display: block;
      margin-bottom: 4px;
    }
    .att-q-text {
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255,255,255,.88);
    }
    .att-scale {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 4px;
    }
    .att-scale-btn {
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.92);
      border-radius: 14px;
      padding: 12px 0;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      transition: all .15s;
      font-family: inherit;
    }
    .att-scale-btn:hover {
      background: rgba(255,255,255,.12);
    }
    .att-scale-btn.active {
      background: linear-gradient(180deg, rgba(247,44,115,.95), rgba(182,98,255,.95));
      border-color: transparent;
      color: white;
    }
    .att-nav {
      display: flex;
      gap: 10px;
      margin-top: auto;
      padding-top: 4px;
    }
    .att-btn-secondary {
      flex: 1;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.08);
      color: white;
      border-radius: 18px;
      padding: 14px 16px;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      font-family: inherit;
    }
    .att-btn-primary {
      flex: 2;
      border: 0;
      border-radius: 18px;
      padding: 14px 16px;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      color: white;
      background: linear-gradient(90deg, #ff6200, #f72c73, #b662ff);
      box-shadow: 0 10px 30px rgba(247,44,115,.28);
      font-family: inherit;
      transition: opacity .15s;
    }
    .att-btn-primary:disabled {
      opacity: .55;
      cursor: not-allowed;
      box-shadow: none;
    }
    .att-result-card {
      padding: 16px;
      border-radius: 22px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
    }
    .att-summary-grid {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr 1fr;
    }
    .att-summary-card {
      padding: 16px;
      border-radius: 22px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
    }
    .att-summary-label {
      display: block;
      color: rgba(255,255,255,.76);
      text-transform: uppercase;
      letter-spacing: .08em;
      font-size: 11px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .att-summary-value {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: white;
      margin-bottom: 4px;
      line-height: 1.1;
    }
    .att-summary-sub {
      color: rgba(255,255,255,.65);
      font-size: 12px;
      line-height: 1.4;
    }
    .att-summary-card.full { grid-column: 1 / -1; }
    .att-archetype-name {
      font-size: 18px;
      font-weight: 800;
      color: white;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .att-badge {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .06em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .att-badge.good { background: rgba(80,227,164,.12); color: #50e3a4; }
    .att-badge.warn { background: rgba(255,177,74,.12); color: #ffb14a; }
    .att-badge.bad { background: rgba(255,123,148,.12); color: #ff7b94; }
    .att-scale-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: rgba(255,255,255,.45);
      margin-top: 4px;
      padding: 0 2px;
    }
    @media (min-width: 540px) {
      .att-hero { padding: 24px 22px 18px; }
      .att-content { padding: 18px 18px 22px; }
      .att-summary-grid { grid-template-columns: repeat(3, 1fr); }
      .att-summary-card.full { grid-column: auto; }
    }
  `}</style>
);

function riskLevel(normalizedScores) {
  // Risk factors (4=friction, 5=burnout, 6=instability) after normalization are INVERTED
  // high normalized = low risk. We invert back to get raw risk signal.
  const riskRaw = [4, 5, 6].map((id) => 6 - (normalizedScores[id] || 3));
  const avg = riskRaw.reduce((a, b) => a + b, 0) / 3;
  if (avg >= 3.8) return 'Alto';
  if (avg >= 2.5) return 'Medio';
  return 'Bajo';
}

function narrativeFor(archetype, risk) {
  const name = archetype?.cluster ?? '';
  if (risk === 'Alto') return `La señal principal es de presión operativa alta. Tu lectura se acerca al arquetipo "${name}" y sugiere atender fricción, burnout o inestabilidad antes de acelerar.`;
  if (risk === 'Bajo') return `Tu resultado muestra una base saludable. La lectura se aproxima al arquetipo "${name}" y sugiere que el próximo salto puede venir por más velocidad y foco en valor.`;
  return `Tu equipo muestra una base funcional con oportunidades claras de mejora. La lectura se acerca al arquetipo "${name}" y conviene reducir fricción antes de empujar más throughput.`;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ArchetypesPreviewApp() {
  const [mode, setMode] = useState(getRouteMode(window.location.pathname));
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Attendee state
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0); // block index (0 to TOTAL_STEPS-1), TOTAL_STEPS = results
  const [submittedResult, setSubmittedResult] = useState(null);

  // Speaker state
  const aggregated = useMemo(() => aggregateResponses(responses), [responses]);
  const speakerRadarTick = useMemo(() => {
    if (viewportWidth >= 1280) return { fill: '#e2e8f0', fontSize: 16, fontWeight: 700 };
    if (viewportWidth >= 768) return { fill: '#e2e8f0', fontSize: 14, fontWeight: 700 };
    return { fill: '#e2e8f0', fontSize: 11, fontWeight: 600 };
  }, [viewportWidth]);

  useEffect(() => {
    const onPop = () => setMode(getRouteMode(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await listResponses();
        if (mounted) setResponses(data);
      } catch (err) {
        if (mounted) setError(err.message || 'No fue posible cargar respuestas.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const unsubscribe = subscribeToResponses(load);
    return () => { mounted = false; unsubscribe?.(); };
  }, []);

  // ── Attendee helpers ──────────────────────────────────────────────────────
  const blockQuestions = (blockIndex) =>
    QUESTIONS.slice(blockIndex * STEP_SIZE, blockIndex * STEP_SIZE + STEP_SIZE);

  const currentBlockAnswered = () =>
    blockQuestions(step).every((q) => answers[q.id] != null);

  const allAnswered = () => QUESTIONS.every((q) => answers[q.id] != null);

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      if (!currentBlockAnswered()) return;
      setStep((s) => s + 1);
      return;
    }
    // Last block → submit
    if (!allAnswered()) return;
    setError('');
    const average = calculateAverage(answers);
    const normalized = normalizeAnswers(answers);
    const archetype = getArchetypeInfo(normalized, average);
    const payload = {
      session_id: getSessionId(),
      name: 'Asistente',
      email: 'asistente@diagnostico-dora.local',
      answers,
      average_score: average,
    };
    try {
      await createResponse(payload);
      setSubmittedResult({ avg: average, answers, normalized, archetype });
    } catch (err) {
      setError(err.message || 'No fue posible guardar la respuesta.');
    }
  };

  const handlePrev = () => setStep((s) => Math.max(0, s - 1));

  const resetAll = async () => {
    if (!window.confirm('¿Seguro que quieres reiniciar las respuestas?')) return;
    try {
      await clearResponses();
      setSubmittedResult(null);
      window.location.reload();
    } catch (err) {
      setError(err.message || 'No fue posible reiniciar el conteo.');
    }
  };

  // ── Speaker view ──────────────────────────────────────────────────────────
  if (mode === 'speaker') {
    return (
      <div
        className="min-h-screen text-slate-100 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(255,98,0,.34), transparent 25%), radial-gradient(circle at 85% 10%, rgba(182,98,255,.28), transparent 22%), radial-gradient(circle at 70% 85%, rgba(247,44,115,.18), transparent 16%), linear-gradient(135deg, #26011f 0%, #4c073d 24%, #600f39 48%, #791835 72%, #fb150c 100%)',
        }}
      >
        <header
          className="sticky top-0 z-50 backdrop-blur"
          style={{ borderBottom: '1px solid rgba(255,255,255,.12)', background: 'rgba(18,9,30,.88)' }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl p-2" style={{ background: 'linear-gradient(135deg, #f72c73, #b662ff)' }}><Zap className="h-5 w-5 text-white" /></div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#f72c73' }}>Identificación de arquetipo de equipo</div>
                <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">Diagnóstico D.O.R.A. IA</h1>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
              style={{ border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.85)' }}
            >
              <RefreshCw className="h-4 w-4" />Reiniciar conteo
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-4 lg:flex-1 lg:min-h-0 lg:px-5 lg:py-3 xl:px-6 xl:py-4 lg:overflow-hidden">
          <section
            className="rounded-3xl p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden lg:p-4 xl:p-4"
            style={{ background: 'rgba(18,9,30,.78)', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 22px 60px rgba(0,0,0,.32)', backdropFilter: 'blur(12px)' }}
          >
            {loading && <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(182,98,255,.1)', border: '1px solid rgba(182,98,255,.2)', color: 'rgba(255,255,255,.76)', fontSize: 13, marginBottom: 12 }}>Cargando respuestas y preparando sincronización…</div>}
            {!loading && error && <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(255,123,148,.1)', border: '1px solid rgba(255,123,148,.2)', color: '#ff7b94', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div className="space-y-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 lg:shrink-0 lg:p-3" style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.045)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl p-1.5" style={{ border: '1px solid rgba(247,44,115,.2)', background: 'rgba(247,44,115,.1)', color: '#f72c73' }}><Users className="h-5 w-5" /></div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,.6)' }}>Respuestas en tiempo real</div>
                    <div className="text-xl font-black text-white lg:text-2xl">{aggregated.totalParticipants} <span className="text-xs font-medium lg:text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>participantes</span></div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.55fr_0.88fr] lg:gap-4">
                <div className="rounded-2xl p-4 sm:p-5 lg:flex lg:min-h-0 lg:flex-col lg:p-4 xl:p-4" style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)' }}>
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: 'white' }}><BarChart3 className="h-5 w-5" style={{ color: '#f72c73' }} />Silueta consolidada de la audiencia</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>Todos los ejes en escala 1–5 (más alto = mejor). Fricción, burnout e inestabilidad están invertidos.</p>
                  <div className="mt-3 h-[420px] w-full sm:h-[520px] lg:min-h-0 lg:flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="52%" outerRadius="78%" data={aggregated.radarData}>
                        <PolarGrid gridType="polygon" radialLines stroke="rgba(255,255,255,.1)" />
                        <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,.5)" tick={speakerRadarTick} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} stroke="rgba(255,255,255,.15)" tick={{ fill: 'rgba(255,255,255,.45)', fontSize: 11 }} />
                        <Radar dataKey="Promedio" stroke="#f72c73" fill="#f72c73" fillOpacity={0.35} />
                        <Radar dataKey="Benchmark" stroke="#b662ff" strokeDasharray="4 4" fill="transparent" />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3.5 lg:flex lg:min-h-0 lg:flex-col lg:space-y-3">
                  <div className="rounded-2xl p-3.5 lg:flex lg:min-h-0 lg:flex-[1.2] lg:flex-col lg:p-3.5 xl:p-4" style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)' }}>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,.6)' }}>Diagnóstico consolidado</div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-4xl font-black lg:text-5xl" style={{ color: '#f72c73' }}>{aggregated.overallAverage}</div>
                        <div className="text-sm" style={{ color: 'rgba(255,255,255,.6)' }}>promedio normalizado del equipo</div>
                      </div>
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(247,44,115,.15)', color: '#f72c73', borderColor: 'rgba(247,44,115,.25)' }}>
                        Silueta {aggregated.archetype.silhouette}
                      </span>
                    </div>
                    <div className="mt-2.5 rounded-2xl p-3 lg:p-3.5" style={{ border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.04)' }}>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,.6)' }}>Arquetipo predominante</p>
                      <p className="mt-1 font-bold text-white">{aggregated.archetype.cluster}</p>
                      <p className="mt-1 text-sm" style={{ color: '#b662ff' }}>Estado: {aggregated.archetype.status}</p>
                      <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,.65)' }}>{aggregated.archetype.description}</p>
                    </div>
                    <div className="mt-2.5 rounded-2xl p-3 text-[13px] leading-snug lg:flex-1 lg:p-3.5 lg:text-sm" style={{ border: '1px solid rgba(255,177,74,.2)', background: 'rgba(255,177,74,.08)', color: 'rgba(255,255,255,.85)' }}>
                      <div className="mb-1.5 flex items-center gap-2 font-bold" style={{ color: '#ffb14a' }}><AlertTriangle className="h-4 w-4" />Mensaje clave</div>
                      <div className="whitespace-normal break-words">{aggregated.archetype.speakerNote}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl p-3.5 lg:flex lg:min-h-0 lg:flex-[0.8] lg:flex-col lg:p-3.5 xl:p-4" style={{ border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.04)' }}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,.6)' }}>Desglose por factor</div>
                    <div className="h-52 w-full lg:min-h-0 lg:flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregated.radarData} layout="vertical" margin={{ left: 20, right: 12 }}>
                          <XAxis type="number" domain={[0, 5]} stroke="rgba(255,255,255,.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,.5)' }} />
                          <YAxis type="category" dataKey="subject" stroke="rgba(255,255,255,.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,.7)' }} width={80} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(18,9,30,.95)', borderColor: 'rgba(255,255,255,.12)', borderRadius: '12px', fontSize: '12px' }} formatter={(value) => [value, 'Promedio normalizado']} />
                          <Bar dataKey="Promedio" radius={[0, 4, 4, 0]}>
                            {aggregated.radarData.map((entry) => (
                              <Cell key={entry.id} fill={entry.Promedio >= 4 ? '#50e3a4' : entry.Promedio >= 3 ? '#b662ff' : entry.Promedio >= 2 ? '#ffb14a' : '#ff7b94'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── Attendee view (new design) ────────────────────────────────────────────
  const isResult = submittedResult != null;
  const progress = isResult ? 100 : ((step + 1) / TOTAL_STEPS) * 100;
  const currentBlock = blockQuestions(step);
  const risk = isResult ? riskLevel(submittedResult.normalized) : null;
  const riskBadgeClass = risk === 'Bajo' ? 'good' : risk === 'Alto' ? 'bad' : 'warn';

  return (
    <>
      <AttendeeStyles />
      <div className="att-page">
        <div className="att-card">
          {/* Hero */}
          <header className="att-hero">
            <div className="att-eyebrow">Identificación de arquetipo de equipo</div>
            <h1 className="att-h1">PMI Latam 2026<br />Diagnóstico D.O.R.A. IA</h1>
            <p className="att-subcopy">{isResult ? 'Tu diagnóstico ha sido registrado correctamente.' : '2 factores por pantalla · escala 1 (nunca) a 5 (siempre)'}</p>
            <div className="att-progress-wrap">
              <span>{isResult ? 'Registro completado' : `Paso ${step + 1} de ${TOTAL_STEPS}`}</span>
              <span>{isResult ? '✓' : `Factores ${step * STEP_SIZE + 1}–${Math.min(step * STEP_SIZE + STEP_SIZE, QUESTIONS.length)}`}</span>
            </div>
            <div className="att-progress">
              <span className="att-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </header>

          {/* Content */}
          <div className="att-content">
            {error && <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255,123,148,.12)', color: '#ff7b94', fontSize: '14px' }}>{error}</div>}

            {isResult ? (
              /* ── Result screen ── */
              <>
                <div className="att-result-card">
                  <span className={`att-badge ${riskBadgeClass}`}>Diagnóstico enviado · Riesgo {risk}</span>
                  <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: 'white', fontWeight: 800 }}>¡Diagnóstico registrado!</h2>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,.76)', fontSize: '14px' }}>
                    Gracias. Tu respuesta quedó registrada y ya alimenta la lectura consolidada del radar general.
                  </p>
                </div>

                <div className="att-summary-grid">
                  <div className="att-summary-card">
                    <span className="att-summary-label">Promedio</span>
                    <span className="att-summary-value">{submittedResult.avg}</span>
                    <span className="att-summary-sub">Lectura global normalizada</span>
                  </div>
                  <div className="att-summary-card">
                    <span className="att-summary-label">Riesgo operativo</span>
                    <span className="att-summary-value" style={{ color: risk === 'Alto' ? '#ff7b94' : risk === 'Bajo' ? '#50e3a4' : '#ffb14a' }}>{risk}</span>
                    <span className="att-summary-sub">Fricción · Burnout · Inestabilidad</span>
                  </div>
                  <div className="att-summary-card full">
                    <span className="att-summary-label">Arquetipo</span>
                    <span className="att-summary-value" style={{ fontSize: '18px' }}>{submittedResult.archetype.cluster}</span>
                    <span className="att-summary-sub">{submittedResult.archetype.status} · Silueta {submittedResult.archetype.silhouette}</span>
                  </div>
                </div>

                <div className="att-result-card">
                  <h3 style={{ margin: '0 0 8px', color: 'white', fontSize: '15px', fontWeight: 800 }}>Tu diagnóstico individual</h3>
                  <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,.76)', fontSize: '14px' }}>
                    {narrativeFor(submittedResult.archetype, risk)}
                  </p>
                </div>
              </>
            ) : (
              /* ── Question blocks ── */
              <>
                <div className="att-step-meta">
                  <span>Bloque {step + 1}</span>
                  <span>Factores {step * STEP_SIZE + 1}–{Math.min(step * STEP_SIZE + STEP_SIZE, QUESTIONS.length)}</span>
                </div>

                {currentBlock.map((q, idx) => (
                  <div key={q.id} className="att-question">
                    <div className="att-question-top">
                      <div className="att-index">{step * STEP_SIZE + idx + 1}</div>
                      <div>
                        <span className="att-q-label">{q.category}</span>
                        <span className="att-q-text">{q.question}</span>
                      </div>
                    </div>
                    <div className="att-scale">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          className={`att-scale-btn${answers[q.id] === n ? ' active' : ''}`}
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: n }))}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="att-scale-labels">
                      <span>Nunca</span>
                      <span>Siempre</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Navigation */}
            {!isResult && (
              <div className="att-nav">
                {step > 0 && (
                  <button className="att-btn-secondary" onClick={handlePrev}>Anterior</button>
                )}
                <button
                  className="att-btn-primary"
                  disabled={!currentBlockAnswered()}
                  onClick={handleNext}
                  style={{ flex: step > 0 ? 2 : 1 }}
                >
                  {step === TOTAL_STEPS - 1 ? 'Enviar Diagnóstico' : 'Siguiente'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Badge({ className, children }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function Notice({ kind, children }) {
  return <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${kind === 'error' ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border border-slate-800 bg-slate-900 text-slate-300'}`}>{children}</div>;
}
