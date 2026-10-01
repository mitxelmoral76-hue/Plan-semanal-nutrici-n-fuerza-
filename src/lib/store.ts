"use client";
import type { Answers, DayLog, Intake, Plan } from "./types";
import { COACH_EMAIL, hasSupabase, supa } from "./supabase";

/**
 * Capa de datos. Con Supabase configurado usa la base de datos real;
 * sin variables de entorno funciona en modo demo con localStorage.
 */

const ls = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const norm = (e: string) => e.trim().toLowerCase();

export const demoMode = !hasSupabase;

// ---------- Sesión ----------
export async function getEmail(): Promise<string | null> {
  if (hasSupabase) {
    const { data } = await supa().auth.getSession();
    return data.session?.user.email?.toLowerCase() ?? null;
  }
  return ls.get<string | null>("demo_email", null);
}

export async function signIn(email: string): Promise<"enviado" | "ok"> {
  if (hasSupabase) {
    const { error } = await supa().auth.signInWithOtp({
      email: norm(email),
      options: { emailRedirectTo: `${location.origin}/app` },
    });
    if (error) throw error;
    return "enviado";
  }
  ls.set("demo_email", norm(email));
  return "ok";
}

export async function signOut() {
  if (hasSupabase) await supa().auth.signOut();
  else localStorage.removeItem("demo_email");
}

export async function isCoach(): Promise<boolean> {
  if (!hasSupabase) return true; // demo: panel abierto
  const e = await getEmail();
  return Boolean(e && COACH_EMAIL && e === COACH_EMAIL);
}

// ---------- Cuestionario ----------
export async function submitIntake(answers: Answers): Promise<void> {
  answers.email = norm(answers.email);
  if (hasSupabase) {
    const { error } = await supa().from("intakes").insert({ email: answers.email, answers });
    if (error) throw error;
    return;
  }
  const all = ls.get<Intake[]>("demo_intakes", []);
  all.unshift({ id: uid(), created_at: new Date().toISOString(), answers });
  ls.set("demo_intakes", all);
}

export async function listIntakes(): Promise<Intake[]> {
  if (hasSupabase) {
    const { data, error } = await supa().from("intakes").select("id, created_at, answers").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Intake[];
  }
  return ls.get<Intake[]>("demo_intakes", []);
}

export async function getIntake(id: string): Promise<Intake | null> {
  return (await listIntakes()).find((i) => i.id === id) ?? null;
}

// ---------- Planes ----------
export async function savePlan(p: Plan): Promise<void> {
  const row = { ...p, email: norm(p.email), updated_at: new Date().toISOString() };
  if (hasSupabase) {
    const { error } = await supa().from("plans").upsert(row, { onConflict: "email" });
    if (error) throw error;
    return;
  }
  const all = ls.get<Record<string, Plan>>("demo_plans", {});
  all[row.email] = row;
  ls.set("demo_plans", all);
}

export async function getPlan(email: string): Promise<Plan | null> {
  const e = norm(email);
  if (hasSupabase) {
    const { data } = await supa().from("plans").select("*").eq("email", e).maybeSingle();
    return (data as Plan) ?? null;
  }
  return ls.get<Record<string, Plan>>("demo_plans", {})[e] ?? null;
}

// ---------- Seguimiento diario ----------
export const emptyLog = (): DayLog => ({ meals: {}, sets: {}, weight: "", note: "" });

export async function getLog(email: string, date: string): Promise<DayLog> {
  const e = norm(email);
  if (hasSupabase) {
    const { data } = await supa().from("logs").select("data").eq("email", e).eq("log_date", date).maybeSingle();
    return (data?.data as DayLog) ?? emptyLog();
  }
  return ls.get<Record<string, DayLog>>(`demo_logs_${e}`, {})[date] ?? emptyLog();
}

export async function saveLog(email: string, date: string, log: DayLog): Promise<void> {
  const e = norm(email);
  if (hasSupabase) {
    await supa().from("logs").upsert({ email: e, log_date: date, data: log }, { onConflict: "email,log_date" });
    return;
  }
  const all = ls.get<Record<string, DayLog>>(`demo_logs_${e}`, {});
  all[date] = log;
  ls.set(`demo_logs_${e}`, all);
}

export async function listLogs(email: string, from: string, to: string): Promise<Record<string, DayLog>> {
  const e = norm(email);
  if (hasSupabase) {
    const { data } = await supa().from("logs").select("log_date, data").eq("email", e).gte("log_date", from).lte("log_date", to);
    return Object.fromEntries((data ?? []).map((r) => [r.log_date as string, r.data as DayLog]));
  }
  const all = ls.get<Record<string, DayLog>>(`demo_logs_${e}`, {});
  return Object.fromEntries(Object.entries(all).filter(([d]) => d >= from && d <= to));
}
