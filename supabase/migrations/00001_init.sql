-- Barba Negra · Esquema inicial
create extension if not exists pgcrypto;

-- Perfiles ligados a auth.users (rol para el panel admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_min int not null check (duration_min > 0),
  price int not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  specialty text,
  bio text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references public.barbers(id) on delete cascade,
  date date, -- null = todos los días (ej. colación)
  start_time time not null,
  end_time time not null check (end_time > start_time),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  client_name text not null,
  client_phone text not null,
  email text,
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid not null references public.services(id),
  barber_id uuid not null references public.barbers(id),
  "date" date not null,
  start_time time not null,
  duration_min int not null check (duration_min > 0),
  price int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_barber_date on public.bookings (barber_id, "date");
create index if not exists idx_bookings_code on public.bookings (code);
create index if not exists idx_bookings_phone on public.bookings (client_phone);
create index if not exists idx_schedules_barber on public.schedules (barber_id);
create index if not exists idx_blocked_barber_date on public.blocked_slots (barber_id, date);

-- helper: es admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.barbers enable row level security;
alter table public.schedules enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.bookings enable row level security;

-- profiles: propio + admin
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- services: lectura pública, escritura admin
create policy "services_select" on public.services for select using (true);
create policy "services_write_admin" on public.services for all using (public.is_admin()) with check (public.is_admin());

-- barbers
create policy "barbers_select" on public.barbers for select using (true);
create policy "barbers_write_admin" on public.barbers for all using (public.is_admin()) with check (public.is_admin());

-- schedules
create policy "schedules_select" on public.schedules for select using (true);
create policy "schedules_write_admin" on public.schedules for all using (public.is_admin()) with check (public.is_admin());

-- blocked_slots
create policy "blocked_select" on public.blocked_slots for select using (true);
create policy "blocked_write_admin" on public.blocked_slots for all using (public.is_admin()) with check (public.is_admin());

-- bookings: insert anónimo (datos del cliente), admin todo, usuario solo su fila
create policy "bookings_insert_public" on public.bookings
  for insert to anon, authenticated with check (true);
create policy "bookings_select_admin" on public.bookings
  for select using (public.is_admin());
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);
create policy "bookings_update_admin" on public.bookings
  for update using (public.is_admin()) with check (public.is_admin());
create policy "bookings_delete_admin" on public.bookings
  for delete using (public.is_admin());

-- ============ RPC públicos (seguridad definer, datos acotados) ============

-- Buscar reservas por código o teléfono/nombre (público)
create or replace function public.bc_find_booking(p_code text, p_phone text)
returns setof public.bookings
language sql
security definer
set search_path = public
stable
as $$
  select b.*
  from public.bookings b
  where
    lower(coalesce(p_code, '')) <> '' and lower(b.code) = lower(p_code)
    or (coalesce(p_phone, '') <> '' and (b.client_phone = p_phone or b.client_name ilike '%' || p_phone || '%'))
$$;

-- Bloques ocupados de un barbero en una fecha (público)
create or replace function public.bc_get_blocked(p_barber uuid, p_date date)
returns table (r_start time, r_end time)
language sql
security definer
set search_path = public
stable
as $$
  select b.start_time, b.start_time + make_interval(mins => b.duration_min)
  from public.bookings b
  where b.barber_id = p_barber and b."date" = p_date and b.status <> 'cancelled';
$$;

-- Cancelar una reserva pública (solo por código, nunca completada)
create or replace function public.bc_cancel_public(p_booking_id uuid, p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
    and code = p_code
    and status in ('pending', 'confirmed');
end;
$$;

grant execute on function public.bc_find_booking(text, text) to anon, authenticated;
grant execute on function public.bc_get_blocked(uuid, date) to anon, authenticated;
grant execute on function public.bc_cancel_public(uuid, text) to anon, authenticated;