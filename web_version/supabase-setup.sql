-- =====================================================
-- PAULISTA PDV - Script SQL Completo para Supabase
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA DE PRODUTOS
-- =====================================================
create table if not exists public.products (
  id bigint primary key,
  name text not null,
  category text default 'Geral',
  price numeric default 0,
  stock numeric default 0,
  status text check (status in ('Ativo', 'Baixo Estoque', 'Esgotado')) default 'Ativo',
  created_at timestamp with time zone default now()
);

alter table public.products enable row level security;

drop policy if exists "Products select" on public.products;
create policy "Products select" on public.products for select using (true);

drop policy if exists "Products insert" on public.products;
create policy "Products insert" on public.products for insert with check (true);

drop policy if exists "Products update" on public.products;
create policy "Products update" on public.products for update using (true);

drop policy if exists "Products delete" on public.products;
create policy "Products delete" on public.products for delete using (true);


-- 2. TABELA DE CLIENTES
-- =====================================================
create table if not exists public.customers (
  id bigint primary key generated always as identity,
  name text not null,
  email text,
  phone text,
  address text,
  city text,
  created_at timestamp with time zone default now()
);

alter table public.customers enable row level security;

drop policy if exists "Customers all" on public.customers;
create policy "Customers all" on public.customers for all using (true) with check (true);


-- 3. TABELA DE FORNECEDORES
-- =====================================================
create table if not exists public.suppliers (
  id bigint primary key generated always as identity,
  name text not null,
  contact text,
  phone text,
  email text,
  category text default 'Geral',
  created_at timestamp with time zone default now()
);

alter table public.suppliers enable row level security;

drop policy if exists "Suppliers all" on public.suppliers;
create policy "Suppliers all" on public.suppliers for all using (true) with check (true);


-- 4. TABELA DE TRANSAÇÕES FINANCEIRAS
-- =====================================================
create table if not exists public.transactions (
  id bigint primary key generated always as identity,
  description text not null,
  type text check (type in ('income', 'expense')) not null,
  amount numeric not null,
  method text,
  date date default current_date,
  time time default current_time,
  created_at timestamp with time zone default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Transactions all" on public.transactions;
create policy "Transactions all" on public.transactions for all using (true) with check (true);


-- 5. TABELA DE CONTAS A RECEBER
-- =====================================================
create table if not exists public.receivables (
  id bigint primary key generated always as identity,
  description text not null,
  customer text,
  value numeric not null,
  due_date date,
  status text check (status in ('Pendente', 'Recebido', 'Atrasado')) default 'Pendente',
  original_value numeric,
  discount numeric default 0,
  addition numeric default 0,
  payment_date date,
  payment_method text,
  created_at timestamp with time zone default now()
);

alter table public.receivables enable row level security;

drop policy if exists "Receivables all" on public.receivables;
create policy "Receivables all" on public.receivables for all using (true) with check (true);


-- 6. TABELA DE VENDAS
-- =====================================================
create table if not exists public.sales (
  id bigint primary key generated always as identity,
  customer_name text,
  customer_phone text,
  address text,
  observations text,
  payment_method text,
  payment_condition text,
  subtotal numeric,
  discount numeric default 0,
  total numeric not null,
  items jsonb,
  created_at timestamp with time zone default now()
);

alter table public.sales enable row level security;

drop policy if exists "Sales all" on public.sales;
create policy "Sales all" on public.sales for all using (true) with check (true);


-- 7. CONTADOR DE VISITANTES
-- =====================================================
create table if not exists public.visitor_stats (
  id bigint primary key generated always as identity,
  visit_date date not null unique,
  count integer default 1
);

alter table public.visitor_stats enable row level security;

drop policy if exists "Visitor stats all" on public.visitor_stats;
create policy "Visitor stats all" on public.visitor_stats for all using (true) with check (true);


-- 8. FUNÇÃO PARA INCREMENTAR VISITANTES
-- =====================================================
create or replace function public.increment_visitor_count()
returns void
language plpgsql
security definer
as $$
begin
  insert into public.visitor_stats (visit_date, count)
  values (current_date, 1)
  on conflict (visit_date)
  do update set count = visitor_stats.count + 1;
end;
$$;

-- =====================================================
-- FIM DO SCRIPT - Execute tudo de uma vez!
-- =====================================================
