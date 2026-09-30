export type Goal = "perder-grasa" | "ganar-musculo" | "recomposicion" | "rendimiento";
export type Want = "dieta" | "fuerza" | "ambos";

export interface Answers {
  // Datos
  name: string;
  email: string;
  birthdate: string;
  sex: "hombre" | "mujer";
  height: number;
  weight: number;
  // Objetivo
  want: Want;
  goal: Goal;
  goalDetail: string;
  // Rutina diaria
  job: "sedentario" | "mixto" | "activo";
  workStart: string;
  workEnd: string;
  workDays: string[];
  leisure: string;
  sleep: number;
  // Alimentación
  mealsPerDay: number;
  dislikes: string;
  allergies: string;
  cookingTime: "poco" | "medio" | "mucho";
  // Entrenamiento
  level: "principiante" | "intermedio" | "avanzado";
  daysPerWeek: number;
  trainDays: string[];
  sessionMinutes: number;
  place: "gimnasio" | "casa" | "mixto";
  otherSport: string;
  injuries: string;
  notes: string;
}

export interface Intake {
  id: string;
  created_at: string;
  answers: Answers;
}

export interface Meal {
  name: string;
  time: string;
  items: string[];
}
export interface NutritionDay {
  day: string;
  meals: Meal[];
}
export interface Nutrition {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  days: NutritionDay[];
  notes: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  note?: string;
}
export interface TrainingDay {
  day: string;
  title: string;
  exercises: Exercise[];
}
export interface Training {
  days: TrainingDay[];
  notes: string;
}

export interface Plan {
  email: string;
  name: string;
  status: "borrador" | "publicado";
  nutrition: Nutrition | null;
  training: Training | null;
  updated_at: string;
}

export interface SetLog {
  kg: string;
  reps: string;
  done: boolean;
}
export interface DayLog {
  meals: Record<string, boolean>;
  sets: Record<string, SetLog[]>;
  weight: string;
  note: string;
}

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
