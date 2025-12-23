-- Migração: Criar tabela store_settings para salvar configurações da loja
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de configurações da loja
create table if not exists public.store_settings (
  id bigint primary key generated always as identity,
  store_name text,
  legal_name text,
  cnpj text,
  ie text,
  address text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table public.store_settings enable row level security;

-- Política de acesso
drop policy if exists "Store settings all" on public.store_settings;
create policy "Store settings all" on public.store_settings for all using (true) with check (true);

-- Inserir registro padrão se não existir
insert into public.store_settings (store_name, legal_name, cnpj, ie, address)
select 'Paulista Construção e Varejo', 'Paulista Mat e Cons LTDA', '12.345.678/0001-90', '123.456.789.111', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'
where not exists (select 1 from public.store_settings limit 1);
