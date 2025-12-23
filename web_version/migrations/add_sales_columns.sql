-- Migração: Adicionar colunas address e observations na tabela sales
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna de endereço
alter table public.sales add column if not exists address text;

-- Adicionar coluna de observações
alter table public.sales add column if not exists observations text;
