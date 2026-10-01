-- Ejecuta este script en Supabase > SQL Editor.
-- Sustituye TU_EMAIL_DE_COACH por tu correo (el mismo que pongas en NEXT_PUBLIC_COACH_EMAIL).

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  answers jsonb not null
);

create table if not exists public.plans (
  email text primary key,
  name text not null,
  status text not null default 'borrador' check (status in ('borrador','publicado')),
  nutrition jsonb,
  training jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.logs (
  email text not null,
  log_date date not null,
  data jsonb not null,
  primary key (email, log_date)
);

create or replace function public.is_coach() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('TU_EMAIL_DE_COACH')
$$;

alter table public.intakes enable row level security;
alter table public.plans enable row level security;
alter table public.logs enable row level security;

-- Cualquiera puede enviar el cuestionario; solo el coach lo lee.
create policy "intakes_insert_anyone" on public.intakes for insert to anon, authenticated with check (true);
create policy "intakes_coach_read" on public.intakes for select to authenticated using (public.is_coach());

-- Plan: el coach lo gestiona todo; el cliente solo lee el suyo si está publicado.
create policy "plans_coach_all" on public.plans for all to authenticated using (public.is_coach()) with check (public.is_coach());
create policy "plans_client_read" on public.plans for select to authenticated
  using (status = 'publicado' and lower(email) = lower(auth.jwt() ->> 'email'));

-- Seguimiento: el cliente gestiona el suyo; el coach puede leer todos.
create policy "logs_client_all" on public.logs for all to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email')) with check (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "logs_coach_read" on public.logs for select to authenticated using (public.is_coach());
