-- Barba Negra · Datos demo + admin
-- Se ejecuta con `supabase db reset` (rol postgres, bypass RLS)

-- Usuario admin (email/password)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  recovery_token, confirmation_token, email_change_token_new, email_change,
  created_at, updated_at, email_change_token_current
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@barbanegra.cl',
  crypt('admin123', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  now(),
  now(),
  ''
) on conflict do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@barbanegra.cl","email_verified":true,"phone_verified":false}',
  'email',
  now(),
  now(),
  now()
) on conflict do nothing;

insert into public.profiles (id, email, full_name, role)
values ('11111111-1111-1111-1111-111111111111', 'admin@barbanegra.cl', 'Admin Barba Negra', 'admin')
on conflict (id) do nothing;

-- Servicios
insert into public.services (id, name, description, duration_min, price, image_url, is_active, sort_order) values
  ('10000000-0000-0000-0000-000000000001', 'Corte Clásico', 'Corte con tijera, navaja y finalización a máquina. Incluye lavado y asesoría de estilo.', 30, 12000, 'https://images.unsplash.com/photo-1593702275687-f8b402bf1fb8?w=800&q=80', true, 1),
  ('10000000-0000-0000-0000-000000000002', 'Arreglo de Barba', 'Perfilado con navaja, toalla caliente y aceites.', 20, 8000, 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80', true, 2),
  ('10000000-0000-0000-0000-000000000003', 'Corte + Barba', 'Corte de autor y barba completa con navaja.', 50, 18000, 'https://images.unsplash.com/photo-1472815405931-17bc6776825e?w=800&q=80', true, 3),
  ('10000000-0000-0000-0000-000000000004', 'Afeitado Clásico', 'Afeitado tradicional con navaja y toalla caliente.', 45, 15000, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80', true, 4),
  ('10000000-0000-0000-0000-000000000005', 'Skin Fade', 'Fade preciso con degradado limpio y navaja.', 25, 10000, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', true, 5),
  ('10000000-0000-0000-0000-000000000006', 'Corte Infantil', 'Corte rápido pensado para los más pequeños.', 20, 7000, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', true, 6)
on conflict (id) do nothing;

-- Barberos
insert into public.barbers (id, name, role, specialty, bio, image_url, is_active, sort_order) values
  ('20000000-0000-0000-0000-000000000001', 'Damián Rojas', 'Corte clásico · Tijera', 'Cortes vintage y navaja', '14 años de oficio. Referente del corte clásico.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80', true, 1),
  ('20000000-0000-0000-0000-000000000002', 'Ignacio Fuentes', 'Barba · Fade', 'Fades precisos y arreglo de barba', 'Perfeccionista del degradado.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=80', true, 2),
  ('20000000-0000-0000-0000-000000000003', 'Cristóbal Vega', 'Corte de autor', 'Pelo largo y texturizado', 'Estilos de autor para pelo medio y largo.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=700&q=80', true, 3),
  ('20000000-0000-0000-0000-000000000004', 'Nicolás Paredes', 'Kids · Skin fade', 'Cortes infantiles y afeitado clásico', 'Paciente con los peques y afilado con navaja.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=700&q=80', true, 4)
on conflict (id) do nothing;

-- Horarios semanales (Lun-Sáb, mañana + tarde)
insert into public.schedules (id, barber_id, day_of_week, start_time, end_time, is_active) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', 1, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000001', 2, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 3, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000001', 3, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 4, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000001', 4, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 5, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000001', 5, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 6, '10:00', '14:00', true),
  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000002', 1, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000031', '20000000-0000-0000-0000-000000000002', 1, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000002', 2, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000032', '20000000-0000-0000-0000-000000000002', 2, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000002', 3, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000033', '20000000-0000-0000-0000-000000000002', 3, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000002', 4, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000034', '20000000-0000-0000-0000-000000000002', 4, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000025', '20000000-0000-0000-0000-000000000002', 5, '10:00', '13:00', true),
  ('30000000-0000-0000-0000-000000000035', '20000000-0000-0000-0000-000000000002', 5, '14:30', '20:00', true),
  ('30000000-0000-0000-0000-000000000026', '20000000-0000-0000-0000-000000000002', 6, '10:00', '14:00', true)
on conflict (id) do nothing;

-- Blocked slot de ejemplo: colación para Nicolás (todos los días)
insert into public.blocked_slots (id, barber_id, date, start_time, end_time, reason) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', null, '12:00', '13:00', 'Colación')
on conflict (id) do nothing;

-- Algunas reservas de ejemplo para el panel
insert into public.bookings (id, code, client_name, client_phone, service_id, barber_id, "date", start_time, duration_min, price, status, notes) values
  ('50000000-0000-0000-0000-000000000001', 'BN-DEMO1', 'Matías Contreras', '+56911110000', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', current_date, '10:00', 30, 12000, 'confirmed', null),
  ('50000000-0000-0000-0000-000000000002', 'BN-DEMO2', 'Franco Silva', '+56922220000', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', current_date, '11:30', 50, 18000, 'pending', null),
  ('50000000-0000-0000-0000-000000000003', 'BN-DEMO3', 'Joaquín Mena', '+56933330000', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', current_date + 1, '12:20', 20, 8000, 'confirmed', 'Prefiere sin aceites'),
  ('50000000-0000-0000-0000-000000000004', 'BN-DEMO4', 'Renato Peña', '+56944440000', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', current_date + 1, '16:40', 45, 15000, 'pending', null),
  ('50000000-0000-0000-0000-000000000005', 'BN-DEMO5', 'Rodrigo Fuentes', '+56955550000', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', current_date + 2, '17:30', 30, 12000, 'cancelled', null)
on conflict (id) do nothing;