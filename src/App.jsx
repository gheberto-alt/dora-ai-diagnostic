import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
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
import { clearResponses, createResponse, getSessionId, listResponses, subscribeToResponses } from './lib/storage';
import { isSupabaseConfigured } from './lib/supabase';
import { aggregateResponses, calculateAverage, getArchetypeInfo, getRouteMode } from './utils';

export default function App() {
  const [mode, setMode] = useState(getRouteMode(window.location.pathname));
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendeeStage, setAttendeeStage] = useState('identity');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  const [participantInfo, setParticipantInfo] = useState({ name: '', email: '' });
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [submittedResult, setSubmittedResult] = useState(null);

  const aggregated = useMemo(() => aggregateResponses(responses), [responses]);
  const question = QUESTIONS[step];
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
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const submitAssessment = async (event) => {
    event.preventDefault();
    setError('');
    if (Object.keys(answers).length !== QUESTIONS.length) return setError('Responde las 7 preguntas antes de enviar.');

    const average = calculateAverage(answers);
    const payload = {
      session_id: getSessionId(),
      name: participantInfo.name.trim() || 'Sin nombre',
      email: participantInfo.email.trim().toLowerCase() || 'sin-correo@no-proporcionado.local',
      answers,
      average_score: average,
    };

    try {
      await createResponse(payload);
      setSubmittedResult({ name: payload.name, avg: average, answers, archetype: getArchetypeInfo(average) });
      setAttendeeStage('identity');
      setParticipantInfo({ name: '', email: '' });
      setAnswers({});
      setStep(0);
    } catch (err) {
      setError(err.message || 'No fue posible guardar la respuesta.');
    }
  };

  const resetAll = async () => {
    if (!window.confirm('¿Seguro que quieres reiniciar las respuestas?')) return;
    try {
      await clearResponses();
      setSubmittedResult(null);
    } catch (err) {
      setError(err.message || 'No fue posible reiniciar el conteo.');
    }
  };

  return (
    <div className={`${mode === 'speaker' ? 'min-h-screen bg-slate-950 text-slate-100 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden' : 'min-h-screen bg-slate-950 text-slate-100'}`}>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className={`mx-auto flex max-w-7xl items-center justify-between ${mode === 'attendee' ? 'gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5' : 'gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3'}`}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-2"><Zap className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold uppercase tracking-[0.2em] text-cyan-400">PMI Latam 2026</span>
                {mode !== 'speaker' && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">DORA AI 2025</span>
                  </>
                )}
              </div>
              <h1 className="text-base font-bold text-white sm:text-lg">{mode === 'speaker' ? 'Dashboard Speaker' : 'Diagnóstico DORA AI'}</h1>
            </div>
          </div>
          {mode === 'speaker' && (
            <button onClick={resetAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:text-rose-300"><RefreshCw className="h-4 w-4" />Reiniciar conteo</button>
          )}
        </div>
      </header>

      <main className={`mx-auto w-full max-w-7xl ${mode === 'attendee' ? 'px-2 py-2 sm:px-4 sm:py-4 lg:px-8 lg:py-6' : 'px-4 py-4 lg:flex-1 lg:min-h-0 lg:px-5 lg:py-3 xl:px-6 xl:py-4'} ${mode === 'speaker' ? 'lg:overflow-hidden' : ''}`}>
        <section className={`rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/30 ${mode === 'attendee' ? 'p-3 sm:p-4' : 'p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden lg:p-4 xl:p-4'}`}>
          {loading && <Notice kind="info">Cargando respuestas y preparando sincronización…</Notice>}
          {!loading && error && <Notice kind="error">{error}</Notice>}

          {mode === 'attendee' && (
            submittedResult ? (
              <div className="space-y-3 sm:space-y-5">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">¡Diagnóstico registrado!</h3>
                  <p className="mt-1 text-sm text-slate-400">Gracias, <span className="font-semibold text-white">{submittedResult.name}</span>. Tu respuesta ya está en el radar general.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center sm:p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tu puntaje promedio</p>
                  <div className="mt-2 text-5xl font-black text-cyan-400">{submittedResult.avg}</div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Badge className={submittedResult.archetype.badgeBg}>Silueta: {submittedResult.archetype.silhouette}</Badge>
                    <Badge className={submittedResult.archetype.badgeBg}>Estado: {submittedResult.archetype.status}</Badge>
                  </div>
                  <p className="mt-3 font-semibold text-white">{submittedResult.archetype.cluster}</p>
                  <p className="mt-1 text-sm text-slate-400">{submittedResult.archetype.description}</p>
                </div>
                <div className="h-64 rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:h-72 sm:p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={QUESTIONS.map((q) => ({ subject: q.shortLabel, Puntaje: submittedResult.answers[q.id] || 0 }))}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" />
                      <Radar dataKey="Puntaje" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.45} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <button onClick={() => setSubmittedResult(null)} className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700">Realizar otro diagnóstico</button>
              </div>
            ) : (
              <form onSubmit={submitAssessment} className="space-y-3 sm:space-y-6">
                {attendeeStage === 'identity' ? (
                  <>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-5">
                      <h3 className="text-lg font-bold text-white">Antes de comenzar</h3>
                      <p className="mt-1 text-sm text-slate-300">Déjanos tus datos si quieres y luego pasarás al cuestionario.</p>
                      <div className="mt-3 grid gap-2.5 sm:mt-5 sm:gap-4 sm:grid-cols-2">
                        <Field label="Nombre completo (opcional)"><input type="text" value={participantInfo.name} onChange={(e) => setParticipantInfo((p) => ({ ...p, name: e.target.value }))} placeholder="Ej. Ana María Silva" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500 sm:py-2.5" /></Field>
                        <Field label="Correo electrónico (opcional)"><input type="email" value={participantInfo.email} onChange={(e) => setParticipantInfo((p) => ({ ...p, email: e.target.value }))} placeholder="ana@empresa.com" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500 sm:py-2.5" /></Field>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setAttendeeStage('questions');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-700"
                      >
                        Continuar <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400"><span>Pregunta {step + 1} de {QUESTIONS.length}</span><span className="font-semibold text-cyan-400">{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full border border-slate-800 bg-slate-950 sm:h-2"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-5">
                      <h3 className="text-base font-bold text-white sm:text-lg">{question.title}</h3>
                      <p className="mt-1.5 text-sm text-slate-300 sm:mt-2">{question.question}</p>
                      <div className="mt-2.5 space-y-1.5 sm:mt-4 sm:space-y-2">
                        {question.options.map((option) => (
                          <button key={option.val} type="button" onClick={() => setAnswers((p) => ({ ...p, [question.id]: option.val }))} className={`flex w-full items-start justify-between gap-2 rounded-xl border px-2.5 py-2 text-left text-[13px] leading-snug transition sm:gap-3 sm:px-3 sm:py-3 sm:text-sm ${answers[question.id] === option.val ? 'border-cyan-500 bg-cyan-500/15 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'}`}>
                            <span>{option.text}</span>
                            {answers[question.id] === option.val && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (step === 0) {
                            setAttendeeStage('identity');
                            return;
                          }
                          setStep((s) => Math.max(0, s - 1));
                        }}
                        className="rounded-xl px-4 py-2.5 text-sm text-slate-400"
                      >
                        Anterior
                      </button>
                      {step < QUESTIONS.length - 1 ? (
                        <button type="button" disabled={!answers[question.id]} onClick={() => setStep((s) => Math.min(QUESTIONS.length - 1, s + 1))} className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Continuar <ChevronRight className="h-4 w-4" /></button>
                      ) : (
                        <button type="submit" disabled={!answers[question.id]} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Enviar diagnóstico</button>
                      )}
                    </div>
                  </>
                )}
              </form>
            )
          )}

          {mode === 'speaker' && (
            <div className="space-y-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 lg:shrink-0 lg:p-3">
                <div className="flex items-center gap-2.5"><div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-1.5 text-cyan-400"><Users className="h-4.5 w-4.5" /></div><div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Respuestas en tiempo real</div><div className="text-xl font-black text-white lg:text-2xl">{aggregated.totalParticipants} <span className="text-xs font-medium text-slate-400 lg:text-sm">participantes</span></div></div></div>
              </div>
              <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.55fr_0.88fr] lg:gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 lg:flex lg:min-h-0 lg:flex-col lg:p-4 xl:p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-bold"><BarChart3 className="h-5 w-5 text-cyan-400" />Silueta consolidada de la audiencia</h3>
                  <p className="text-sm text-slate-400">Promedio por capacidad comparado con benchmark 4.5.</p>
                  <div className="mt-3 h-[420px] w-full sm:h-[520px] lg:min-h-0 lg:flex-1"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="52%" outerRadius="78%" data={aggregated.radarData}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" stroke="#cbd5e1" tick={speakerRadarTick} /><PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" /><Radar dataKey="Promedio" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.48} /><Radar dataKey="Benchmark" stroke="#38bdf8" strokeDasharray="4 4" fill="transparent" /></RadarChart></ResponsiveContainer></div>
                </div>
                <div className="space-y-3.5 lg:flex lg:min-h-0 lg:flex-col lg:space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 lg:flex lg:min-h-0 lg:flex-[1.2] lg:flex-col lg:p-3.5 xl:p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Diagnóstico consolidado</div>
                    <div className="mt-2 flex items-end justify-between gap-3"><div><div className="text-4xl font-black text-cyan-400 lg:text-5xl">{aggregated.overallAverage}</div><div className="text-sm text-slate-400">promedio general</div></div><Badge className={aggregated.archetype.badgeBg}>Silueta {aggregated.archetype.silhouette}</Badge></div>
                    <div className="mt-2.5 rounded-2xl border border-slate-800 bg-slate-900 p-3 lg:p-3.5"><p className="text-xs text-slate-400">Arquetipo predominante</p><p className="mt-1 font-bold text-white">{aggregated.archetype.cluster}</p><p className="mt-1 text-sm text-cyan-300">Estado: {aggregated.archetype.status}</p><p className="mt-1 text-sm text-slate-400">{aggregated.archetype.description}</p></div>
                    <div className="mt-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-[13px] leading-snug text-amber-100 lg:flex-1 lg:p-3.5 lg:text-sm"><div className="mb-1.5 flex items-center gap-2 font-bold text-amber-300"><AlertTriangle className="h-4 w-4" />Mensaje clave</div><div className="whitespace-normal break-words">{aggregated.archetype.speakerNote}</div></div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 lg:flex lg:min-h-0 lg:flex-[0.8] lg:flex-col lg:p-3.5 xl:p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Desglose por capacidad</div>
                    <div className="h-52 w-full lg:min-h-0 lg:flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={aggregated.radarData} layout="vertical" margin={{ left: 20, right: 12 }}><XAxis type="number" domain={[0, 5]} stroke="#475569" tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="subject" stroke="#cbd5e1" tick={{ fontSize: 10 }} width={80} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} /><Bar dataKey="Promedio" radius={[0, 4, 4, 0]}>{aggregated.radarData.map((entry) => <Cell key={entry.id} fill={entry.Promedio < 2.5 ? '#f43f5e' : entry.Promedio < 3.5 ? '#f59e0b' : '#06b6d4'} />)}</Bar></BarChart></ResponsiveContainer></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {mode !== 'speaker' && <footer className="border-t border-slate-800 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500">Congreso PMI Latam 2026 • MVP preparado para nube con GitHub</footer>}
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-300">{label}</span>{children}</label>;
}

function Badge({ className, children }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function Notice({ kind, children }) {
  return <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${kind === 'error' ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border border-slate-800 bg-slate-900 text-slate-300'}`}>{children}</div>;
}