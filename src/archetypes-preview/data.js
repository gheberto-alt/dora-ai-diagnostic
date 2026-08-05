export const PREVIEW_BASE_PATH = '/preview-arquetipos';

export const QUESTIONS = [
  {
    id: 1,
    category: 'Rendimiento del equipo',
    shortLabel: '1. Equipo',
    title: '1. Rendimiento del equipo',
    question: 'Mi equipo es altamente efectivo y posee una fuerza colaborativa sólida.',
    reverseScore: false,
  },
  {
    id: 2,
    category: 'Rendimiento del producto',
    shortLabel: '2. Producto',
    title: '2. Rendimiento del producto',
    question: 'Los productos que construimos ayudan a los usuarios a completar tareas importantes de forma segura y con baja latencia.',
    reverseScore: false,
  },
  {
    id: 3,
    category: 'Trabajo valioso',
    shortLabel: '3. Valor',
    title: '3. Trabajo valioso',
    question: 'Dedico la mayor parte de mi tiempo a realizar tareas que considero valiosas y que valen la pena.',
    reverseScore: false,
  },
  {
    id: 4,
    category: 'Fricción',
    shortLabel: '4. Fricción',
    title: '4. Fricción',
    question: 'Encuentro obstáculos o impedimentos que dificultan significativamente mi trabajo diario.',
    reverseScore: true,
  },
  {
    id: 5,
    category: 'Agotamiento',
    shortLabel: '5. Burnout',
    title: '5. Agotamiento (Burnout)',
    question: 'Me siento exhausto o cínico con respecto a mi trabajo.',
    reverseScore: true,
  },
  {
    id: 6,
    category: 'Inestabilidad',
    shortLabel: '6. Entrega',
    title: '6. Inestabilidad en la entrega',
    question: 'El proceso de entrega de software es inestable, propenso a errores o poco confiable.',
    reverseScore: true,
  },
  {
    id: 7,
    category: 'Efectividad individual',
    shortLabel: '7. Efectividad',
    title: '7. Efectividad individual',
    question: 'Me siento altamente efectivo y con un gran sentido de realización en mis tareas.',
    reverseScore: false,
  },
  {
    id: 8,
    category: 'Throughput',
    shortLabel: '8. Throughput',
    title: '8. Rendimiento de entrega (Throughput)',
    question: 'Somos rápidos y eficientes para llevar los cambios desde el código hasta la producción.',
    reverseScore: false,
  },
];

export const OPTIONS = [
  { val: 1, text: '(1) Totalmente en desacuerdo / Nunca' },
  { val: 2, text: '(2) En desacuerdo / Casi nunca' },
  { val: 3, text: '(3) Neutral / A veces' },
  { val: 4, text: '(4) De acuerdo / Casi siempre' },
  { val: 5, text: '(5) Totalmente de acuerdo / Siempre' },
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