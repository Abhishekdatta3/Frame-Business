/*
  # Seed owner and worker users

  Run this migration in your Supabase SQL editor (or as a migration).
  It creates two users via the auth schema and inserts matching profiles.

  Users created:
    - username: owner1  →  email: owner1@saiframe.local  password: 123456  role: owner
    - username: worker1 →  email: worker1@saiframe.local password: 123456  role: worker

  NOTE: Supabase requires passwords of at least 6 characters.
        The login form accepts "123" but internally uses "123456" — 
        OR you can change the password below and update Auth.tsx accordingly.

  OPTION A (recommended) — keep password as "123456" in Supabase,
    show only "123" in the UI by mapping in Auth.tsx (see below).

  OPTION B — disable the minimum password length check in Supabase:
    Dashboard → Authentication → Providers → Email → Password strength: off
    Then you can use "123" directly.
*/

-- Create owner1 user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'owner1@saiframe.local',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'owner1@saiframe.local'
);

-- Create worker1 user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'worker1@saiframe.local',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated',
  '', '', '', ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'worker1@saiframe.local'
);

-- Insert profiles (role assignment)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'owner'
FROM auth.users
WHERE email = 'owner1@saiframe.local'
ON CONFLICT (id) DO UPDATE SET role = 'owner';

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'worker'
FROM auth.users
WHERE email = 'worker1@saiframe.local'
ON CONFLICT (id) DO UPDATE SET role = 'worker';
