-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Enable UUID
create extension if not exists "uuid-ossp";

-- ===== COMPANIES =====
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null unique,
  name text not null default 'Mi Negocio',
  rut text default '',
  address text default '',
  phone text default '',
  email text default '',
  logo text default '',
  terms text default 'Válida por 15 días. Forma de pago: 50% anticipo, 50% contra entrega.',
  created_at timestamptz default now()
);
alter table public.companies enable row level security;
create policy "Users can view own company" on public.companies for select using (auth.uid() = user_id);
create policy "Users can insert own company" on public.companies for insert with check (auth.uid() = user_id);
create policy "Users can update own company" on public.companies for update using (auth.uid() = user_id);

-- ===== PRODUCTS =====
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies not null,
  name text not null,
  category text not null default 'Equipos',
  price integer not null,
  unit text not null default 'unidad',
  created_at timestamptz default now()
);
alter table public.products enable row level security;
create policy "Users can view own products" on public.products
  for select using (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can insert own products" on public.products
  for insert with check (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can update own products" on public.products
  for update using (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can delete own products" on public.products
  for delete using (auth.uid() = (select user_id from public.companies where id = company_id));

-- ===== CLIENTS =====
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies not null,
  name text not null,
  rut text default '',
  giro text default '',
  address text default '',
  phone text default '',
  email text default '',
  created_at timestamptz default now()
);
alter table public.clients enable row level security;
create policy "Users can view own clients" on public.clients
  for select using (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can insert own clients" on public.clients
  for insert with check (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can update own clients" on public.clients
  for update using (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can delete own clients" on public.clients
  for delete using (auth.uid() = (select user_id from public.companies where id = company_id));

-- ===== QUOTES =====
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies not null,
  client_id uuid references public.clients,
  number text not null,
  client_name text not null,
  client_rut text default '',
  client_giro text default '',
  client_address text default '',
  client_phone text default '',
  client_email text default '',
  client_project text default '',
  date date not null default current_date,
  valid_until date not null default current_date + 15,
  subtotal integer not null default 0,
  iva integer not null default 0,
  total integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table public.quotes enable row level security;
create policy "Users can view own quotes" on public.quotes
  for select using (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can insert own quotes" on public.quotes
  for insert with check (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can update own quotes" on public.quotes
  for update using (auth.uid() = (select user_id from public.companies where id = company_id));
create policy "Users can delete own quotes" on public.quotes
  for delete using (auth.uid() = (select user_id from public.companies where id = company_id));

-- ===== AUTO-CREATE COMPANY ON SIGNUP =====
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.companies (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'company_name', 'Mi Negocio'), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
