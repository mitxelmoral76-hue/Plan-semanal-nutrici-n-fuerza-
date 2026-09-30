import type { Answers, Exercise, Goal, Nutrition, Training, TrainingDay, Meal } from "./types";
import { DAYS } from "./types";

export function ageFrom(birthdate: string): number {
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return 25;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

const ACTIVITY: Record<Answers["job"], number> = { sedentario: 1.2, mixto: 1.35, activo: 1.5 };

export function targets(a: Answers) {
  const age = ageFrom(a.birthdate);
  // Mifflin-St Jeor
  const bmr = 10 * a.weight + 6.25 * a.height - 5 * age + (a.sex === "hombre" ? 5 : -161);
  const trainBonus = 1 + Math.min(a.daysPerWeek, 6) * 0.03;
  const tdee = bmr * ACTIVITY[a.job] * (a.want === "dieta" ? 1.05 : trainBonus);
  const adj: Record<Goal, number> = {
    "perder-grasa": 0.8,
    "ganar-musculo": 1.1,
    recomposicion: 0.97,
    rendimiento: 1.03,
  };
  const kcal = Math.round((tdee * adj[a.goal]) / 10) * 10;
  const protein = Math.round(a.weight * (a.goal === "perder-grasa" ? 2.1 : 1.9));
  const fat = Math.round(a.weight * 0.9);
  const carbs = Math.max(80, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

// ---------- Dieta ----------
interface Food {
  name: string;
  p: number;
  c: number;
  f: number;
  unit?: { label: string; grams: number };
}
const PROT_MAIN: Food[] = [
  { name: "pechuga de pollo", p: 23, c: 0, f: 2 },
  { name: "ternera magra", p: 21, c: 0, f: 5 },
  { name: "merluza o bacalao", p: 18, c: 0, f: 1 },
  { name: "salmón", p: 20, c: 0, f: 12 },
  { name: "pavo", p: 22, c: 0, f: 2 },
  { name: "atún al natural", p: 25, c: 0, f: 1 },
  { name: "huevos", p: 13, c: 1, f: 11, unit: { label: "huevos", grams: 60 } },
];
const PROT_LIGHT: Food[] = [
  { name: "skyr o yogur griego natural", p: 10, c: 4, f: 0.5 },
  { name: "huevos", p: 13, c: 1, f: 11, unit: { label: "huevos", grams: 60 } },
  { name: "queso fresco batido 0%", p: 8, c: 4, f: 0.2 },
];
const CARB_MAIN: Food[] = [
  { name: "patata cocida", p: 2, c: 18, f: 0 },
  { name: "boniato asado", p: 1.6, c: 20, f: 0 },
  { name: "arroz cocido", p: 2.7, c: 28, f: 0.3 },
  { name: "patata cocida", p: 2, c: 18, f: 0 },
  { name: "boniato asado", p: 1.6, c: 20, f: 0 },
  { name: "legumbres cocidas", p: 7, c: 17, f: 1 },
  { name: "arroz cocido", p: 2.7, c: 28, f: 0.3 },
];
const CARB_BREAKFAST: Food[] = [
  { name: "copos de avena", p: 13, c: 60, f: 7 },
  { name: "boniato asado", p: 1.6, c: 20, f: 0 },
  { name: "copos de avena", p: 13, c: 60, f: 7 },
  { name: "plátano", p: 1, c: 23, f: 0.3 },
  { name: "copos de avena", p: 13, c: 60, f: 7 },
  { name: "patata cocida", p: 2, c: 18, f: 0 },
  { name: "fruta de temporada", p: 0.7, c: 12, f: 0.2 },
];
const VEG = ["ensalada variada", "verdura salteada", "brócoli o coliflor", "menestra de verduras", "ensalada variada", "verdura a la plancha", "crema de verduras"];

const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

function mealTimes(a: Answers, count: number): string[] {
  const wake = "08:00";
  const table: Record<number, string[]> = {
    3: [wake, "14:00", "21:00"],
    4: [wake, "14:00", "17:30", "21:00"],
    5: [wake, "11:00", "14:00", "17:30", "21:00"],
    6: [wake, "11:00", "14:00", "17:00", "19:30", "21:30"],
  };
  const t = table[Math.min(6, Math.max(3, count))];
  // Con jornada partida/tarde evitamos comidas en medio del trabajo: aproximación simple
  return a.workStart >= "14:00" ? t.map((x, i) => (i === 0 ? "09:00" : x)) : t;
}

function dist(count: number): number[] {
  const d: Record<number, number[]> = {
    3: [0.27, 0.40, 0.33],
    4: [0.25, 0.35, 0.15, 0.25],
    5: [0.2, 0.1, 0.32, 0.13, 0.25],
    6: [0.2, 0.1, 0.27, 0.13, 0.05, 0.25],
  };
  return d[Math.min(6, Math.max(3, count))];
}

function line(food: Food, grams: number): string {
  if (food.unit) {
    const n = Math.max(1, Math.round(grams / food.unit.grams));
    return `${n} ${food.unit.label}`;
  }
  return `${round5(grams)} g de ${food.name}`;
}

function buildMeal(
  name: string,
  time: string,
  kcalShare: number,
  n: Nutrition,
  kind: "breakfast" | "main" | "snack" | "dinner",
  day: number,
  avoid: string[],
): Meal {
  const pT = n.protein * kcalShare;
  const cT = n.carbs * kcalShare;
  const pool = (list: Food[]) => {
    const ok = list.filter((f) => !avoid.some((w) => w && f.name.includes(w)));
    return ok.length ? ok : list;
  };
  const items: string[] = [];
  if (kind === "breakfast" || kind === "snack") {
    const prot = pool(PROT_LIGHT)[(day + (kind === "snack" ? 1 : 0)) % pool(PROT_LIGHT).length];
    const carb = pool(CARB_BREAKFAST)[(day + (kind === "snack" ? 3 : 0)) % pool(CARB_BREAKFAST).length];
    const protG = (pT * 0.65) / (prot.p / 100);
    const carbG = Math.max(0, cT - (protG * prot.c) / 100) / (carb.c / 100);
    items.push(line(prot, protG), line(carb, carbG));
    if (kind === "breakfast") items.push("Café o té sin azúcar");
    if (n.fat > 70 && kind === "snack") items.push("15 g de frutos secos");
  } else {
    const prot = pool(PROT_MAIN)[(day + (kind === "dinner" ? 3 : 0)) % pool(PROT_MAIN).length];
    const carb = pool(CARB_MAIN)[(day + (kind === "dinner" ? 2 : 0)) % pool(CARB_MAIN).length];
    const protG = (pT * 0.8) / (prot.p / 100);
    const carbG = Math.max(0, cT - (protG * prot.c) / 100) / (carb.c / 100);
    items.push(line(prot, protG), line(carb, carbG), VEG[(day + (kind === "dinner" ? 2 : 0)) % VEG.length], "10 g de aceite de oliva virgen extra");
  }
  return { name, time, items };
}

export function generateNutrition(a: Answers): Nutrition {
  const t = targets(a);
  const base: Nutrition = { kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat, days: [], notes: "" };
  const count = Math.min(6, Math.max(3, a.mealsPerDay));
  const times = mealTimes(a, count);
  const shares = dist(count);
  const avoid = `${a.dislikes} ${a.allergies}`
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const names3 = ["Desayuno", "Comida", "Cena"];
  const names4 = ["Desayuno", "Comida", "Merienda", "Cena"];
  const names5 = ["Desayuno", "Media mañana", "Comida", "Merienda", "Cena"];
  const names6 = ["Desayuno", "Media mañana", "Comida", "Merienda", "Pre-entreno / snack", "Cena"];
  const names = { 3: names3, 4: names4, 5: names5, 6: names6 }[count] as string[];

  base.days = DAYS.map((day, di) => ({
    day,
    meals: names.map((nm, i) => {
      const kind = nm === "Desayuno" ? "breakfast" : nm === "Comida" ? "main" : nm === "Cena" ? "dinner" : "snack";
      return buildMeal(nm, times[i], shares[i], base, kind, di, avoid);
    }),
  }));
  base.notes =
    `Objetivo diario orientativo: ${t.kcal} kcal · ${t.protein} g proteína · ${t.carbs} g hidratos · ${t.fat} g grasa.\n` +
    "Base de alimentos sin procesar: patata y boniato como fuente principal de hidratos, evitando pasta y pan ultraprocesados. Pesos en crudo salvo que se indique 'cocido'.\n" +
    "Bebe 2–3 L de agua al día. Ajustaremos cantidades según tu evolución semanal.";
  return base;
}

// ---------- Fuerza ----------
const X = (name: string, sets: number, reps: string, rest = "90 s", note?: string): Exercise => ({ name, sets, reps, rest, note });

const GYM = {
  squat: X("Sentadilla con barra", 4, "6-8", "2 min"),
  legpress: X("Prensa de piernas", 3, "10-12"),
  rdl: X("Peso muerto rumano", 3, "8-10", "2 min"),
  lunge: X("Zancadas caminando", 3, "10 por pierna"),
  legcurl: X("Curl femoral tumbado", 3, "10-12", "60 s"),
  calf: X("Elevación de gemelos", 3, "12-15", "45 s"),
  bench: X("Press banca", 4, "6-8", "2 min"),
  incline: X("Press inclinado con mancuernas", 3, "8-10"),
  ohp: X("Press militar", 3, "8-10"),
  lateral: X("Elevaciones laterales", 3, "12-15", "45 s"),
  triceps: X("Extensión de tríceps en polea", 3, "10-12", "60 s"),
  row: X("Remo con barra", 4, "6-8", "2 min"),
  pulldown: X("Jalón al pecho", 3, "8-12"),
  cablerow: X("Remo en polea baja", 3, "10-12"),
  facepull: X("Face pull", 3, "12-15", "45 s"),
  biceps: X("Curl de bíceps con mancuernas", 3, "10-12", "60 s"),
  plank: X("Plancha", 3, "40 s", "45 s"),
};
const HOME = {
  squat: X("Sentadilla búlgara", 4, "8-10 por pierna", "90 s", "Con mochila cargada si es fácil"),
  legpress: X("Sentadilla goblet con mancuerna", 3, "10-12"),
  rdl: X("Peso muerto rumano a una pierna", 3, "8-10 por pierna"),
  lunge: X("Zancadas inversas", 3, "10 por pierna"),
  legcurl: X("Curl femoral con toalla (suelo)", 3, "10-12", "60 s"),
  calf: X("Elevación de gemelos a una pierna", 3, "12-15", "45 s"),
  bench: X("Flexiones con lastre o pies elevados", 4, "8-12"),
  incline: X("Press con mancuernas en suelo", 3, "8-12"),
  ohp: X("Pike push-up", 3, "6-10"),
  lateral: X("Elevaciones laterales con mancuernas", 3, "12-15", "45 s"),
  triceps: X("Fondos entre sillas", 3, "8-12", "60 s"),
  row: X("Remo con mancuerna a una mano", 4, "8-10 por brazo"),
  pulldown: X("Dominadas o remo invertido", 3, "máx. con buena técnica"),
  cablerow: X("Remo con banda elástica", 3, "12-15"),
  facepull: X("Face pull con banda", 3, "12-15", "45 s"),
  biceps: X("Curl con mancuernas o banda", 3, "10-12", "60 s"),
  plank: X("Plancha", 3, "40 s", "45 s"),
};

type Bank = typeof GYM;
type Template = { title: string; ex: (keyof Bank)[] };

const T = {
  full: [
    { title: "Cuerpo completo A", ex: ["squat", "bench", "row", "rdl", "lateral", "plank"] },
    { title: "Cuerpo completo B", ex: ["legpress", "ohp", "pulldown", "lunge", "biceps", "triceps"] },
    { title: "Cuerpo completo C", ex: ["rdl", "incline", "cablerow", "squat", "facepull", "plank"] },
  ] as Template[],
  ul: [
    { title: "Tren superior", ex: ["bench", "row", "ohp", "pulldown", "triceps", "biceps"] },
    { title: "Tren inferior", ex: ["squat", "rdl", "lunge", "legcurl", "calf", "plank"] },
  ] as Template[],
  ppl: [
    { title: "Empuje", ex: ["bench", "incline", "ohp", "lateral", "triceps"] },
    { title: "Tirón", ex: ["row", "pulldown", "cablerow", "facepull", "biceps"] },
    { title: "Pierna", ex: ["squat", "rdl", "legpress", "legcurl", "calf", "plank"] },
  ] as Template[],
};

function pickTemplates(days: number): Template[] {
  const { full, ul, ppl } = T;
  switch (days) {
    case 2: return [full[0], full[1]];
    case 3: return full;
    case 4: return [ul[0], ul[1], ul[0], ul[1]].map((t, i) => ({ ...t, title: `${t.title} ${i < 2 ? "A" : "B"}` }));
    case 5: return [ppl[0], ppl[1], ppl[2], ul[0], ul[1]];
    case 6: return [...ppl, ...ppl].map((t, i) => ({ ...t, title: `${t.title} ${i < 3 ? "A" : "B"}` }));
    default: return [full[0]];
  }
}

function spreadDays(n: number, preferred: string[]): string[] {
  const valid = preferred.filter((d) => DAYS.includes(d));
  if (valid.length >= n) return DAYS.filter((d) => valid.includes(d)).slice(0, n);
  const defaults: Record<number, number[]> = {
    1: [2], 2: [1, 4], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5],
  };
  return (defaults[n] ?? defaults[3]).map((i) => DAYS[i]);
}

export function generateTraining(a: Answers): Training {
  const n = Math.min(6, Math.max(2, a.daysPerWeek));
  const bank: Bank = a.place === "casa" ? HOME : GYM;
  const days = spreadDays(n, a.trainDays);
  const templates = pickTemplates(n);
  const beginner = a.level === "principiante";
  const advanced = a.level === "avanzado";
  const maxEx = a.sessionMinutes <= 45 ? 4 : a.sessionMinutes <= 60 ? 5 : 6;

  const out: TrainingDay[] = templates.map((tpl, i) => ({
    day: days[i],
    title: tpl.title,
    exercises: tpl.ex.slice(0, maxEx).map((k) => {
      const e = { ...bank[k] };
      if (beginner) e.sets = Math.max(2, e.sets - 1);
      if (advanced && e.sets < 5 && ["squat", "bench", "row", "rdl", "ohp"].includes(k)) e.sets += 1;
      return e;
    }),
  }));

  const notes = [
    beginner
      ? "Empieza con cargas que te dejen 3 repeticiones en reserva y prioriza la técnica."
      : "Trabaja con 1–2 repeticiones en reserva en las series principales.",
    "Progresión: cuando completes todas las series en el tope del rango de repeticiones, sube el peso un 2,5–5 %.",
    a.otherSport ? `Tienes carga de ${a.otherSport}: evita la sesión de pierna el día previo a partido o al entrenamiento más intenso.` : "",
    a.injuries ? `Molestias indicadas: ${a.injuries}. Sustituiremos ejercicios que te den dolor.` : "",
  ].filter(Boolean).join("\n");

  return { days: out, notes };
}
