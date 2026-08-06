export const PREVIEW_BASE_PATH = '/preview-arquetipos';

export const QUESTIONS = [
  {
    id: 1,
    category: 'Rendimiento del equipo',
    shortLabel: '1. Equipo',
    title: '1. Rendimiento del equipo',
    question: 'Nuestro equipo colabora activamente para resolver problemas complejos sin depender de escalaciones externas.',
    reverseScore: false,
  },
  {
    id: 2,
    category: 'Rendimiento del producto',
    shortLabel: '2. Producto',
    title: '2. Rendimiento del producto',
    question: 'Las funcionalidades que entregamos cumplen consistentemente con necesidades reales de los usuarios.',
    reverseScore: false,
  },
  {
    id: 3,
    category: 'Trabajo valioso',
    shortLabel: '3. Valor',
    title: '3. Trabajo valioso',
    question: 'La mayor parte del trabajo que realizo contribuye directamente a objetivos de negocio o usuario.',
    reverseScore: false,
  },
  {
    id: 4,
    category: 'Fricción',
    shortLabel: '4. Fricción',
    title: '4. Fricción',
    question: 'Necesito atravesar procesos burocráticos o dependencias innecesarias para avanzar en mi trabajo.',
    reverseScore: true,
  },
  {
    id: 5,
    category: 'Burnout',
    shortLabel: '5. Burnout',
    title: '5. Burnout',
    question: 'Me siento mentalmente agotado al final de la jornada laboral.',
    reverseScore: true,
  },
  {
    id: 6,
    category: 'Inestabilidad',
    shortLabel: '6. Inestabilidad',
    title: '6. Inestabilidad',
    question: 'Los cambios en producción generan incidentes o retrabajo frecuentemente.',
    reverseScore: true,
  },
  {
    id: 7,
    category: 'Efectividad individual',
    shortLabel: '7. Efectividad',
    title: '7. Efectividad individual',
    question: 'Tengo claridad sobre qué debo hacer y cómo priorizar mi trabajo.',
    reverseScore: false,
  },
  {
    id: 8,
    category: 'Throughput',
    shortLabel: '8. Throughput',
    title: '8. Throughput',
    question: 'El equipo entrega valor en ciclos cortos (días o pocas semanas).',
    reverseScore: false,
  },
];

export const OPTIONS = [
  { val: 1, text: '(1) Nunca / Muy en desacuerdo' },
  { val: 2, text: '(2) Rara vez' },
  { val: 3, text: '(3) A veces' },
  { val: 4, text: '(4) Frecuentemente' },
  { val: 5, text: '(5) Siempre / Totalmente de acuerdo' },
];

export const SAMPLE_NAMES = [
  'María González',
  'Carlos Rodríguez',
  'Ana Silva',
  'Diego Morales',
  'Laura Pérez',
  'Felipe Castro',
  'Sofía Gómez',
  'Javier Fernández',
];
