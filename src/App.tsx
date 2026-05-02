import { useState, useRef, useEffect, useCallback } from 'react';

/* ══ TOKENS ═════════════════════════════════════════════════════ */
const C = {
  brand: '#FC4C02',
  blue: '#3B7FFF',
  green: '#00D97E',
  orange: '#FF9500',
  purple: '#7B61FF',
  red: '#FF3B5C',
  grey: '#8E8E9A',
};
const TV = (d) =>
  d
    ? {
        '--b0': '#08080F',
        '--b1': '#0F0F1C',
        '--b2': '#161627',
        '--b3': '#1D1D30',
        '--t0': '#FFFFFF',
        '--t1': 'rgba(255,255,255,.85)',
        '--t2': 'rgba(255,255,255,.50)',
        '--t3': 'rgba(255,255,255,.28)',
        '--br': 'rgba(255,255,255,.07)',
        '--br2': 'rgba(255,255,255,.14)',
        '--inp': 'rgba(255,255,255,.07)',
        '--sh': '0 8px 32px rgba(0,0,0,.55)',
        '--shsm': '0 2px 14px rgba(0,0,0,.4)',
        '--gl': 'rgba(255,255,255,.05)',
        '--glb': 'rgba(255,255,255,.10)',
      }
    : {
        '--b0': '#F0F0F8',
        '--b1': '#FFFFFF',
        '--b2': '#EAEAF4',
        '--b3': '#DDDDED',
        '--t0': '#08080F',
        '--t1': 'rgba(8,8,15,.85)',
        '--t2': 'rgba(8,8,15,.50)',
        '--t3': 'rgba(8,8,15,.28)',
        '--br': 'rgba(0,0,0,.07)',
        '--br2': 'rgba(0,0,0,.14)',
        '--inp': 'rgba(0,0,0,.05)',
        '--sh': '0 4px 20px rgba(0,0,0,.09)',
        '--shsm': '0 2px 8px rgba(0,0,0,.06)',
        '--gl': 'rgba(0,0,0,.03)',
        '--glb': 'rgba(0,0,0,.08)',
      };

/* ══ CONSTANTS ══════════════════════════════════════════════════ */
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];
const ZC = ['#34c759', '#30d158', '#ff9f0a', '#ff6b35', '#ff3b30'];
const ZN = [
  'Z1 Recuperación',
  'Z2 Aeróbico',
  'Z3 Umbral',
  'Z4 Anaeróbico',
  'Z5 Máximo',
];
const DISTS = [
  '5K',
  '10K',
  '21K — Media Maratón',
  '42K — Maratón',
  'Trail 20K',
  'Trail 42K',
  'Trail 50K',
  'Ultra 100K',
];
const SPORTS = [
  { id: 'running', icon: '🏃', label: 'Running', dist: true },
  { id: 'trail', icon: '🏔️', label: 'Trail', dist: true },
  { id: 'cycling', icon: '🚴', label: 'Ciclismo', dist: true },
  { id: 'swim', icon: '🏊', label: 'Natación', dist: true },
  { id: 'gym', icon: '🏋️', label: 'Fuerza', dist: false },
  { id: 'yoga', icon: '🧘', label: 'Movilidad', dist: false },
  { id: 'walk', icon: '🚶', label: 'Caminata', dist: true },
  { id: 'other', icon: '⚡', label: 'Otro', dist: false },
];
const LEVELS = {
  elite: {
    label: 'Elite',
    color: C.blue,
    bg: C.blue + '14',
    icon: '⚡',
    vo2: 52,
    pace: '4:00–4:30/km',
    desc: 'VO2max 52+',
  },
  avanzado: {
    label: 'Avanzado',
    color: '#af52de',
    bg: '#af52de14',
    icon: '🔥',
    vo2: 48,
    pace: '4:30–5:20/km',
    desc: 'VO2max 48–52',
  },
  intermedio: {
    label: 'Intermedio',
    color: C.brand,
    bg: C.brand + '14',
    icon: '📈',
    vo2: 42,
    pace: '5:20–6:00/km',
    desc: 'VO2max 42–48',
  },
  inicial: {
    label: 'Inicial',
    color: C.green,
    bg: C.green + '14',
    icon: '🌱',
    vo2: 0,
    pace: '6:00+/km',
    desc: 'VO2max <42',
  },
};
const PLANS = {
  elite: {
    intens: '85–95% FCmax',
    longRun: '28–35km',
    sessions: ['Series 1000m', 'Tempo largo', 'Fartlek'],
  },
  avanzado: {
    intens: '78–88% FCmax',
    longRun: '22–28km',
    sessions: ['Cuestas 8×200m', 'Tempo 8km', 'Series 800m'],
  },
  intermedio: {
    intens: '70–82% FCmax',
    longRun: '15–22km',
    sessions: ['Rodaje continuo', 'Fartlek suave'],
  },
  inicial: {
    intens: '60–75% FCmax',
    longRun: '8–15km',
    sessions: ['Run-walk', 'Rodaje suave'],
  },
};
const BLOCK_TYPE_COLOR = {
  calidad: C.blue,
  velocidad: C.purple,
  resistencia: C.green,
  transicion: C.orange,
  recuperacion: C.grey,
  fuerza: C.orange,
};
const BLOCK_TYPE_ICON = {
  calidad: '⚡',
  velocidad: '💨',
  resistencia: '🏃',
  transicion: '🔄',
  recuperacion: '💤',
  fuerza: '🏋️',
};

const ACCESS_CODES = {
  COACH2025: 'coach',
  CARLOS01: 'coach',
  ATLETA01: 'athlete',
  ATLETA02: 'athlete',
  VALE2025: 'athlete',
  MARCOS01: 'athlete',
};
const LS_KEY = 'rcp_session_v1';
const PLAN_LIMITS = {
  free: { athletes: 5 },
  starter: { athletes: 15 },
  pro: { athletes: 40 },
};
const TRIAL_DAYS = 30;

const mkSubscription = (auth) => ({
  plan: auth?.plan || 'free',
  status:
    auth?.trial?.end && Date.now() < auth.trial.end
      ? 'trial'
      : auth?.plan && auth.plan !== 'free'
      ? 'active'
      : 'inactive',
  trialEnd: auth?.trial?.end || null,
});
const getEffectivePlan = (subscription) => {
  if (!subscription) return 'free';
  if (
    subscription.status === 'trial' &&
    subscription.trialEnd &&
    Date.now() < subscription.trialEnd
  )
    return 'pro';
  if (subscription.status === 'active') return subscription.plan;
  return 'free';
};
const trialDaysLeft = (subscription) => {
  if (!subscription?.trialEnd) return 0;
  return Math.max(0, Math.ceil((subscription.trialEnd - Date.now()) / 864e5));
};
const startCheckout = (plan) => {
  console.log('upgrade_to_', plan);
};
const mkTrialDates = () => {
  const start = Date.now();
  return { start, end: start + TRIAL_DAYS * 864e5 };
};
const isTrialActive = (auth) =>
  Boolean(auth?.trial?.end && Date.now() < auth.trial.end);
const effectivePlan = (auth) => getEffectivePlan(mkSubscription(auth));

const BLOCKS_INIT = [
  {
    id: 1,
    name: 'Series 300m Insugeo',
    type: 'calidad',
    terrain: 'montana',
    location: 'Insugeo',
    warmup: 2,
    cooldown: 2,
    reps_min: 6,
    reps_max: 8,
    dist_m: 300,
    zone_min: 3,
    zone_max: 4,
    rest_type: 'terrain',
    rest_desc: 'bajada suave',
    pace_min: '4:10',
    pace_max: '4:30',
    note: 'Al 80% hasta sentirte 10 puntos',
    use_count: 24,
  },
  {
    id: 2,
    name: 'Series 1000m Los Limones',
    type: 'velocidad',
    terrain: 'calle',
    location: 'Los Limones',
    warmup: 2,
    cooldown: 2,
    reps_min: 3,
    reps_max: 4,
    dist_m: 1000,
    zone_min: 4,
    zone_max: 4,
    rest_type: 'time',
    rest_seconds: 180,
    pace_min: '3:55',
    pace_max: '4:10',
    note: '',
    use_count: 18,
  },
  {
    id: 3,
    name: 'Fondo aeróbico libre',
    type: 'resistencia',
    terrain: 'hibrido',
    location: 'Libre',
    warmup: 0,
    cooldown: 0,
    reps_min: 0,
    reps_max: 0,
    dist_m: 0,
    zone_min: 2,
    zone_max: 2,
    rest_type: 'time',
    rest_seconds: 0,
    pace_min: '5:30',
    pace_max: '6:10',
    note: 'Intercalar trote y caminata si necesario',
    use_count: 42,
  },
  {
    id: 4,
    name: 'Circuito Gomero transición',
    type: 'transicion',
    terrain: 'montana',
    location: 'Espalda del Gomero',
    warmup: 2,
    cooldown: 2,
    reps_min: 3,
    reps_max: 4,
    dist_m: 500,
    zone_min: 3,
    zone_max: 4,
    rest_type: 'time',
    rest_seconds: 180,
    pace_min: '4:40',
    pace_max: '5:10',
    note: 'Calentamiento desde la Perón',
    use_count: 12,
  },
  {
    id: 5,
    name: 'Pasadas 500m CAPS cuesta',
    type: 'calidad',
    terrain: 'montana',
    location: 'CAPS',
    warmup: 2,
    cooldown: 2,
    reps_min: 4,
    reps_max: 5,
    dist_m: 500,
    zone_min: 4,
    zone_max: 4,
    rest_type: 'terrain',
    rest_desc: 'bajada suave',
    pace_min: '4:30',
    pace_max: '4:50',
    note: '',
    use_count: 9,
  },
  {
    id: 6,
    name: 'Fartlek 300m Z4 x 300m Z2',
    type: 'calidad',
    terrain: 'calle',
    location: 'Campo de soja',
    warmup: 2,
    cooldown: 2,
    reps_min: 5,
    reps_max: 6,
    dist_m: 300,
    zone_min: 2,
    zone_max: 4,
    rest_type: 'terrain',
    rest_desc: '300m en Z2 entre cada rep',
    pace_min: '4:20',
    pace_max: '5:00',
    note: '',
    use_count: 15,
  },
  {
    id: 7,
    name: 'Long run extensivo CAPS',
    type: 'resistencia',
    terrain: 'senda',
    location: 'CAPS',
    warmup: 0,
    cooldown: 0,
    reps_min: 0,
    reps_max: 0,
    dist_m: 0,
    zone_min: 2,
    zone_max: 3,
    rest_type: 'time',
    rest_seconds: 0,
    pace_min: '5:00',
    pace_max: '6:00',
    note: '1-2 vueltas Puerta-cuesta ininterrumpidas',
    use_count: 28,
  },
  {
    id: 8,
    name: 'Fuerza piernas + aeróbico',
    type: 'fuerza',
    terrain: 'gym',
    location: 'Gimnasio/Predio',
    warmup: 0,
    cooldown: 0,
    reps_min: 0,
    reps_max: 0,
    dist_m: 0,
    zone_min: 0,
    zone_max: 0,
    rest_type: 'time',
    rest_seconds: 0,
    pace_min: '',
    pace_max: '',
    note: '30 min aeróbicos después',
    use_count: 36,
  },
];

const AI_SUGG_INIT = [
  {
    id: 1,
    athlete: 'Valentina Cruz',
    athId: 4,
    avatar: '#ff6b6b',
    type: 'warning',
    title: 'Reducir volumen esta semana',
    reason:
      'HRV bajó 9 puntos en 3 días consecutivos. Viene de semana de carga alta (398 training load).',
    changes: [
      'Sábado: Tirada larga 30km → Fondo suave 18km Z2',
      'Miércoles: Calidad → Rodaje regenerativo 12km',
    ],
    confidence: 91,
  },
  {
    id: 2,
    athlete: 'Marcos Díaz',
    athId: 1,
    avatar: '#3266ad',
    type: 'progress',
    title: 'Subir a 7 repeticiones',
    reason:
      'Completó 6×300m bajo ritmo objetivo 3 semanas seguidas. Cumplimiento promedio 96%.',
    changes: ['Próxima sesión Insugeo: 7×300m (antes era 6)'],
    confidence: 87,
  },
  {
    id: 3,
    athlete: 'Grupo Intermedio',
    athId: null,
    avatar: C.orange,
    type: 'weather',
    title: 'Ajuste por calor — 37°C el miércoles',
    reason:
      'Pronóstico 37°C en Tucumán. Sesión de calidad vespertina de alto riesgo.',
    changes: [
      'Ritmo +15 seg/km en todas las pasadas',
      'Sesión a las 6:30am o después de las 19hs',
      'Reducir a 5 repeticiones mínimo',
    ],
    confidence: 95,
  },
];

const WEATHER = {
  temp: 34,
  feels: 37,
  cond: 'Soleado',
  humidity: 28,
  wind: 12,
  icon: '☀️',
  riskLevel: 'alto',
  riskColor: C.red,
  advice: 'Reducir intensidad. Hidratación c/10min. Evitar 12–17hs.',
};

/* ══ HELPERS ════════════════════════════════════════════════════ */
const p2 = (n) => String(n).padStart(2, '0');
const toSec = (s) => {
  const [m, ss] = s.split(':').map(Number);
  return m * 60 + ss;
};
const fmtT = (s) => {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    ss = s % 60;
  return h ? `${h}:${p2(m)}:${p2(ss)}` : `${m}:${p2(ss)}`;
};
const adjP = (p, d) => {
  const s = Math.max(40, toSec(p) + d);
  return `${Math.floor(s / 60)}:${p2(s % 60)}`;
};
const calcT = (km, p) => fmtT(Math.round(km * toSec(p)));
const lvlOf = (a) => {
  if (!a?.stats) return 'inicial';
  const v = a.stats.vo2;
  return v >= 52
    ? 'elite'
    : v >= 48
    ? 'avanzado'
    : v >= 42
    ? 'intermedio'
    : 'inicial';
};
const tColor = (t) =>
  t === 'Intervalo'
    ? C.blue
    : t === 'Recuperación'
    ? C.green
    : t === 'Calidad'
    ? C.orange
    : t === 'Descanso'
    ? C.grey
    : C.brand;
const dUntil = (d) => Math.ceil((new Date(d) - new Date()) / 864e5);
const phase = (w) =>
  w > 16
    ? 'Base'
    : w > 8
    ? 'Desarrollo'
    : w > 4
    ? 'Pico'
    : w > 2
    ? 'Taper'
    : '¡Carrera!';
const phaseC = (p) =>
  p === 'Base'
    ? C.blue
    : p === 'Desarrollo'
    ? C.brand
    : p === 'Pico'
    ? C.orange
    : p === 'Taper'
    ? C.purple
    : C.green;
const mkSpl = (km, pace, hr) =>
  Array.from({ length: Math.ceil(km) }, (_, i) => {
    const s = toSec(pace) + Math.round((Math.random() - 0.5) * 14);
    return {
      km: i + 1,
      dist: i === Math.ceil(km) - 1 ? +(km % 1 || 1).toFixed(2) : 1,
      pace: `${Math.floor(Math.max(40, s) / 60)}:${p2(Math.max(40, s) % 60)}`,
      hr: hr + Math.round((Math.random() - 0.5) * 10),
    };
  });
const mkActs = (km, pace, hr, elev) =>
  [
    {
      id: 1,
      name: 'Long Run',
      type: 'Carrera',
      date: 'Hoy',
      dist: +(km * 1.8).toFixed(1),
      time: calcT(km * 1.8, pace),
      pace,
      hr,
      elev: Math.round(elev * 1.2),
      feel: 4,
      zones: [5, 22, 40, 23, 10],
      source: 'strava',
    },
    {
      id: 2,
      name: 'Series 800m',
      type: 'Intervalo',
      date: 'Hace 2 días',
      dist: +(km * 0.65).toFixed(1),
      time: calcT(km * 0.65, adjP(pace, -22)),
      pace: adjP(pace, -22),
      hr: hr + 14,
      elev: Math.round(elev * 0.3),
      feel: 5,
      zones: [0, 5, 14, 46, 35],
      source: 'strava',
    },
    {
      id: 3,
      name: 'Rodaje suave',
      type: 'Recuperación',
      date: 'Hace 4 días',
      dist: +(km * 0.75).toFixed(1),
      time: calcT(km * 0.75, adjP(pace, +28)),
      pace: adjP(pace, +28),
      hr: hr - 13,
      elev: Math.round(elev * 0.35),
      feel: 3,
      zones: [18, 42, 28, 10, 2],
      source: 'strava',
    },
    {
      id: 4,
      name: 'Fartlek',
      type: 'Calidad',
      date: 'Hace 6 días',
      dist: +(km * 1.0).toFixed(1),
      time: calcT(km, adjP(pace, -10)),
      pace: adjP(pace, -10),
      hr: hr + 8,
      elev: Math.round(elev * 0.6),
      feel: 4,
      zones: [2, 12, 28, 40, 18],
      source: 'strava',
    },
  ].map((a) => ({ ...a, splits: mkSpl(a.dist, a.pace, a.hr) }));
const mkPlan = (lk) => {
  const pl = PLANS[lk],
    lv = LEVELS[lk],
    parts = lv.pace.split('–'),
    p0 = parts[0].trim(),
    p1 = (parts[1] || parts[0]).replace('/km', '').trim() + '/km';
  return [
    {
      day: 'Lunes',
      name: 'Rodaje suave',
      type: 'Recuperación',
      pace: p1,
      dur: '45min',
      notes: 'Aeróbico suave',
    },
    {
      day: 'Martes',
      name: pl.sessions[0],
      type: 'Calidad',
      pace: p0,
      dur: '65min',
      notes: pl.intens,
    },
    {
      day: 'Miércoles',
      name: 'Descanso activo',
      type: 'Descanso',
      pace: '—',
      dur: '30min',
      notes: 'Caminata + stretching',
    },
    {
      day: 'Jueves',
      name: pl.sessions[1] || 'Rodaje medio',
      type: 'Carrera',
      pace: lv.pace,
      dur: '55min',
      notes: 'Ritmo grupal',
    },
    {
      day: 'Viernes',
      name: 'Recuperación+drills',
      type: 'Recuperación',
      pace: 'Suave',
      dur: '35min',
      notes: 'Activación',
    },
    {
      day: 'Sábado',
      name: 'Tirada larga',
      type: 'Carrera',
      pace: lv.pace,
      dur: 'Variable',
      notes: pl.longRun,
    },
    {
      day: 'Domingo',
      name: 'Descanso total',
      type: 'Descanso',
      pace: '—',
      dur: '—',
      notes: '',
    },
  ];
};

/* ══ DATA ═══════════════════════════════════════════════════════ */
const ATHLETES = [
  {
    id: 1,
    name: 'Marcos Díaz',
    init: 'MD',
    age: 34,
    av: '#3266ad',
    strava: true,
    sync: 'hace 3 min',
    plan: 'Maratón',
    notes: '',
    injuries: [],
    goals: [
      {
        id: 1,
        name: 'Maratón Buenos Aires',
        date: '2025-10-19',
        dist: '42K — Maratón',
        target: '3:45:00',
      },
    ],
    stats: {
      vo2: 52,
      wkm: [45, 52, 38, 60, 55, 48, 61],
      pace: '4:28',
      hrR: 48,
      hrv: 64,
      bat: 78,
      elev: 1840,
    },
    acts: mkActs(22, '4:28', 148, 180),
  },
  {
    id: 2,
    name: 'Laura Ríos',
    init: 'LR',
    age: 29,
    av: '#af52de',
    strava: true,
    sync: 'hace 1h',
    plan: 'Trail 21K',
    notes: '',
    injuries: [],
    goals: [
      {
        id: 1,
        name: 'Trail Tucumán',
        date: '2025-08-23',
        dist: 'Trail 20K',
        target: '',
      },
    ],
    stats: {
      vo2: 49,
      wkm: [30, 35, 28, 42, 38, 31, 40],
      pace: '5:10',
      hrR: 52,
      hrv: 58,
      bat: 62,
      elev: 3200,
    },
    acts: mkActs(15, '5:10', 162, 620),
  },
  {
    id: 3,
    name: 'Sebastián Mora',
    init: 'SM',
    age: 41,
    av: '#30b0c7',
    strava: false,
    sync: null,
    plan: '10K',
    notes: '',
    injuries: [],
    goals: [],
    stats: null,
    acts: [],
  },
  {
    id: 4,
    name: 'Valentina Cruz',
    init: 'VC',
    age: 26,
    av: '#ff6b6b',
    strava: true,
    sync: 'hace 8 min',
    plan: 'Trail 42K',
    notes: '',
    injuries: [
      {
        id: 1,
        date: 'Hace 3 días',
        zone: 'Rodilla derecha',
        type: 'Molestia',
        intens: 2,
        note: 'Leve dolor bajando cuestas.',
        resolved: false,
      },
    ],
    goals: [
      {
        id: 1,
        name: 'UTMB CCC',
        date: '2025-08-29',
        dist: 'Trail 50K',
        target: '',
      },
    ],
    stats: {
      vo2: 55,
      wkm: [55, 62, 48, 72, 68, 58, 75],
      pace: '4:15',
      hrR: 44,
      hrv: 72,
      bat: 91,
      elev: 5100,
    },
    acts: mkActs(28, '4:15', 155, 1240),
  },
  {
    id: 5,
    name: 'Rodrigo Paz',
    init: 'RP',
    age: 38,
    av: '#34c759',
    strava: true,
    sync: 'hace 30min',
    plan: '5K',
    notes: '',
    injuries: [],
    goals: [
      {
        id: 1,
        name: '10K Rosario',
        date: '2025-07-13',
        dist: '10K',
        target: '52:00',
      },
    ],
    stats: {
      vo2: 44,
      wkm: [20, 24, 18, 28, 22, 20, 26],
      pace: '5:45',
      hrR: 57,
      hrv: 51,
      bat: 70,
      elev: 620,
    },
    acts: mkActs(10, '5:45', 152, 88),
  },
  {
    id: 6,
    name: 'Camila Torres',
    init: 'CT',
    age: 24,
    av: '#ff9500',
    strava: true,
    sync: 'hace 2h',
    plan: 'Principiante',
    notes: '',
    injuries: [],
    goals: [],
    stats: {
      vo2: 38,
      wkm: [12, 15, 10, 18, 14, 12, 16],
      pace: '6:30',
      hrR: 63,
      hrv: 44,
      bat: 58,
      elev: 280,
    },
    acts: mkActs(6, '6:30', 158, 32),
  },
];
const SELF = {
  ...ATHLETES[3],
  coachName: 'Carlos',
  weekPlan: [
    {
      day: 'Lunes',
      done: true,
      name: 'Rodaje suave 10km',
      type: 'Recuperación',
      pace: '5:10–5:30/km',
      dur: '55min',
    },
    {
      day: 'Martes',
      done: true,
      name: 'Series 6×1000m',
      type: 'Intervalo',
      pace: '4:00–4:10/km',
      dur: '70min',
    },
    {
      day: 'Miércoles',
      done: true,
      name: 'Descanso activo',
      type: 'Descanso',
      pace: 'Caminata',
      dur: '30min',
    },
    {
      day: 'Jueves',
      done: false,
      name: 'Fartlek 12km',
      type: 'Calidad',
      pace: '4:20–4:40/km',
      dur: '55min',
    },
    {
      day: 'Viernes',
      done: false,
      name: 'Recuperación+drills',
      type: 'Recuperación',
      pace: '5:30+/km',
      dur: '40min',
    },
    {
      day: 'Sábado',
      done: false,
      name: 'Tirada larga 30km',
      type: 'Carrera',
      pace: '4:30–4:50/km',
      dur: '2h20m',
    },
    {
      day: 'Domingo',
      done: false,
      name: 'Descanso total',
      type: 'Descanso',
      pace: '—',
      dur: '—',
    },
  ],
  coachMsgs: [
    {
      from: 'coach',
      text: 'Vale, excelente tirada! Los splits de los primeros 15km fueron perfectos. 💪',
      time: 'Hace 1h',
    },
    {
      from: 'coach',
      text: 'Revisé las zonas de FC de ayer. El 48% en Z4 es alto para un fartlek. Arrancá más tranquila.',
      time: 'Hace 2 días',
    },
  ],
};
/* ══ GLOBAL CSS ═════════════════════════════════════════════════ */
const GlobalCSS = () => (
  <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent} input,select,textarea{background:var(--inp);border:1.5px solid var(--br2);border-radius:12px;color:var(--t0);font-family:inherit;font-size:14px;outline:none;padding:10px 14px;transition:border-color .2s,box-shadow .2s;width:100%} input:focus,select:focus,textarea:focus{border-color:#FC4C02;box-shadow:0 0 0 3px rgba(252,76,2,.18)} input::placeholder,textarea::placeholder{color:var(--t3)} select option{background:var(--b1);color:var(--t0)} ::-webkit-scrollbar{display:none} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pp{0%,100%{opacity:.3}50%{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes orb{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.15) translate(10px,-10px)}} @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}} .rcp-card{background:var(--b1);border:0.5px solid var(--br);border-radius:20px;box-shadow:var(--sh);padding:16px} .rcp-card2{background:var(--b2);border:0.5px solid var(--br);border-radius:16px;padding:12px 14px} .rcp-btn{border:none;border-radius:14px;cursor:pointer;font-family:inherit;font-weight:500;transition:opacity .15s,transform .12s} .rcp-btn:active{transform:scale(.97)} .rcp-btn-primary{background:linear-gradient(135deg,#FC4C02,#FF7A38);color:#fff} .rcp-btn-secondary{background:var(--b2);border:0.5px solid var(--br2);color:var(--t1)} .rcp-btn-ghost{background:none;border:0.5px solid var(--br2);color:var(--t1)} .fade-up{animation:fadeUp .3s ease both} .act-card{background:var(--b1);border:0.5px solid var(--br);border-radius:18px;cursor:pointer;overflow:hidden;transition:transform .15s,box-shadow .15s;margin-bottom:10px} .act-card:hover{transform:translateY(-2px);box-shadow:var(--sh)} .shake{animation:shake .35s ease}`}</style>
);

/* ══ PRIMITIVES ═════════════════════════════════════════════════ */
const Av = ({ init, av, size = 44, ring }: any) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: av + '22',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: size * 0.3,
      color: av,
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2.5px ${av}` : undefined,
    }}
  >
    {init}
  </div>
);
const Tag = ({ label, color, sm, pill }: any) => (
  <span
    style={{
      background: color + '18',
      color,
      borderRadius: pill ? 100 : sm ? 8 : 10,
      padding: sm ? '2px 9px' : '5px 12px',
      fontSize: sm ? 10 : 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      letterSpacing: 0.2,
    }}
  >
    {label}
  </span>
);
const Dot = ({ c, pulse }: any) => (
  <span
    style={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: c,
      display: 'inline-block',
      flexShrink: 0,
      boxShadow: pulse ? `0 0 6px ${c}` : undefined,
    }}
  />
);
const ZBar = ({ zones, h = 6 }: any) => (
  <div
    style={{
      display: 'flex',
      gap: 2,
      height: h,
      borderRadius: h / 2,
      overflow: 'hidden',
    }}
  >
    {zones.map((z: any, i: number) => (
      <div key={i} style={{ flex: z, background: ZC[i] }} />
    ))}
  </div>
);
const MBar = ({ vals, col = C.brand }: any) => {
  const mx = Math.max(...vals, 1);
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30 }}
    >
      {vals.map((v: any, i: number) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: i === 6 ? col : 'var(--br2)',
            borderRadius: '3px 3px 0 0',
            height: Math.max(2, Math.round((v / mx) * 26)),
            transition: 'height .3s',
          }}
        />
      ))}
    </div>
  );
};
const StatCard = ({ label, value, unit, color, large }: any) => (
  <div className="rcp-card2">
    <div
      style={{
        fontSize: 10,
        color: 'var(--t2)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: large ? 28 : 20,
        fontWeight: 700,
        color: color || 'var(--t0)',
        lineHeight: 1.1,
      }}
    >
      {value}
      <span
        style={{
          fontSize: large ? 13 : 10,
          color: 'var(--t2)',
          marginLeft: 2,
          fontWeight: 400,
        }}
      >
        {unit}
      </span>
    </div>
  </div>
);
const BackBtn = ({ onClick, label = 'Volver' }: any) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: C.brand,
      fontSize: 15,
      cursor: 'pointer',
      padding: '0 0 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontWeight: 500,
    }}
  >
    ‹ {label}
  </button>
);
const GradBtn = ({ children, onClick, disabled, style = {} }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rcp-btn rcp-btn-primary"
    style={{
      padding: '13px 0',
      fontSize: 15,
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

/* ══ ENTRY SCREEN ═══════════════════════════════════════════════ */
const EntryScreen = ({ onCoach, onAthlete, dark, onToggleDark }: any) => {
  const [entryRole, setEntryRole] = useState(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const attemptAthlete = () => {
    const trimmed = code.trim().toUpperCase();
    const role = (ACCESS_CODES as any)[trimmed];
    if (role === 'athlete' && name.trim().length > 1) {
      const session = { role: 'athlete', code: trimmed, ts: Date.now() };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(session));
      } catch (e) {}
      onAthlete(name.trim());
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeout(() => setError(false), 2400);
      (inputRef.current as any)?.focus();
    }
  };

  const Logo = () => (
    <>
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle,${C.brand}1e,transparent 70%)`,
          animation: 'orb 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle,${C.blue}16,transparent 70%)`,
          animation: 'orb 8s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button
          onClick={onToggleDark}
          style={{
            background: 'var(--b2)',
            border: '0.5px solid var(--br2)',
            borderRadius: 20,
            padding: '7px 12px',
            fontSize: 16,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
      <div
        style={{ textAlign: 'center', marginBottom: 36, position: 'relative' }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 22,
            background: `linear-gradient(135deg,${C.brand},${C.orange})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            margin: '0 auto 16px',
            boxShadow: `0 8px 28px ${C.brand}55`,
          }}
        >
          🏃
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: -0.5,
            background: `linear-gradient(135deg,${C.brand},${C.orange})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Running Coach Pro
        </div>
      </div>
    </>
  );

  const wrap = (children: any) => (
    <div
      style={{
        maxWidth: 440,
        margin: '0 auto',
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--b0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );

  if (!entryRole)
    return wrap(
      <>
        <Logo />
        <div
          style={{
            fontSize: 13,
            color: 'var(--t2)',
            textAlign: 'center',
            marginBottom: 24,
            position: 'relative',
          }}
        >
          Elegí cómo querés ingresar
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'relative',
          }}
        >
          <button
            onClick={onCoach}
            className="rcp-btn"
            style={{
              background: `linear-gradient(135deg,${C.brand}18,${C.orange}0e)`,
              border: `0.5px solid ${C.brand}33`,
              borderRadius: 22,
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: `0 4px 20px ${C.brand}14`,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: `linear-gradient(135deg,${C.brand}33,${C.brand}1a)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                flexShrink: 0,
                border: `1px solid ${C.brand}44`,
              }}
            >
              👨‍💼
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: 'var(--t0)',
                  marginBottom: 4,
                  letterSpacing: -0.3,
                }}
              >
                Soy Entrenador
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}
              >
                Gestioná tu equipo, planificá sesiones y seguí la evolución de
                tus alumnos.
              </div>
            </div>
            <span style={{ fontSize: 20, color: C.brand + '99' }}>›</span>
          </button>
          <button
            onClick={() => setEntryRole('athlete' as any)}
            className="rcp-btn"
            style={{
              background: `linear-gradient(135deg,${C.blue}14,${C.purple}0a)`,
              border: `0.5px solid ${C.blue}33`,
              borderRadius: 22,
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: `0 4px 20px ${C.blue}10`,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: `linear-gradient(135deg,${C.blue}33,${C.blue}1a)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                flexShrink: 0,
                border: `1px solid ${C.blue}44`,
              }}
            >
              🏃
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: 'var(--t0)',
                  marginBottom: 4,
                  letterSpacing: -0.3,
                }}
              >
                Soy Alumno
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}
              >
                Accedé a tu plan, registrá actividades y comunicarte con tu
                entrenador.
              </div>
            </div>
            <span style={{ fontSize: 20, color: C.blue + '99' }}>›</span>
          </button>
        </div>
      </>
    );

  return wrap(
    <>
      <Logo />
      <button
        onClick={() => {
          setEntryRole(null);
          setCode('');
          setName('');
          setError(false);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: C.brand,
          fontSize: 14,
          cursor: 'pointer',
          padding: '0 0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontWeight: 500,
          position: 'relative',
        }}
      >
        ‹ Volver
      </button>
      <div
        style={{
          fontWeight: 800,
          fontSize: 20,
          color: 'var(--t0)',
          marginBottom: 6,
          letterSpacing: -0.3,
          position: 'relative',
        }}
      >
        Unirme a mi entrenador
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--t2)',
          marginBottom: 22,
          lineHeight: 1.6,
          position: 'relative',
        }}
      >
        Ingresá el código que te dio tu entrenador y tu nombre.
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          position: 'relative',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--t2)',
              marginBottom: 6,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            Tu nombre
          </div>
          <input
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            placeholder="Ej: Valentina Cruz"
            autoFocus
          />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--t2)',
              marginBottom: 6,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            Código de entrenador
          </div>
          <div className={shake ? 'shake' : ''}>
            <input
              ref={inputRef}
              value={code}
              onChange={(e: any) => {
                setCode(e.target.value);
                setError(false);
              }}
              onKeyDown={(e: any) => e.key === 'Enter' && attemptAthlete()}
              placeholder="Ej: ATLETA01"
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                borderColor: error ? C.red : 'var(--br2)',
                boxShadow: error ? `0 0 0 3px ${C.red}22` : undefined,
              }}
              autoComplete="off"
            />
          </div>
          <div style={{ height: 18, marginTop: 6, textAlign: 'center' }}>
            {error && (
              <div style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>
                Código incorrecto. Pedíselo a tu entrenador.
              </div>
            )}
          </div>
        </div>
        <GradBtn
          onClick={attemptAthlete}
          disabled={!code.trim() || !name.trim()}
          style={{ marginTop: 4 }}
        >
          Unirme →
        </GradBtn>
        <div
          style={{
            background: 'var(--b2)',
            border: '0.5px solid var(--br)',
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--t3)',
              textTransform: 'uppercase',
              letterSpacing: 0.7,
              marginBottom: 6,
            }}
          >
            Códigos demo
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {['ATLETA01', 'ATLETA02', 'VALE2025', 'MARCOS01'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCode(c);
                  setError(false);
                }}
                style={{
                  background: C.blue + '14',
                  border: `0.5px solid ${C.blue}44`,
                  borderRadius: 7,
                  padding: '4px 9px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.blue,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  letterSpacing: 0.4,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ══ WEATHER WIDGET ═══════════════════════════════════════════ */
const WeatherWidget = () => (
  <div
    style={{
      background: `linear-gradient(135deg,${WEATHER.riskColor}12,${C.orange}08)`,
      border: `0.5px solid ${WEATHER.riskColor}33`,
      borderRadius: 18,
      padding: '14px 16px',
      marginBottom: 14,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--t3)',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 3,
          }}
        >
          🌤 Tucumán — Hoy
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--t0)' }}>
            {WEATHER.temp}°
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>
            Sensación {WEATHER.feels}°
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
          {WEATHER.cond} · Humedad {WEATHER.humidity}% · Viento {WEATHER.wind}
          km/h
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 34 }}>{WEATHER.icon}</div>
        <div
          style={{
            background: WEATHER.riskColor + '18',
            color: WEATHER.riskColor,
            borderRadius: 8,
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          Riesgo {WEATHER.riskLevel}
        </div>
      </div>
    </div>
    <div
      style={{
        background: 'rgba(0,0,0,.15)',
        borderRadius: 10,
        padding: '7px 12px',
        fontSize: 11,
        color: 'var(--t1)',
        lineHeight: 1.6,
      }}
    >
      ✦ IA: {WEATHER.advice}
    </div>
  </div>
);

/* ══ TOAST ════════════════════════════════════════════════════ */
const Toast = ({ msg, onDone }: any) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        background: C.green,
        color: '#fff',
        borderRadius: 14,
        padding: '11px 20px',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: `0 8px 28px ${C.green}55`,
        zIndex: 600,
        animation: 'fadeUp .3s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
    </div>
  );
};

/* ══ BOTTOM NAV ═══════════════════════════════════════════════ */
const BottomNav = ({ tabs, active, onChange, noActive = false }: any) => (
  <div
    style={{
      display: 'flex',
      padding: '10px 8px 20px',
      background: 'var(--b0)',
      borderTop: '0.5px solid var(--br)',
      flexShrink: 0,
      gap: 3,
    }}
  >
    {tabs.map((t: any) => {
      const on = !noActive && active === t.id;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            background: on ? 'var(--b2)' : 'none',
            border: on ? '0.5px solid var(--br2)' : 'none',
            borderRadius: 12,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '7px 3px',
            transition: 'all .2s',
            position: 'relative',
          }}
        >
          {t.badge > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 5,
                right: '15%',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: C.red,
                boxShadow: `0 0 6px ${C.red}`,
              }}
            />
          )}
          <span style={{ fontSize: 17, lineHeight: 1 }}>{t.icon}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: on ? 700 : 400,
              color: on ? C.brand : 'var(--t3)',
              letterSpacing: 0.2,
            }}
          >
            {t.label}
          </span>
        </button>
      );
    })}
  </div>
);

/* ══ APP HEADER ═══════════════════════════════════════════════ */
const AppHeader = ({
  title,
  subtitle,
  dark,
  onToggleDark,
  onSwitch,
  rightAction,
  onSignOut,
}: any) => (
  <div
    style={{
      padding: '20px 20px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    }}
  >
    <div>
      <div
        style={{
          fontWeight: 800,
          fontSize: 21,
          color: 'var(--t0)',
          letterSpacing: -0.4,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 3 }}>
          {subtitle}
        </div>
      )}
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {rightAction}
      <button
        onClick={onToggleDark}
        style={{
          background: 'var(--b2)',
          border: '0.5px solid var(--br2)',
          borderRadius: 20,
          padding: '6px 10px',
          fontSize: 16,
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {dark ? '☀️' : '🌙'}
      </button>
      <button
        onClick={onSignOut}
        title="Salir"
        style={{
          background: 'var(--b2)',
          border: '0.5px solid var(--br2)',
          borderRadius: 20,
          padding: '6px 10px',
          fontSize: 13,
          cursor: 'pointer',
          color: 'var(--t2)',
          fontWeight: 500,
        }}
      >
        🚪
      </button>
    </div>
  </div>
);

/* ══ PLAN GATE ════════════════════════════════════════════════ */
const PlanGate = ({ allowed, children, label = 'Función Pro' }: any) => {
  if (allowed) return children;
  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      <div style={{ opacity: 0.35, pointerEvents: 'none' }}>{children}</div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--b0)',
          opacity: 0.82,
          borderRadius: 14,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 22 }}>🔒</span>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--t2)',
            textAlign: 'center',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)' }}>
          Disponible en Starter y Pro
        </div>
      </div>
    </div>
  );
};

/* ══ TRIAL BANNER ════════════════════════════════════════════ */
const TrialBanner = ({ subscription, onUpgrade }: any) => {
  const days = trialDaysLeft(subscription);
  if (subscription?.status !== 'trial') return null;
  const urgent = days <= 7;
  const color = urgent ? C.orange : C.green;
  return (
    <div
      style={{
        background: color + '0e',
        borderBottom: `0.5px solid ${color}33`,
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 13 }}>{urgent ? '⚠️' : '✦'}</span>
        <span style={{ fontSize: 12, color: 'var(--t1)', fontWeight: 600 }}>
          Tenés acceso completo por{' '}
          <strong style={{ color }}>{days} días</strong>
        </span>
      </div>
      <button
        onClick={onUpgrade}
        style={{
          background: color,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '4px 12px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        Ver planes
      </button>
    </div>
  );
};

/* ══ SUBSCRIPTION STATUS ════════════════════════════════════ */
const PLAN_DEFS = [
  {
    id: 'free',
    label: 'Free',
    price: 'Gratis',
    accent: C.green,
    icon: '🌱',
    features: ['Hasta 5 alumnos', 'Gestión básica de planes'],
    cta: 'Empezar gratis',
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '$12/mes',
    accent: C.blue,
    icon: '📈',
    features: ['Hasta 15 alumnos', 'Seguimiento avanzado'],
    cta: 'Probar 30 días gratis',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '$29/mes',
    accent: C.brand,
    icon: '⚡',
    features: ['Hasta 40 alumnos', 'Todo incluido'],
    cta: 'Probar 30 días gratis',
  },
];

const SubscriptionStatus = ({ subscription, onUpgrade }: any) => {
  const ePlan = getEffectivePlan(subscription);
  const planLabel = PLAN_DEFS.find((p) => p.id === ePlan)?.label || 'Free';
  const isTrial = subscription?.status === 'trial';
  const days = trialDaysLeft(subscription);
  const statusLabel = isTrial
    ? `Trial · ${days}d restantes`
    : subscription?.status === 'active'
    ? 'Activo'
    : 'Free';
  const color = isTrial
    ? C.orange
    : subscription?.status === 'active'
    ? C.green
    : C.grey;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          background: color + '18',
          border: `0.5px solid ${color}44`,
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 11,
          fontWeight: 700,
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {planLabel} · {statusLabel}
      </div>
      {ePlan !== 'pro' || isTrial ? (
        <button
          onClick={onUpgrade}
          style={{
            background: `linear-gradient(135deg,${C.brand},${C.orange})`,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '5px 11px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Actualizar plan
        </button>
      ) : null}
    </div>
  );
};

/* ══ RACE CARD ═══════════════════════════════════════════════ */
const RaceCard = ({ goal, onDelete }: any) => {
  if (!goal?.date) return null;
  const g = goal,
    days = dUntil(g.date),
    weeks = Math.ceil(days / 7),
    ph = days > 0 ? phase(weeks) : 'Completada',
    pc = days > 0 ? phaseC(ph) : C.grey;
  return (
    <div
      style={{
        background: 'var(--b1)',
        border: `0.5px solid ${pc}33`,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 12,
        boxShadow: 'var(--shsm)',
      }}
    >
      <div style={{ height: 3, background: pc }} />
      <div style={{ padding: '14px 16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--t0)',
                marginBottom: 3,
              }}
            >
              {g.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>
              {g.dist} ·{' '}
              {new Date(g.date).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            {g.target && (
              <div
                style={{
                  fontSize: 12,
                  color: C.blue,
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                🎯 Objetivo: {g.target}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', minWidth: 56, marginLeft: 12 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: pc,
                lineHeight: 1,
              }}
            >
              {days > 0 ? days : '✓'}
            </div>
            <div
              style={{
                fontSize: 9,
                color: 'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {days > 0 ? 'días' : ''}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <Tag label={ph} color={pc} sm pill />
          {days > 0 && (
            <span style={{ fontSize: 11, color: 'var(--t2)' }}>
              {weeks} semanas
            </span>
          )}
        </div>
        {days > 0 && (
          <div
            style={{
              height: 4,
              background: 'var(--br2)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.round((1 - weeks / 20) * 100))}%`,
                background: pc,
                borderRadius: 3,
                transition: 'width .5s ease',
              }}
            />
          </div>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            style={{
              marginTop: 10,
              background: 'none',
              border: 'none',
              color: 'var(--t3)',
              fontSize: 12,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

/* ══ ADD RACE FORM ═══════════════════════════════════════════ */
const AddRaceForm = ({ onAdd, onCancel }: any) => {
  const [f, setF] = useState({
    name: '',
    date: '',
    dist: DISTS[0],
    target: '',
  });
  const ok = f.name && f.date;
  return (
    <div
      style={{
        background: 'var(--gl)',
        border: `0.5px solid ${C.blue}44`,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.blue,
          marginBottom: 16,
        }}
      >
        Nueva carrera objetivo
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--t2)',
              marginBottom: 5,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            Nombre
          </div>
          <input
            value={f.name}
            onChange={(e: any) => setF((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ej: Maratón de Buenos Aires"
          />
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Fecha
            </div>
            <input
              type="date"
              value={f.date}
              onChange={(e: any) =>
                setF((p) => ({ ...p, date: e.target.value }))
              }
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Distancia
            </div>
            <select
              value={f.dist}
              onChange={(e: any) =>
                setF((p) => ({ ...p, dist: e.target.value }))
              }
            >
              {DISTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--t2)',
              marginBottom: 5,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
            }}
          >
            Tiempo objetivo{' '}
            <span
              style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none' }}
            >
              (opcional)
            </span>
          </div>
          <input
            value={f.target}
            onChange={(e: any) =>
              setF((p) => ({ ...p, target: e.target.value }))
            }
            placeholder="Ej: 3:45:00"
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            className="rcp-btn rcp-btn-secondary"
            style={{ flex: 1, padding: '11px 0', fontSize: 13 }}
          >
            Cancelar
          </button>
          <GradBtn
            onClick={() => ok && onAdd({ ...f, id: Date.now() })}
            disabled={!ok}
            style={{ flex: 2, padding: '11px 0', fontSize: 13 }}
          >
            Agregar →
          </GradBtn>
        </div>
      </div>
    </div>
  );
};

/* ══ ACT CARD ════════════════════════════════════════════════ */
const ActCard = ({ act, onSelect, onAnalyze, planPace }: any) => {
  const tc = tColor(act.type);
  const ok = planPace && toSec(act.pace) <= toSec(planPace.split('–')[0]) + 30;
  const sp = SPORTS.find((s: any) => s.id === act.sport) || {
    icon:
      act.type === 'Intervalo'
        ? '⚡'
        : act.type === 'Recuperación'
        ? '💚'
        : act.type === 'Calidad'
        ? '🔥'
        : '🏃',
  };
  return (
    <div className="act-card" onClick={() => onSelect(act)}>
      <div style={{ height: 3, background: tc, opacity: 0.8 }} />
      <div style={{ padding: '13px 15px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: tc + '18',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              {(sp as any).icon}
            </div>
            <div>
              <div
                style={{ fontWeight: 600, fontSize: 14, color: 'var(--t0)' }}
              >
                {act.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                {act.date} ·{' '}
                <span style={{ color: tc, fontWeight: 600 }}>{act.type}</span>
                {act.source === 'strava' && (
                  <span style={{ color: C.brand }}> · Strava</span>
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 5,
            }}
          >
            {onAnalyze && (
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onAnalyze(act);
                }}
                style={{
                  background: `linear-gradient(135deg,${C.purple},${C.blue})`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✦ Analizar
              </button>
            )}
            {planPace && (
              <Tag
                label={ok ? 'En ritmo ✓' : 'Fuera de ritmo'}
                color={ok ? C.green : C.orange}
                sm
              />
            )}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 6,
            marginBottom: 10,
          }}
        >
          {[
            ['Dist.', act.dist + 'km'],
            ['Tiempo', act.time],
            ['Ritmo', act.pace + '/km'],
            ['FC', act.hr ? act.hr + 'bpm' : '—'],
          ].map(([l, v]: any) => (
            <div key={l}>
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--t3)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  fontWeight: 600,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--t1)',
                  marginTop: 2,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
        <ZBar zones={act.zones} />
      </div>
    </div>
  );
};

/* ══ ACTIVITY DETAIL ════════════════════════════════════════ */
const ActivityDetail = ({ act, onBack, onAnalyze }: any) => {
  const tc = tColor(act.type);
  return (
    <div className="fade-up">
      <BackBtn onClick={onBack} label="Actividades" />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 20,
              color: 'var(--t0)',
              letterSpacing: -0.4,
            }}
          >
            {act.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 3 }}>
            {act.date} ·{' '}
            <span style={{ color: tc, fontWeight: 700 }}>{act.type}</span>
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: 18,
                  opacity: i <= act.feel ? 1 : 0.15,
                  color: C.orange,
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        {onAnalyze && (
          <button
            onClick={onAnalyze}
            style={{
              background: `linear-gradient(135deg,${C.purple},${C.blue})`,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✦ Analizar con IA
          </button>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          ['Dist.', act.dist + 'km'],
          ['Tiempo', act.time],
          ['Ritmo', act.pace + '/km'],
          ['FC', act.hr ? act.hr + 'bpm' : '—'],
        ].map(([l, v]: any) => (
          <div key={l} className="rcp-card2">
            <div
              style={{
                fontSize: 9,
                color: 'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                fontWeight: 600,
              }}
            >
              {l}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--t0)',
                marginTop: 3,
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="rcp-card" style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--t2)',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 12,
          }}
        >
          Zonas de FC
        </div>
        {ZN.map((n, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 9,
            }}
          >
            <div
              style={{
                fontSize: 11,
                width: 112,
                color: 'var(--t2)',
                flexShrink: 0,
              }}
            >
              {n}
            </div>
            <div
              style={{
                flex: 1,
                height: 8,
                background: 'var(--br2)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${act.zones[i]}%`,
                  background: ZC[i],
                  borderRadius: 4,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                minWidth: 28,
                textAlign: 'right',
                color: 'var(--t0)',
              }}
            >
              {act.zones[i]}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══ AI SUGGESTION CARD ══════════════════════════════════════ */
const AISuggCard = ({ sugg, onApprove, onDeny }: any) => {
  const [done, setDone] = useState(null);
  const tc =
    sugg.type === 'warning'
      ? C.orange
      : sugg.type === 'progress'
      ? C.green
      : C.blue;
  const ti =
    sugg.type === 'warning' ? '⚠️' : sugg.type === 'progress' ? '📈' : '🌡️';
  if (done)
    return (
      <div
        style={{
          background: done === 'ok' ? C.green + '0e' : C.red + '0e',
          border: `0.5px solid ${done === 'ok' ? C.green : C.red}44`,
          borderRadius: 16,
          padding: '12px 14px',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>{done === 'ok' ? '✓' : '✕'}</span>
        <div
          style={{
            fontSize: 12,
            color: done === 'ok' ? C.green : C.red,
            fontWeight: 600,
          }}
        >
          {done === 'ok' ? 'Confirmado' : 'Descartado'} — {sugg.title}
        </div>
      </div>
    );
  return (
    <div
      style={{
        background: 'var(--b1)',
        border: `0.5px solid ${tc}44`,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 12,
        boxShadow: 'var(--shsm)',
      }}
    >
      <div style={{ height: 3, background: tc }} />
      <div style={{ padding: '13px 15px' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: tc + '18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {ti}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t0)' }}>
              {sugg.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
              {sugg.athlete}
            </div>
          </div>
          <div
            style={{
              background: tc + '18',
              color: tc,
              borderRadius: 8,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {sugg.confidence}%
          </div>
        </div>
        <div
          style={{
            background: 'var(--b2)',
            borderRadius: 10,
            padding: '8px 10px',
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
            📊 {sugg.reason}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          {sugg.changes.map((ch: any, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 6,
                fontSize: 12,
                color: 'var(--t1)',
                padding: '3px 0',
              }}
            >
              <span style={{ color: tc, fontWeight: 700 }}>→</span>
              {ch}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setDone('no' as any);
              onDeny && onDeny(sugg.id);
            }}
            className="rcp-btn rcp-btn-ghost"
            style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
          >
            ✕ Descartar
          </button>
          <button
            onClick={() => {
              setDone('ok' as any);
              onApprove && onApprove(sugg.id);
            }}
            className="rcp-btn"
            style={{
              flex: 2,
              background: `linear-gradient(135deg,${tc},${tc}bb)`,
              color: '#fff',
              padding: '9px 0',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✓ Confirmar y aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══ ADD ACTIVITY MODAL ═════════════════════════════════════ */
const AddActivityModal = ({ onAdd, onClose }: any) => {
  const [sport, setSport] = useState('running');
  const [f, setF] = useState({
    name: '',
    dist: '',
    dur: '',
    feel: 4,
    notes: '',
  });
  const sp = SPORTS.find((s: any) => s.id === sport) || SPORTS[0];
  const set = (k: any) => (e: any) =>
    setF((p: any) => ({ ...p, [k]: e.target.value }));
  const valid = !!f.dur.trim();
  const submit = () => {
    if (!valid) return;
    const type =
      sport === 'gym'
        ? 'Fuerza'
        : sport === 'yoga'
        ? 'Recuperación'
        : 'Carrera';
    onAdd({
      id: Date.now(),
      name: f.name.trim() || (sp as any).label,
      type,
      sport,
      date: 'Hoy',
      dist: (sp as any).dist ? parseFloat(f.dist) || 0 : 0,
      time: f.dur.trim(),
      pace: '—',
      hr: 0,
      elev: 0,
      feel: f.feel,
      zones: [20, 35, 30, 10, 5],
      splits: [],
      source: 'manual',
    });
  };
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 500,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e: any) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--b1)',
          borderRadius: '22px 22px 0 0',
          width: '100%',
          maxWidth: 440,
          padding: '8px 20px 36px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUp .3s ease',
        }}
      >
        <div
          style={{
            width: 38,
            height: 4,
            background: 'var(--br2)',
            borderRadius: 2,
            margin: '14px auto 20px',
          }}
        />
        <div
          style={{
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--t0)',
            marginBottom: 16,
          }}
        >
          Registrar actividad
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 8,
            marginBottom: 18,
          }}
        >
          {SPORTS.map((s: any) => (
            <button
              key={s.id}
              onClick={() => setSport(s.id)}
              className="rcp-btn"
              style={{
                background: s.id === sport ? C.brand + '18' : 'var(--b2)',
                border:
                  s.id === sport
                    ? `1.5px solid ${C.brand}`
                    : '1px solid var(--br)',
                borderRadius: 13,
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  color: s.id === sport ? C.brand : 'var(--t2)',
                  fontWeight: s.id === sport ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 5,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Nombre
            </div>
            <input
              value={f.name}
              onChange={set('name')}
              placeholder={(sp as any).label}
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: (sp as any).dist ? '1fr 1fr' : '1fr',
              gap: 10,
            }}
          >
            {(sp as any).dist && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--t2)',
                    marginBottom: 5,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Distancia (km)
                </div>
                <input
                  value={f.dist}
                  onChange={set('dist')}
                  placeholder="Ej: 10.5"
                  type="number"
                  min="0"
                />
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--t2)',
                  marginBottom: 5,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                Duración *
              </div>
              <input
                value={f.dur}
                onChange={set('dur')}
                placeholder="Ej: 1:05:30"
              />
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 8,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Sensación
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setF((p: any) => ({ ...p, feel: i }))}
                  style={{
                    flex: 1,
                    fontSize: 26,
                    opacity: i <= f.feel ? 1 : 0.2,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity .15s',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              className="rcp-btn rcp-btn-secondary"
              style={{ flex: 1, padding: '13px 0', fontSize: 14 }}
            >
              Cancelar
            </button>
            <GradBtn onClick={submit} disabled={!valid} style={{ flex: 2 }}>
              Guardar actividad
            </GradBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══ ATHLETE APP ════════════════════════════════════════════ */
const AthleteApp = ({ onSwitch, dark, onToggleDark, onSignOut }: any) => {
  const [tab, setTab] = useState('inicio');
  const [selAct, setSelAct] = useState(null);
  const [plan, setPlan] = useState(SELF.weekPlan);
  const [acts, setActs] = useState(SELF.acts);
  const [showAdd, setShowAdd] = useState(false);
  const [goals, setGoals] = useState(SELF.goals || []);
  const [showAddRace, setShowAddRace] = useState(false);
  const [injuries, setInjuries] = useState(SELF.injuries || []);
  const [showInj, setShowInj] = useState(false);
  const [injF, setInjF] = useState({
    zone: '',
    type: 'Molestia',
    intens: 1,
    note: '',
  });
  const [msgs, setMsgs] = useState(SELF.coachMsgs);
  const [chatIn, setChatIn] = useState('');
  const chatEnd = useRef(null);
  const a = SELF,
    lk = lvlOf(a),
    lv = LEVELS[lk];
  const activeInj = (injuries as any[]).filter((i: any) => !i.resolved);
  const nextRace = (goals as any[])
    .filter((g: any) => dUntil(g.date) > 0)
    .sort(
      (x: any, y: any) =>
        new Date(x.date).getTime() - new Date(y.date).getTime()
    )[0];
  const doneSess = (plan as any[]).filter(
    (d: any) => d.done && d.type !== 'Descanso'
  ).length;
  const totalSess = (plan as any[]).filter(
    (d: any) => d.type !== 'Descanso'
  ).length;
  const totalKm = (a.stats as any).wkm.reduce(
    (s: number, v: number) => s + v,
    0
  );
  const INJTYPES = [
    'Molestia',
    'Dolor',
    'Tensión',
    'Inflamación',
    'Calambres',
    'Lesión',
  ];
  const INJZONES = [
    'Rodilla derecha',
    'Rodilla izquierda',
    'Cadera derecha',
    'Cadera izquierda',
    'Gemelo derecho',
    'Gemelo izquierdo',
    'Tobillo derecho',
    'Tobillo izquierdo',
    'Plantar derecho',
    'Plantar izquierdo',
    'Espalda baja',
    'Hombro',
    'Otro',
  ];
  useEffect(() => {
    (chatEnd.current as any)?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);
  const sendChat = () => {
    if (!chatIn.trim()) return;
    setMsgs((p: any) => [
      ...p,
      { from: 'athlete', text: chatIn.trim(), time: 'Ahora' },
    ]);
    setChatIn('');
    setTimeout(
      () =>
        setMsgs((p: any) => [
          ...p,
          {
            from: 'coach',
            text: 'Carlos lo recibió y te responde en breve 👍',
            time: 'Ahora',
          },
        ]),
      700
    );
  };
  const addInj = () => {
    if (!injF.zone) return;
    setInjuries((p: any) => [
      {
        id: Date.now(),
        date: 'Ahora',
        zone: injF.zone,
        type: injF.type,
        intens: injF.intens,
        note: injF.note,
        resolved: false,
      },
      ...p,
    ]);
    setShowInj(false);
  };
  const TABS = [
    { id: 'inicio', icon: '◉', label: 'Inicio' },
    { id: 'plan', icon: '▤', label: 'Plan' },
    { id: 'carreras', icon: '🏁', label: 'Carreras' },
    { id: 'salud', icon: '♥', label: 'Salud', badge: activeInj.length },
    { id: 'chat', icon: '◎', label: 'Entrenador' },
  ];
  if (selAct)
    return (
      <div
        style={{
          maxWidth: 390,
          margin: '0 auto',
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
          minHeight: 600,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--b0)',
        }}
      >
        <div style={{ padding: '20px 20px 0' }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 22,
              color: 'var(--t0)',
              letterSpacing: -0.4,
            }}
          >
            Actividad
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          <ActivityDetail
            act={selAct}
            onBack={() => setSelAct(null)}
            onAnalyze={null}
          />
        </div>
      </div>
    );
  return (
    <div
      style={{
        maxWidth: 390,
        margin: '0 auto',
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--b0)',
      }}
    >
      <AppHeader
        title={`Hola, ${a.name.split(' ')[0]} 👋`}
        subtitle={
          nextRace
            ? `🎯 ${nextRace.name} · ${dUntil(nextRace.date)} días`
            : undefined
        }
        dark={dark}
        onToggleDark={onToggleDark}
        onSwitch={onSwitch}
        onSignOut={onSignOut}
        rightAction={
          <Tag label={lv.icon + ' ' + lv.label} color={lv.color} pill />
        }
      />
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {tab === 'inicio' && (
          <div className="fade-up">
            {nextRace && (
              <div
                style={{
                  background: `linear-gradient(135deg,${C.blue}dd,${C.purple}cc)`,
                  borderRadius: 22,
                  padding: '18px 20px',
                  marginBottom: 14,
                  color: '#fff',
                  boxShadow: `0 8px 32px ${C.blue}44`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.75,
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    fontWeight: 700,
                  }}
                >
                  🎯 Carrera objetivo
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    marginBottom: 10,
                    letterSpacing: -0.3,
                  }}
                >
                  {nextRace.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}
                    >
                      {dUntil(nextRace.date)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.75,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                      }}
                    >
                      días
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>
                      {nextRace.dist}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>
                      Fase:{' '}
                      <strong>
                        {phase(Math.ceil(dUntil(nextRace.date) / 7))}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="rcp-card" style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{ fontWeight: 700, fontSize: 14, color: 'var(--t0)' }}
                >
                  Semana actual
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)' }}>
                  {totalKm}km · {doneSess}/{totalSess} sesiones
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {(plan as any[]).map((d: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: d.done ? C.brand : 'var(--br2)',
                      transition: 'background .3s',
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 10,
                marginBottom: 14,
              }}
            >
              {[
                ['VO2max', (a.stats as any).vo2, 'ml/kg', C.blue],
                ['Batería', (a.stats as any).bat, '%', C.green],
                ['HRV', (a.stats as any).hrv, 'ms', C.purple],
              ].map(([l, v, u, c]: any) => (
                <StatCard key={l} label={l} value={v} unit={u} color={c} />
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--t2)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              Última actividad
            </div>
            <ActCard act={acts[0]} onSelect={setSelAct as any} />
          </div>
        )}
        {tab === 'plan' && (
          <div className="fade-up">
            {(plan as any[]).map((d: any, i: number) => {
              const tc = tColor(d.type);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '13px 0',
                    borderBottom: '0.5px solid var(--br)',
                    alignItems: 'flex-start',
                  }}
                >
                  <button
                    onClick={() =>
                      setPlan((p: any) =>
                        p.map((x: any, j: number) =>
                          j === i ? { ...x, done: !x.done } : x
                        )
                      )
                    }
                    className="rcp-btn"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: d.done ? C.brand : 'none',
                      border: d.done ? 'none' : `2px solid var(--br2)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: d.done ? '#fff' : 'var(--t3)',
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {d.done ? '✓' : i + 1}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--t3)',
                        marginBottom: 3,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        fontWeight: 600,
                      }}
                    >
                      {d.day}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: d.done ? 'line-through' : 'none',
                        color: d.done ? 'var(--t3)' : 'var(--t0)',
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        marginTop: 5,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <Tag label={d.type} color={tc} sm />
                      {d.pace !== '—' && (
                        <span style={{ fontSize: 11, color: 'var(--t2)' }}>
                          {d.pace}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--t2)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  Mis actividades
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  style={{
                    background: `linear-gradient(135deg,${C.brand},${C.orange})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '7px 13px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Registrar
                </button>
              </div>
              {(acts as any[]).map((act: any) => (
                <ActCard key={act.id} act={act} onSelect={setSelAct as any} />
              ))}
            </div>
            {showAdd && (
              <AddActivityModal
                onAdd={(act: any) => {
                  setActs((p: any) => [act, ...p]);
                  setShowAdd(false);
                }}
                onClose={() => setShowAdd(false)}
              />
            )}
          </div>
        )}
        {tab === 'carreras' && (
          <div className="fade-up">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--t2)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                {(goals as any[]).length} carreras
              </div>
              <button
                onClick={() => setShowAddRace(!showAddRace)}
                className="rcp-btn"
                style={{
                  background: showAddRace ? 'var(--b2)' : C.blue,
                  color: showAddRace ? 'var(--t1)' : '#fff',
                  padding: '8px 14px',
                  fontSize: 13,
                }}
              >
                {showAddRace ? 'Cancelar' : '+ Agregar carrera'}
              </button>
            </div>
            {showAddRace && (
              <AddRaceForm
                onAdd={(g: any) => {
                  setGoals((p: any) => [...p, g]);
                  setShowAddRace(false);
                }}
                onCancel={() => setShowAddRace(false)}
              />
            )}
            {(goals as any[])
              .sort(
                (x: any, y: any) =>
                  new Date(x.date).getTime() - new Date(y.date).getTime()
              )
              .map((g: any) => (
                <RaceCard
                  key={g.id}
                  goal={g}
                  onDelete={() =>
                    setGoals((p: any) => p.filter((x: any) => x.id !== g.id))
                  }
                />
              ))}
          </div>
        )}
        {tab === 'salud' && (
          <div className="fade-up">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--t2)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Reportes de salud
              </div>
              <button
                onClick={() => setShowInj(!showInj)}
                className="rcp-btn"
                style={{
                  background: showInj ? 'var(--b2)' : C.red,
                  color: showInj ? 'var(--t1)' : '#fff',
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {showInj ? 'Cancelar' : '+ Reportar'}
              </button>
            </div>
            {showInj && (
              <div
                style={{
                  background: 'var(--b2)',
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  border: `0.5px solid ${C.red}44`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.red,
                    marginBottom: 14,
                  }}
                >
                  Nueva molestia
                </div>
                <div style={{ marginBottom: 12 }}>
                  <select
                    value={injF.zone}
                    onChange={(e: any) =>
                      setInjF((p: any) => ({ ...p, zone: e.target.value }))
                    }
                  >
                    <option value="">Seleccioná...</option>
                    {INJZONES.map((z: any) => (
                      <option key={z}>{z}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={injF.note}
                  onChange={(e: any) =>
                    setInjF((p: any) => ({ ...p, note: e.target.value }))
                  }
                  placeholder="Describí la molestia..."
                  style={{ minHeight: 72, resize: 'none', marginBottom: 12 }}
                />
                <button
                  onClick={addInj}
                  className="rcp-btn"
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg,${C.red},${C.orange})`,
                    color: '#fff',
                    padding: '12px 0',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Enviar reporte 📨
                </button>
              </div>
            )}
            {(injuries as any[]).map((inj: any) => (
              <div
                key={inj.id}
                style={{
                  background: 'var(--b1)',
                  border: `0.5px solid ${
                    inj.resolved ? C.green + '44' : C.red + '44'
                  }`,
                  borderRadius: 18,
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: 3,
                    background: inj.resolved ? C.green : C.red,
                  }}
                />
                <div style={{ padding: '13px 15px' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: 'var(--t0)',
                    }}
                  >
                    {inj.zone}
                  </div>
                  <div
                    style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}
                  >
                    {inj.date}
                  </div>
                  {inj.note && (
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--t2)',
                        lineHeight: 1.65,
                        marginTop: 6,
                      }}
                    >
                      {inj.note}
                    </div>
                  )}
                  {!inj.resolved && (
                    <button
                      onClick={() =>
                        setInjuries((p: any) =>
                          p.map((x: any) =>
                            x.id === inj.id ? { ...x, resolved: true } : x
                          )
                        )
                      }
                      style={{
                        marginTop: 10,
                        background: 'none',
                        border: `1.5px solid ${C.green}`,
                        color: C.green,
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Marcar resuelto ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'chat' && (
          <div
            className="fade-up"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 220px)',
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingBottom: 8,
              }}
            >
              {(msgs as any[]).map((m: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems:
                      m.from === 'athlete' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      background:
                        m.from === 'athlete'
                          ? `linear-gradient(135deg,${C.brand},${C.orange})`
                          : 'var(--b2)',
                      color: m.from === 'athlete' ? '#fff' : 'var(--t0)',
                      borderRadius:
                        m.from === 'athlete'
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                      padding: '11px 15px',
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                paddingTop: 10,
                borderTop: '0.5px solid var(--br)',
              }}
            >
              <input
                value={chatIn}
                onChange={(e: any) => setChatIn(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && sendChat()}
                placeholder="Escribile a tu entrenador..."
              />
              <button
                onClick={sendChat}
                disabled={!chatIn.trim()}
                style={{
                  background: chatIn.trim()
                    ? `linear-gradient(135deg,${C.brand},${C.orange})`
                    : 'var(--br2)',
                  color: chatIn.trim() ? '#fff' : 'var(--t3)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '0 18px',
                  fontSize: 20,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav tabs={TABS} active={tab} onChange={setTab} />
    </div>
  );
};

/* ══ BLOCK CARD ══════════════════════════════════════════════ */
const BlockCard = ({ block, onSelect, selected, compact }: any) => {
  const tc = BLOCK_TYPE_COLOR[block.type] || C.grey;
  const ti = BLOCK_TYPE_ICON[block.type] || '🏃';
  return (
    <div
      onClick={() => onSelect && onSelect(block)}
      style={{
        background: selected ? tc + '14' : 'var(--b2)',
        border: `1.5px solid ${selected ? tc : 'var(--br)'}`,
        borderRadius: 14,
        padding: '12px 14px',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all .15s',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: compact ? 0 : 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: tc + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {ti}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t0)' }}>
            {block.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 1 }}>
            {block.location} · Usado {block.use_count}×
          </div>
        </div>
        <Tag label={block.type} color={tc} sm />
      </div>
      {!compact && block.reps_min > 0 && (
        <div
          style={{
            background: 'var(--b3)',
            borderRadius: 8,
            padding: '5px 8px',
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: 'var(--t3)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Reps
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t0)' }}>
            {block.reps_min}–{block.reps_max}×{block.dist_m}m
          </div>
        </div>
      )}
      {!compact && block.note && (
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: C.orange,
            background: C.orange + '0e',
            borderRadius: 6,
            padding: '4px 8px',
          }}
        >
          💡 {block.note}
        </div>
      )}
    </div>
  );
};

/* ══ LIBRARY VIEW ════════════════════════════════════════════ */
const LibraryView = ({ blocks, setBlocks, setAssignBlock, setToast }: any) => {
  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const filtered =
    filter === 'all' ? blocks : blocks.filter((b: any) => b.type === filter);
  return (
    <div className="fade-up">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--t2)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {blocks.length} bloques disponibles
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{
            background: `linear-gradient(135deg,${C.brand},${C.orange})`,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Nuevo bloque
        </button>
      </div>
      <div
        style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}
      >
        {[
          'all',
          'calidad',
          'velocidad',
          'resistencia',
          'transicion',
          'fuerza',
        ].map((t) => {
          const tc = (BLOCK_TYPE_COLOR as any)[t] || C.brand;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                background: filter === t ? tc + '22' : 'none',
                border: `0.5px solid ${filter === t ? tc : 'var(--br2)'}`,
                borderRadius: 100,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: filter === t ? 700 : 400,
                cursor: 'pointer',
                color: filter === t ? tc : 'var(--t2)',
              }}
            >
              {t === 'all' ? 'Todos' : (BLOCK_TYPE_ICON as any)[t] + ' ' + t}
            </button>
          );
        })}
      </div>
      {(filtered as any[]).map((b: any) => (
        <BlockCard
          key={b.id}
          block={b}
          onSelect={(b: any) => setAssignBlock(b)}
        />
      ))}
    </div>
  );
};

/* ══ AI VIEW ════════════════════════════════════════════════ */
const AIView = ({ athletes, aiSugg, setAiSugg }: any) => (
  <div className="fade-up">
    <div
      style={{
        background: `linear-gradient(135deg,${C.purple}12,${C.blue}08)`,
        border: `0.5px solid ${C.purple}33`,
        borderRadius: 16,
        padding: '12px 14px',
        marginBottom: 14,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--t1)', lineHeight: 1.65 }}>
        ✦ La IA analizó{' '}
        <strong>{athletes.filter((a: any) => a.stats).length} atletas</strong>,
        Strava, clima y carga semanal. Revisá antes de confirmar.
      </div>
    </div>
    {aiSugg.length === 0 && (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--t0)',
            marginBottom: 8,
          }}
        >
          Todo al día
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2)' }}>
          Sin sugerencias pendientes.
        </div>
      </div>
    )}
    {(aiSugg as any[]).map((s: any) => (
      <AISuggCard
        key={s.id}
        sugg={s}
        onApprove={() =>
          setAiSugg((p: any) => p.filter((x: any) => x.id !== s.id))
        }
        onDeny={() =>
          setAiSugg((p: any) => p.filter((x: any) => x.id !== s.id))
        }
      />
    ))}
  </div>
);

/* ══ INVITE VIEW ════════════════════════════════════════════ */
const InviteView = () => {
  const [f, setF] = useState({ name: '', contact: '', plan: 'Maratón' });
  const [sent, setSent] = useState(false);
  const ok = f.name && f.contact;
  if (sent)
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: 'var(--t0)',
            marginBottom: 8,
          }}
        >
          ¡Enviado!
        </div>
        <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>
          {f.name} recibirá el link.
        </div>
        <GradBtn
          onClick={() => {
            setSent(false);
            setF({ name: '', contact: '', plan: 'Maratón' });
          }}
          style={{ padding: '13px 32px' }}
        >
          Invitar otro
        </GradBtn>
      </div>
    );
  return (
    <div className="fade-up">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { l: 'Nombre', k: 'name', p: 'Ej: Carlos Fernández' },
          { l: 'Email o WhatsApp', k: 'contact', p: 'email@ejemplo.com' },
        ].map(({ l, k, p }) => (
          <div key={k}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {l}
            </div>
            <input
              value={(f as any)[k]}
              onChange={(e: any) =>
                setF((p2: any) => ({ ...p2, [k]: e.target.value }))
              }
              placeholder={p}
            />
          </div>
        ))}
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--t2)',
              marginBottom: 5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Plan
          </div>
          <select
            value={f.plan}
            onChange={(e: any) =>
              setF((p: any) => ({ ...p, plan: e.target.value }))
            }
          >
            {[
              'Maratón',
              'Trail 21K',
              'Trail 42K',
              '10K velocidad',
              '5K principiante',
            ].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <GradBtn
          onClick={() => ok && setSent(true)}
          disabled={!ok}
          style={{ marginTop: 4 }}
        >
          Enviar invitación ↗
        </GradBtn>
      </div>
    </div>
  );
};

/* ══ ATHLETE DETAIL ═════════════════════════════════════════ */
const AthleteDetail = ({
  a,
  athletes,
  setAthletes,
  getL,
  ov,
  setOv,
  sel,
  setSel,
  selAct,
  setSelAct,
  setClaude,
  blocks,
  tab,
  setAssignBlock,
}: any) => {
  const [dt, setDt] = useState('actividades');
  const [note, setNote] = useState(a.notes || '');
  const lk = getL(a),
    lv = LEVELS[lk];
  const activeInj = (a.injuries || []).filter((i: any) => !i.resolved);
  const nextRace = (a.goals || [])
    .filter((g: any) => dUntil(g.date) > 0)
    .sort(
      (x: any, y: any) =>
        new Date(x.date).getTime() - new Date(y.date).getTime()
    )[0];
  if (selAct)
    return (
      <ActivityDetail
        act={selAct}
        onBack={() => setSelAct(null)}
        onAnalyze={() => setClaude({ act: selAct, ath: a })}
      />
    );
  return (
    <div className="fade-up">
      <BackBtn
        onClick={() => setSel(null)}
        label={tab === 'grupos' ? 'Grupos' : 'Alumnos'}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Av {...a} size={52} ring />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              color: 'var(--t0)',
              letterSpacing: -0.3,
            }}
          >
            {a.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>
            {a.age} años · {a.plan}
          </div>
        </div>
        <Tag label={lv.icon + ' ' + lv.label} color={lv.color} pill />
      </div>
      {activeInj.length > 0 && (
        <div
          style={{
            background: C.red + '0e',
            border: `0.5px solid ${C.red}44`,
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          <span style={{ fontWeight: 700, color: C.red }}>
            ⚠️ Lesión activa:{' '}
          </span>
          {activeInj.map((i: any) => i.zone).join(', ')}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          gap: 0,
          background: 'var(--b2)',
          borderRadius: 13,
          padding: 3,
          marginBottom: 14,
        }}
      >
        {['actividades', 'métricas', 'notas'].map((t) => (
          <button
            key={t}
            onClick={() => setDt(t)}
            style={{
              flex: 1,
              background: dt === t ? 'var(--b1)' : 'none',
              border: 'none',
              borderRadius: 10,
              padding: '7px 0',
              fontSize: 11,
              fontWeight: dt === t ? 700 : 400,
              color: dt === t ? 'var(--t0)' : 'var(--t2)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              letterSpacing: 0.2,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {dt === 'actividades' &&
        (!a.strava ? (
          <div
            className="rcp-card"
            style={{ textAlign: 'center', color: 'var(--t2)', padding: 30 }}
          >
            Sin Strava.
          </div>
        ) : (
          <div>
            {(a.acts || []).map((act: any) => (
              <ActCard
                key={act.id}
                act={act}
                onSelect={setSelAct}
                onAnalyze={(act: any) => setClaude({ act, ath: a })}
              />
            ))}
          </div>
        ))}
      {dt === 'métricas' &&
        (a.stats ? (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 10,
                marginBottom: 12,
              }}
            >
              {[
                ['VO2max', a.stats.vo2, 'ml/kg'],
                ['Ritmo', a.stats.pace, '/km'],
                ['HRV', a.stats.hrv, 'ms', C.purple],
                ['Batería', a.stats.bat, '%', C.green],
              ].map(([l, v, u, c]: any) => (
                <StatCard key={l} label={l} value={v} unit={u} color={c} />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rcp-card"
            style={{ textAlign: 'center', color: 'var(--t2)' }}
          >
            Sin datos Strava.
          </div>
        ))}
      {dt === 'notas' && (
        <div>
          <textarea
            value={note}
            onChange={(e: any) => setNote(e.target.value)}
            placeholder={`Notas sobre ${a.name}...`}
            style={{
              minHeight: 110,
              resize: 'vertical',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          />
          <GradBtn
            onClick={() =>
              setAthletes((p: any) =>
                p.map((x: any) => (x.id === a.id ? { ...x, notes: note } : x))
              )
            }
            style={{ width: '100%', marginTop: 10 }}
          >
            Guardar nota
          </GradBtn>
        </div>
      )}
    </div>
  );
};

/* ══ GROUPS VIEW ════════════════════════════════════════════ */
const GroupsView = ({
  athletes,
  byL,
  totalInj,
  nearRaces,
  gOpen,
  setGOpen,
  setSel,
}: any) => (
  <div className="fade-up">
    <WeatherWidget />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 8,
        marginBottom: 12,
      }}
    >
      {Object.entries(LEVELS).map(([k, lv]) => (
        <div
          key={k}
          style={{
            background: (lv as any).bg,
            border: `0.5px solid ${(lv as any).color}33`,
            borderRadius: 14,
            padding: '10px 8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 16 }}>{(lv as any).icon}</div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 21,
              color: (lv as any).color,
              lineHeight: 1,
            }}
          >
            {byL(k).length}
          </div>
          <div
            style={{
              fontSize: 9,
              color: 'var(--t2)',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontWeight: 600,
              marginTop: 3,
            }}
          >
            {(lv as any).label}
          </div>
        </div>
      ))}
    </div>
    {totalInj > 0 && (
      <div
        style={{
          background: C.red + '0e',
          border: `0.5px solid ${C.red}44`,
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 10,
          fontSize: 13,
        }}
      >
        <span style={{ fontWeight: 700, color: C.red }}>⚠️ </span>
        {(athletes as any[])
          .flatMap((a: any) =>
            (a.injuries || [])
              .filter((i: any) => !i.resolved)
              .map((i: any) => `${a.name.split(' ')[0]} (${i.zone})`)
          )
          .join(' · ')}
      </div>
    )}
    {nearRaces.length > 0 && (
      <div
        style={{
          background: C.blue + '0e',
          border: `0.5px solid ${C.blue}44`,
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 12,
          fontSize: 13,
        }}
      >
        🎯{' '}
        {(nearRaces as any[])
          .map((r: any) => `${r.who}: ${r.name} (${dUntil(r.date)}d)`)
          .join(' · ')}
      </div>
    )}
    {Object.entries(LEVELS).map(([k, lv]) => {
      const members = byL(k);
      if (!members.length) return null;
      return (
        <div
          key={k}
          style={{
            border: `0.5px solid ${(lv as any).color}33`,
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <div
            onClick={() => setGOpen((p: any) => ({ ...p, [k]: !p[k] }))}
            style={{
              background: (lv as any).bg,
              padding: '13px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: (lv as any).color + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 19,
              }}
            >
              {(lv as any).icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: (lv as any).color,
                }}
              >
                {(lv as any).label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>
                {members.length} alumnos · {(lv as any).pace}
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>
              {gOpen[k] ? '▲' : '▼'}
            </span>
          </div>
          {gOpen[k] && (
            <div style={{ background: 'var(--b1)', padding: '10px 16px' }}>
              {(members as any[]).map((a: any) => (
                <div
                  key={a.id}
                  onClick={() => setSel(a)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 0',
                    borderTop: '0.5px solid var(--br)',
                    cursor: 'pointer',
                  }}
                >
                  <Av {...a} size={38} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: 'var(--t0)',
                        }}
                      >
                        {a.name}
                      </div>
                      {(a.injuries || []).some((i: any) => !i.resolved) && (
                        <span style={{ color: C.red, fontSize: 12 }}>⚠️</span>
                      )}
                    </div>
                    {a.stats ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--t2)',
                          marginTop: 2,
                        }}
                      >
                        VO2max {a.stats.vo2} · {a.stats.pace}/km
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: C.grey }}>
                        Sin Strava
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 16, color: 'var(--t3)' }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/* ══ ATHLETES LIST VIEW ═════════════════════════════════════ */
const AthsList = ({ athletes, getL, totalInj, setSel }: any) => (
  <div className="fade-up">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 14,
      }}
    >
      {[
        { l: 'Alumnos', v: athletes.length, c: C.blue },
        {
          l: 'Con Strava',
          v: athletes.filter((a: any) => a.strava).length,
          c: C.green,
        },
        { l: 'Lesiones', v: totalInj, c: totalInj ? C.red : C.green },
      ].map((s: any) => (
        <StatCard
          key={s.l}
          label={s.l}
          value={s.v}
          unit={s.u || ''}
          color={s.c}
          large
        />
      ))}
    </div>
    {(athletes as any[]).map((a: any) => {
      const lk = getL(a),
        lv = LEVELS[lk];
      return (
        <div
          key={a.id}
          onClick={() => setSel(a)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 0',
            borderBottom: '0.5px solid var(--br)',
            cursor: 'pointer',
          }}
        >
          <Av {...a} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{ fontWeight: 700, fontSize: 14, color: 'var(--t0)' }}
              >
                {a.name}
              </div>
              {(a.injuries || []).some((i: any) => !i.resolved) && (
                <span style={{ color: C.red, fontSize: 12 }}>⚠️</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 1 }}>
              {a.plan}
            </div>
          </div>
          <Tag
            label={(lv as any).icon + ' ' + (lv as any).label}
            color={(lv as any).color}
            sm
            pill
          />
        </div>
      );
    })}
  </div>
);

/* ══ COACH ONBOARDING ═══════════════════════════════════════ */
const CoachOnboarding = ({ dark, onToggleDark, onComplete, onBack }: any) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('pro');
  const canStep1 = name.trim().length > 1 && email.includes('@');
  const STEPS = ['Perfil', 'Plan', '¡Listo!'];
  const handleFinish = () => {
    const trial = mkTrialDates();
    onComplete({ name: name.trim(), email: email.trim(), plan, trial });
  };
  return (
    <div
      style={{
        maxWidth: 440,
        margin: '0 auto',
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'var(--b0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle,${C.brand}18,transparent 70%)`,
          animation: 'orb 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <button
          onClick={onToggleDark}
          style={{
            background: 'var(--b2)',
            border: '0.5px solid var(--br2)',
            borderRadius: 20,
            padding: '7px 12px',
            fontSize: 16,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 22,
            left: 24,
            background: 'none',
            border: 'none',
            color: C.brand,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          ‹ Volver
        </button>
      )}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: `linear-gradient(135deg,${C.brand},${C.orange})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            margin: '0 auto 14px',
            boxShadow: `0 6px 24px ${C.brand}44`,
          }}
        >
          🏃
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: -0.4,
            color: 'var(--t0)',
          }}
        >
          Crear cuenta de entrenador
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 5 }}>
          Configuración inicial · 1 minuto
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: i < STEPS.length - 1 ? 1 : 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background:
                    step > i + 1
                      ? C.green
                      : step === i + 1
                      ? C.brand
                      : 'var(--b3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: step >= i + 1 ? '#fff' : 'var(--t3)',
                  flexShrink: 0,
                }}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: step === i + 1 ? 700 : 400,
                  color: step === i + 1 ? 'var(--t0)' : 'var(--t3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: step > i + 1 ? C.green : 'var(--br2)',
                  margin: '0 8px',
                }}
              />
            )}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div
          className="fade-up"
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 6,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Tu nombre
            </div>
            <input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="Ej: Carlos López"
              autoFocus
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--t2)',
                marginBottom: 6,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Email
            </div>
            <input
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              placeholder="carlos@tucorreo.com"
              type="email"
            />
          </div>
          <GradBtn
            onClick={() => canStep1 && setStep(2)}
            disabled={!canStep1}
            style={{ marginTop: 6 }}
          >
            Siguiente →
          </GradBtn>
        </div>
      )}
      {step === 2 && (
        <div className="fade-up">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'free', label: 'Free', price: 'Gratis', icon: '🌱' },
              { id: 'starter', label: 'Starter', price: '$12/mes', icon: '📈' },
              { id: 'pro', label: 'Pro', price: '$29/mes', icon: '⚡' },
            ].map((p: any) => (
              <div
                key={p.id}
                onClick={() => setPlan(p.id)}
                style={{
                  background: plan === p.id ? C.brand + '14' : 'var(--b2)',
                  border: `1.5px solid ${
                    plan === p.id ? C.brand : 'var(--br)'
                  }`,
                  borderRadius: 18,
                  padding: '15px 16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: 'var(--t0)',
                      }}
                    >
                      {p.label}{' '}
                      <span style={{ fontSize: 12, color: C.brand }}>
                        {p.price}
                      </span>
                    </div>
                  </div>
                  {plan === p.id && (
                    <span style={{ color: C.brand, fontWeight: 700 }}>✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setStep(1)}
              className="rcp-btn rcp-btn-secondary"
              style={{ flex: 1, padding: '13px 0', fontSize: 14 }}
            >
              ← Atrás
            </button>
            <GradBtn onClick={() => setStep(3)} style={{ flex: 2 }}>
              Continuar →
            </GradBtn>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="fade-up" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 20,
              color: 'var(--t0)',
              letterSpacing: -0.3,
              marginBottom: 8,
            }}
          >
            ¡Todo listo, {name.split(' ')[0]}!
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={() => setStep(2)}
              className="rcp-btn rcp-btn-secondary"
              style={{ flex: 1, padding: '13px 0', fontSize: 14 }}
            >
              ← Atrás
            </button>
            <GradBtn onClick={handleFinish} style={{ flex: 2 }}>
              Crear cuenta →
            </GradBtn>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══ ASSIGN BLOCK MODAL ═════════════════════════════════════ */
const AssignBlockModal = ({ block, athletes, onConfirm, onClose }: any) => {
  const [step, setStep] = useState(1);
  const [selIds, setSelIds] = useState<number[]>([]);
  const [selDay, setSelDay] = useState<number | null>(null);
  const tc = BLOCK_TYPE_COLOR[block.type] || C.grey;
  const toggle = (id: number) =>
    setSelIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const handleConfirm = () => {
    if (!selIds.length || selDay === null) return;
    selIds.forEach((id) => onConfirm(id, selDay, block));
    onClose();
  };
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.65)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 400,
        backdropFilter: 'blur(5px)',
      }}
      onClick={(e: any) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--b1)',
          borderRadius: '22px 22px 0 0',
          width: '100%',
          maxWidth: 440,
          padding: '8px 20px 36px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp .3s ease',
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: 'var(--br2)',
            borderRadius: 2,
            margin: '12px auto 16px',
          }}
        />
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--t0)',
            marginBottom: 12,
          }}
        >
          Asignar: {block.name}
        </div>
        {step === 1 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              Seleccioná atletas
            </div>
            {(athletes as any[]).map((a: any) => {
              const isSel = selIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 14,
                    marginBottom: 8,
                    border: `1.5px solid ${isSel ? C.brand : 'var(--br)'}`,
                    background: isSel ? C.brand + '0e' : 'var(--b2)',
                    cursor: 'pointer',
                  }}
                >
                  <Av {...a} size={38} ring={isSel} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: 'var(--t0)',
                      }}
                    >
                      {a.name}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: isSel ? C.brand : 'none',
                      border: isSel ? 'none' : '2px solid var(--br2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {isSel ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {step === 2 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              ¿Qué día de la semana?
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                gap: 8,
              }}
            >
              {DAY_NAMES.map((day, i) => {
                const isSel = selDay === i;
                return (
                  <button
                    key={day}
                    onClick={() => setSelDay(i)}
                    className="rcp-btn"
                    style={{
                      background: isSel ? C.brand + '18' : 'var(--b2)',
                      border: `1.5px solid ${isSel ? C.brand : 'var(--br)'}`,
                      borderRadius: 12,
                      padding: '12px 14px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: isSel ? C.brand : C.brand + '14',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        color: isSel ? '#fff' : C.brand,
                        flexShrink: 0,
                      }}
                    >
                      {DAYS[i]}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isSel ? 700 : 500,
                        color: isSel ? 'var(--t0)' : 'var(--t1)',
                      }}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: 10,
            paddingTop: 14,
            borderTop: '0.5px solid var(--br)',
            flexShrink: 0,
            marginTop: 8,
          }}
        >
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="rcp-btn rcp-btn-secondary"
            style={{ flex: 1, padding: '13px 0', fontSize: 14 }}
          >
            {step === 1 ? 'Cancelar' : '← Atrás'}
          </button>
          {step === 1 && (
            <GradBtn
              onClick={() => {
                if (selIds.length) setStep(2);
              }}
              disabled={!selIds.length}
              style={{ flex: 2 }}
            >
              Elegir día →
            </GradBtn>
          )}
          {step === 2 && (
            <GradBtn
              onClick={handleConfirm}
              disabled={selDay === null}
              style={{ flex: 2 }}
            >
              ✓ Asignar
            </GradBtn>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══ COACH APP ══════════════════════════════════════════════ */

/* ══ ACTION PARSER ══════════════════════════════════════════ */
const handleActionParser = (raw: string) => {
  const RE = /\[ACTION:\s*(\{[\s\S]*?\})\]/g;
  let action: any = null;
  for (const m of [...raw.matchAll(RE)]) {
    try {
      const p = JSON.parse(m[1]);
      if (p.type && p.payload) {
        action = p;
        break;
      }
    } catch {}
  }
  return {
    cleanText: raw
      .replace(RE, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
    action,
  };
};

/* ══ CLAUDE CHAT ════════════════════════════════════════════ */

/* ══ ACTION CONFIRM CARD ════════════════════════════════════════ */
const ActionConfirmCard=({action,athletes,onConfirm,onDiscard})=>{
  const[state,setState]=useState("pending");
  const ath=athletes.find(a=>String(a.id)===String(action.payload?.athleteId));
  const COLOR={UPDATE_PLAN:C.blue,SWAP_DAYS:C.orange,REST_DAY:C.grey,ADD_NOTE:C.green};
  const ICON={UPDATE_PLAN:"✏️",SWAP_DAYS:"🔄",REST_DAY:"💤",ADD_NOTE:"📝"};
  const LABEL={UPDATE_PLAN:"Modificar sesión",SWAP_DAYS:"Intercambiar días",REST_DAY:"Descanso",ADD_NOTE:"Agregar nota"};
  const accent=COLOR[action.type]||C.purple;
  const p=action.payload;
  const describe=()=>{
    const who=ath?.name?.split(" ")[0]||"Atleta";
    const day=DAY_NAMES[p.dayIndex]||"Día "+p.dayIndex;
    if(action.type==="UPDATE_PLAN")return day+" de "+who+' → "'+(p.newSession?.name||"nueva sesión")+'"';
    if(action.type==="SWAP_DAYS")return who+": "+DAY_NAMES[p.dayA]+" ↔ "+DAY_NAMES[p.dayB];
    if(action.type==="REST_DAY")return day+" de "+who+" → Descanso activo";
    if(action.type==="ADD_NOTE")return "Nota en "+day+" de "+who;
    return action.type;
  };
  if(state==="applied")return(
    <div style={{display:"flex",alignItems:"center",gap:8,background:C.green+"0e",border:"0.5px solid "+C.green+"44",borderRadius:12,padding:"9px 14px",marginTop:8,animation:"fadeUp .2s ease"}}>
      <span>✓</span><span style={{fontSize:12,color:C.green,fontWeight:700}}>Cambio aplicado al plan</span>
    </div>
  );
  if(state==="discarded")return(
    <div style={{background:"var(--b2)",borderRadius:12,padding:"7px 14px",marginTop:8}}>
      <span style={{fontSize:11,color:"var(--t3)"}}>Sugerencia descartada</span>
    </div>
  );
  return(
    <div style={{marginTop:10,borderRadius:16,overflow:"hidden",border:"1px solid "+accent+"44",background:"linear-gradient(135deg,"+accent+"08,var(--b2))",animation:"fadeUp .3s ease"}}>
      <div style={{height:3,background:"linear-gradient(90deg,"+accent+","+accent+"66)"}}/>
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{ICON[action.type]||"⚡"}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,color:accent,marginBottom:3}}>Sugerencia del asistente</div>
            <div style={{fontSize:12,color:"var(--t1)",fontWeight:600,lineHeight:1.5}}>{describe()}</div>
          </div>
          <span style={{background:accent+"18",color:accent,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700}}>{LABEL[action.type]}</span>
        </div>
        {action.type==="UPDATE_PLAN"&&p.newSession&&(
          <div style={{background:"var(--b3)",borderRadius:10,padding:"8px 12px",marginBottom:10,borderLeft:"3px solid "+accent}}>
            <div style={{fontSize:11,color:"var(--t0)",fontWeight:700}}>{p.newSession.name}</div>
            <div style={{fontSize:11,color:"var(--t2)",marginTop:3}}>
              {p.newSession.type}
              {p.newSession.pace&&<span style={{color:C.blue,marginLeft:10}}>{p.newSession.pace}</span>}
              {p.newSession.dur&&<span style={{color:"var(--t3)",marginLeft:10}}>{p.newSession.dur}</span>}
            </div>
            {p.newSession.notes&&<div style={{fontSize:10,color:C.orange,marginTop:5,background:C.orange+"0e",borderRadius:6,padding:"3px 8px"}}>💡 {p.newSession.notes}</div>}
          </div>
        )}
        {ath&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Av {...ath} size={20}/><span style={{fontSize:11,color:"var(--t2)"}}>{ath.name}</span></div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setState("discarded");onDiscard();}} className="rcp-btn rcp-btn-ghost" style={{flex:1,padding:"9px 0",fontSize:12,fontWeight:600}}>✕ Descartar</button>
          <button onClick={()=>{setState("applying");setTimeout(()=>{onConfirm(action);setState("applied");},320);}} disabled={state==="applying"} className="rcp-btn" style={{flex:2,padding:"9px 0",fontSize:13,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,"+accent+","+accent+"cc)",boxShadow:"0 4px 14px "+accent+"44"}}>
            {state==="applying"?"Aplicando…":"✓ Confirmar cambio"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══ CLAUDE CHAT ════════════════════════════════════════════════ */
const ClaudeChat=({athletes,preAct,onClose,onApplyAction,coachName="Coach"})=>{
const[msgs,setMsgs]=useState([]);
const[input,setInput]=useState(""),[loading,setLoading]=useState(false);
const[pendingAction,setPendingAction]=useState(null);
const end=useRef(null);

const handleConfirmAction=(action)=>{onApplyAction?.(action);setPendingAction(null);};

const buildSys=()=>"Sos entrenador experto en running, trail y maratones. Respondé en español, de forma concisa y práctica.\nALUMNOS:\n"+athletes.filter(a=>a.stats).map(a=>{const lk=lvlOf(a),nr=(a.goals||[]).filter(g=>dUntil(g.date)>0).sort((x,y)=>new Date(x.date)-new Date(y.date))[0];return a.name+"("+LEVELS[lk].label+"):VO2max "+a.stats.vo2+",ritmo "+a.stats.pace+"/km,"+(a.stats.wkm.reduce((s,v)=>s+v,0))+"km/sem"+(nr?",carrera:"+nr.name+" en "+dUntil(nr.date)+"d":"")+(((a.injuries||[]).some(i=>!i.resolved))?" LESION":"");}).join("\n");

useEffect(()=>{
  const intro=preAct?"Analizando actividad de "+preAct.ath.name+"...":"Hola! Tengo datos de "+athletes.filter(a=>a.stats).length+" alumnos. ¿Qué analizamos?";
  setMsgs([{r:"a",t:intro}]);
  if(preAct)setTimeout(()=>callAI(buildQ(preAct),[]),400);
},[]);

useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

const buildQ=({act,ath})=>{
  const lk=lvlOf(ath),lv=LEVELS[lk],nr=(ath.goals||[]).filter(g=>dUntil(g.date)>0).sort((x,y)=>new Date(x.date)-new Date(y.date))[0];
  return "Analiza actividad de "+ath.name+"("+lv.label+",plan:"+lv.pace+(nr?",objetivo:"+nr.name+" en "+dUntil(nr.date):"")+"): "+act.type+"|"+act.dist+"km|"+act.time+"|"+act.pace+"/km|FC:"+act.hr+"bpm|+"+act.elev+"m Zonas:"+act.zones.map((z,i)=>"Z"+(i+1)+"="+z).join(",")+" Splits:"+act.splits.map(s=>"km"+s.km+"→"+s.pace+"@"+s.hr+"bp").join(",");
};

const callAI=async(txt,hist)=>{
  const isComplex=(msg)=>{
    const kw=['strava','modifica','modific','cambi','cambiar','ajust','ajusta','actualiz','entrenamiento','plan','calendar','seman','jornada','descans','interval','[action','action','analiz','rendi','carga','volumen','intensidad','pico','competi','macro','mesociclo','periodiza','tapering','reduce','aumenta','agrega','quita','mueve','reemplaz','sustituye','borra','elimina'];
    const lower=msg.toLowerCase();
    return kw.some(k=>lower.includes(k));
  };
  const complex=isComplex(txt);
  const model=complex?'claude-3-5-sonnet-20241022':'claude-haiku-4-20250514';
  const maxTok=complex?2000:600;
  setLoading(complex?'🧠 Analizando datos de rendimiento...':'💬 El asistente está pensando...');
  try{
    const r=await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`},
      body:JSON.stringify({model,max_tokens:maxTok,system:buildSys(),messages:[...hist,{role:'user',content:txt}]})
    });
    });
    const d=await r.json();
    const rawText=d.content?.find(b=>b.type==="text")?.text||"Error de conexión.";
    const ACTION_RE=/\[ACTION:\s*(\{[\s\S]*?\})\]/g;
    let action=null;
    for(const match of [...rawText.matchAll(ACTION_RE)]){
      try{const parsed=JSON.parse(match[1]);if(parsed.type&&parsed.payload){action=parsed;break;}}catch(e){}
    }
    const cleanText=rawText.replace(ACTION_RE,"").replace(/\n{3,}/g,"\n\n").trim();
    let newIdx;
    setMsgs(p=>{newIdx=p.length;return[...p,{r:"a",t:cleanText,hasAction:!!action}];});
    if(action)setPendingAction({action,msgIndex:newIdx});
  }catch{setMsgs(p=>[...p,{r:"a",t:"Error de conexión. Verificá tu API key."}]);}
  setLoading(false);
};

const send=async()=>{
  if(!input.trim()||loading)return;
  setPendingAction(null);
  const t=input.trim();
  setInput("");
  const hist=msgs.slice(1).map(mm=>({role:mm.r==="a"?"assistant":"user",content:mm.t}));
  setMsgs(p=>[...p,{r:"u",t}]);
  await callAI(t,hist);
};

const SUGG=preAct?[]:["¿Quién está en riesgo de sobreentrenamiento?","Lesiones activas en el equipo","Carreras próximas — ajustar carga","Plan semanal por grupos"];

const handleApplyAction=useCallback((action)=>{
  const{type,payload:p}=action;
  setAthletes(prev=>prev.map(a=>{
    if(String(a.id)!==String(p.athleteId))return a;
    const plan=[...(a.weekPlan||mkPlan(getL(a)))];
    switch(type){
      case"UPDATE_PLAN":{const idx=Number(p.dayIndex);if(idx<0||idx>6)return a;const s=p.newSession||{};plan[idx]={...plan[idx],name:s.name||plan[idx].name,type:s.type||plan[idx].type,pace:s.pace||plan[idx].pace,dur:s.dur||plan[idx].dur,notes:s.notes||plan[idx].notes,aiEdit:{ts:Date.now()}};return{...a,weekPlan:plan};}
      case"SWAP_DAYS":{const A=Number(p.dayA),B=Number(p.dayB);if(A===B||A<0||B>6)return a;[plan[A],plan[B]]=[{...plan[B],day:plan[A].day},{...plan[A],day:plan[B].day}];return{...a,weekPlan:plan};}
      case"REST_DAY":{const idx=Number(p.dayIndex);if(idx<0||idx>6)return a;plan[idx]={...plan[idx],name:"Descanso activo",type:"Descanso",pace:"Caminata suave",dur:"30min",notes:p.reason||"Ajuste IA",aiEdit:{ts:Date.now()}};return{...a,weekPlan:plan};}
      case"ADD_NOTE":{const idx=Number(p.dayIndex);if(idx<0||idx>6)return a;plan[idx]={...plan[idx],notes:p.note,aiEdit:{ts:Date.now()}};return{...a,weekPlan:plan};}
      default:return a;
    }
  }));
  setToast("✓ Plan actualizado por el asistente");
},[getL]);


return(
<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:400,backdropFilter:"blur(6px)"}}>
<div style={{background:"var(--b1)",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:440,height:"88vh",display:"flex",flexDirection:"column",animation:"slideUp .3s ease",borderTop:"1px solid "+C.purple+"33"}}>
<div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:"0.5px solid var(--br)",flexShrink:0}}>
<div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,"+C.purple+","+C.blue+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff",boxShadow:"0 4px 14px "+C.purple+"55"}}>✦</div>
<div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:"var(--t0)"}}>Claude AI</div><div style={{fontSize:11,color:"var(--t2)"}}>{preAct?"Actividad de "+preAct.ath.name:athletes.filter(a=>a.stats).length+" alumnos"}</div></div>
<button onClick={onClose} style={{background:"var(--b2)",border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",color:"var(--t2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
</div>
<div style={{flex:1,overflowY:"auto",padding:"14px 16px 8px",display:"flex",flexDirection:"column",gap:10}}>
{msgs.map((mm,i)=>(
<div key={i} style={{display:"flex",flexDirection:"column",alignItems:mm.r==="u"?"flex-end":"flex-start",animation:"fadeUp .25s ease"}}>
<div style={{maxWidth:"88%",background:mm.r==="u"?"linear-gradient(135deg,"+C.brand+","+C.orange+")":"var(--b2)",color:mm.r==="u"?"#fff":"var(--t0)",borderRadius:mm.r==="u"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"11px 15px",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",boxShadow:mm.r==="u"?"0 4px 16px "+C.brand+"44":"var(--shsm)"}}>{mm.t}</div>
{mm.r!=="u"&&pendingAction?.msgIndex===i&&(
<div style={{maxWidth:"92%",width:"100%"}}>
<ActionConfirmCard action={pendingAction.action} athletes={athletes} onConfirm={handleConfirmAction} onDiscard={()=>setPendingAction(null)}/>
</div>
)}
</div>
))}
{loading&&<div style={{display:"flex",gap:6,padding:"11px 15px",background:"var(--b2)",borderRadius:"18px 18px 18px 4px",width:"fit-content"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--t2)",animation:"pp 1s "+(i*.3)+"s infinite"}}/>)}<span style={{fontSize:11,color:"var(--t2)",marginTop:6,fontStyle:"italic",display:"block"}}>{typeof loading==='string'?loading:''}</span></div>}
<div ref={end}/>
</div>
{SUGG.length>0&&msgs.length<=1&&<div style={{padding:"0 16px 8px",display:"flex",flexWrap:"wrap",gap:6}}>{SUGG.map(s=><button key={s} onClick={()=>setInput(s)} style={{background:"var(--b2)",border:"0.5px solid var(--br2)",borderRadius:100,padding:"7px 14px",fontSize:12,cursor:"pointer",color:"var(--t1)",fontWeight:500}}>{s}</button>)}</div>}
<div style={{padding:"10px 16px 28px",display:"flex",gap:8,borderTop:"0.5px solid var(--br)",flexShrink:0}}>
<input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Preguntá sobre tus alumnos…"/>
<button onClick={send} disabled={!input.trim()||loading} style={{background:input.trim()&&!loading?"linear-gradient(135deg,"+C.purple+","+C.blue+")":"var(--br2)",color:input.trim()&&!loading?"#fff":"var(--t3)",border:"none",borderRadius:12,padding:"0 18px",fontSize:18,cursor:"pointer",flexShrink:0,transition:"all .2s"}}>↑</button>
</div>
</div>
</div>
);
};


const CoachApp = ({ onSwitch, dark, onToggleDark, onSignOut, auth }: any) => {
  const [tab, setTab] = useState('grupos');
  const [athletes, setAthletes] = useState(ATHLETES);
  const [blocks, setBlocks] = useState(BLOCKS_INIT);
  const [sel, setSel] = useState<any>(null);
  const [selAct, setSelAct] = useState<any>(null);
  const [claude, setClaude] = useState<any>(null);
  const [ov, setOv] = useState<any>({});
  const [gOpen, setGOpen] = useState({
    elite: true,
    avanzado: true,
    intermedio: true,
    inicial: true,
  });
  const [aiSugg, setAiSugg] = useState(AI_SUGG_INIT);
  const [assignBlock, setAssignBlock] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  const getL = (a: any) => ov[a.id] || lvlOf(a);
  const byL = (lk: string) => athletes.filter((a) => getL(a) === lk);
  const totalInj = athletes.reduce(
    (s, a) => s + (a.injuries || []).filter((i: any) => !i.resolved).length,
    0
  );
  const nearRaces = athletes.flatMap((a) =>
    (a.goals || [])
      .filter((g: any) => dUntil(g.date) > 0 && dUntil(g.date) <= 30)
      .map((g: any) => ({ ...g, who: a.name.split(' ')[0] }))
  );

  const sub = mkSubscription(auth);
  const ePlan = getEffectivePlan(sub);
  const isFree = ePlan === 'free';

  const handleAssignBlock = (athleteId: any, dayIndex: number, block: any) => {
    setAthletes((prev) =>
      prev.map((a: any) => {
        if (a.id !== athleteId) return a;
        const plan = a.weekPlan || mkPlan(getL(a));
        const updated = plan.map((d: any, i: number) =>
          i === dayIndex
            ? {
                ...d,
                name: block.name,
                type: 'Calidad',
                pace:
                  block.pace_min && block.pace_max
                    ? `${block.pace_min}–${block.pace_max}`
                    : d.pace,
                notes: block.note || d.notes,
              }
            : d
        );
        return { ...a, weekPlan: updated };
      })
    );
    setToast(`✓ "${block.name}" → ${DAY_NAMES[dayIndex]}`);
  };

  const totalKm = athletes
    .filter((a) => a.stats)
    .reduce(
      (s, a) =>
        s + (a.stats as any).wkm.reduce((x: number, y: number) => x + y, 0),
      0
    );
  const TABS = [
    { id: 'grupos', icon: '▤', label: 'Grupos' },
    { id: 'alumnos', icon: '◎', label: 'Alumnos' },
    { id: 'biblioteca', icon: '📚', label: 'Biblioteca' },
    { id: 'ia', icon: '✦', label: 'IA', badge: aiSugg.length },
    { id: 'invitar', icon: '+', label: 'Invitar' },
  ];

  return (
    <div
      style={{
        maxWidth: 440,
        margin: '0 auto',
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--b0)',
      }}
    >
      <AppHeader
        title={
          sel
            ? 'Alumno'
            : tab === 'grupos'
            ? 'Grupos'
            : tab === 'alumnos'
            ? 'Alumnos'
            : tab === 'biblioteca'
            ? 'Biblioteca'
            : tab === 'ia'
            ? 'IA Copiloto'
            : 'Invitar'
        }
        subtitle={
          athletes.length +
          ' alumnos · ' +
          totalKm +
          'km/sem' +
          (totalInj > 0
            ? ' · ⚠️' + totalInj + ' lesión' + (totalInj > 1 ? 'es' : '')
            : '')
        }
        dark={dark}
        onToggleDark={onToggleDark}
        onSwitch={onSwitch}
        onSignOut={onSignOut}
        rightAction={
          <button
            onClick={() => setClaude('general')}
            style={{
              background: isFree
                ? 'var(--b2)'
                : `linear-gradient(135deg,${C.purple},${C.blue})`,
              color: isFree ? 'var(--t2)' : '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✦ Claude{isFree ? ' 🔒' : ''}
          </button>
        }
      />
      {!sel && (
        <div
          style={{
            padding: '8px 20px 0',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <SubscriptionStatus subscription={sub} onUpgrade={() => {}} />
        </div>
      )}
      <TrialBanner subscription={sub} onUpgrade={() => {}} />
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {sel ? (
          <AthleteDetail
            a={athletes.find((a: any) => a.id === sel.id) || sel}
            athletes={athletes}
            setAthletes={setAthletes}
            getL={getL}
            ov={ov}
            setOv={setOv}
            sel={sel}
            setSel={setSel}
            selAct={selAct}
            setSelAct={setSelAct}
            setClaude={setClaude}
            blocks={blocks}
            tab={tab}
            setAssignBlock={setAssignBlock}
          />
        ) : tab === 'grupos' ? (
          <GroupsView
            athletes={athletes}
            byL={byL}
            totalInj={totalInj}
            nearRaces={nearRaces}
            gOpen={gOpen}
            setGOpen={setGOpen}
            setSel={setSel}
          />
        ) : tab === 'alumnos' ? (
          <AthsList
            athletes={athletes}
            getL={getL}
            totalInj={totalInj}
            setSel={setSel}
          />
        ) : tab === 'biblioteca' ? (
          <LibraryView
            blocks={blocks}
            setBlocks={setBlocks}
            setAssignBlock={setAssignBlock}
            setToast={setToast}
          />
        ) : tab === 'ia' ? (
          <PlanGate allowed={!isFree} label="IA Copiloto — Plan Starter o Pro">
            <AIView athletes={athletes} aiSugg={aiSugg} setAiSugg={setAiSugg} />
          </PlanGate>
        ) : (
          <InviteView />
        )}
      </div>
      <BottomNav
        tabs={TABS}
        active={tab}
        onChange={(t: any) => {
          setTab(t);
          setSel(null);
          setSelAct(null);
        }}
        noActive={!!sel}
      />
      {assignBlock && (
        <AssignBlockModal
          block={assignBlock}
          athletes={athletes}
          onConfirm={handleAssignBlock}
          onClose={() => setAssignBlock(null)}
        />
      )}
      {claude && (
        <ClaudeChat
          athletes={athletes}
          preAct={claude !== 'general' ? claude : null}
          onClose={() => setClaude(null)}
          coachName={auth?.name?.split(' ')[0] || 'Coach'}
          onApplyAction={handleApplyAction}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
};

/* ══ ROOT ═══════════════════════════════════════════════════ */
export default function App() {
  const [dark, setDark] = useState(true);
  const [entryRole, setEntryRole] = useState<string | null>(null);
  const [auth, setAuth] = useState<any>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY + '_auth');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });
  const toggle = () => setDark((d) => !d);
  const handleSignOut = () => {
    try {
      localStorage.removeItem(LS_KEY + '_auth');
    } catch (e) {}
    setAuth(null);
    setEntryRole(null);
  };
  const handleOnboardingComplete = (data: any) => {
    const fullAuth = { ...data, role: 'coach', ts: Date.now() };
    try {
      localStorage.setItem(LS_KEY + '_auth', JSON.stringify(fullAuth));
    } catch (e) {}
    setAuth(fullAuth);
  };
  const handleAthleteEntry = (athleteName: string) => {
    const a = {
      role: 'athlete',
      name: athleteName,
      plan: 'pro',
      trial: mkTrialDates(),
      ts: Date.now(),
    };
    setAuth(a);
    setEntryRole('athlete');
  };
  const needsOnboarding = entryRole === 'coach' && !auth;
  const vars = TV(dark);
  return (
    <div
      style={{
        ...(vars as any),
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
        minHeight: '100vh',
        background: 'var(--b0)',
        color: 'var(--t0)',
      }}
    >
      <GlobalCSS />
      {!entryRole && (
        <EntryScreen
          dark={dark}
          onToggleDark={toggle}
          onCoach={() => setEntryRole('coach')}
          onAthlete={handleAthleteEntry}
        />
      )}
      {entryRole === 'coach' && needsOnboarding && (
        <CoachOnboarding
          dark={dark}
          onToggleDark={toggle}
          onComplete={handleOnboardingComplete}
          onBack={() => setEntryRole(null)}
        />
      )}
      {entryRole === 'coach' && !needsOnboarding && (
        <CoachApp
          onSwitch={() => {
            setAuth(null);
            setEntryRole(null);
          }}
          dark={dark}
          onToggleDark={toggle}
          onSignOut={handleSignOut}
          auth={auth}
        />
      )}
      {entryRole === 'athlete' && (
        <AthleteApp
          onSwitch={() => setEntryRole(null)}
          dark={dark}
          onToggleDark={toggle}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}
