-- Barba Negra · Fidelidad y perfiles de clientes

-- Cupones de beneficio (10 visitas completadas = 1 servicio gratis)
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  service_id uuid references public.services(id) on delete set null,
  redeemed_visits int not null default 10 check (redeemed_visits > 0),
  status text not null default 'available' check (status in ('available', 'used', 'cancelled')),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists idx_coupons_user on public.coupons (user_id);

alter table public.coupons enable row level security;

create policy "coupons_select_own" on public.coupons
  for select using (auth.uid() = user_id or public.is_admin());
create policy "coupons_insert_own" on public.coupons
  for insert to authenticated with check (auth.uid() = user_id);
create policy "coupons_update_admin" on public.coupons
  for update using (public.is_admin()) with check (public.is_admin());

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Canjear beneficio: consume 10 visitas completadas y crea un cupón
create or replace function public.bc_redeem_loyalty(p_service_id uuid)
returns public.coupons
language plpgsql
security definer
set search_path = public
as $$
declare
  v_completed int;
  v_redeemed int;
  v_coupon public.coupons;
begin
  select count(*) into v_completed
  from public.bookings b
  where b.user_id = auth.uid() and b.status = 'completed';

  select coalesce(sum(c.redeemed_visits), 0) into v_redeemed
  from public.coupons c
  where c.user_id = auth.uid() and c.status <> 'cancelled';

  if v_completed - v_redeemed < 10 then
    raise exception 'Necesitas 10 visitas completadas para canjear tu beneficio';
  end if;

  insert into public.coupons (user_id, code, service_id, redeemed_visits, status)
  values (
    auth.uid(),
    'BN-' || upper(substr(replace(md5(random()::text), '-', ''), 1, 6)),
    p_service_id,
    10,
    'available'
  )
  returning * into v_coupon;

  return v_coupon;
end;
$$;

grant execute on function public.bc_redeem_loyalty(uuid) to authenticated;