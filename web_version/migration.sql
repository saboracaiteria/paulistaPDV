-- Create the products table
create table public.products (
  id bigint primary key,
  name text not null,
  category text,
  price numeric,
  stock numeric,
  status text check (status in ('Ativo', 'Baixo Estoque', 'Esgotado'))
);

-- Enable Row Level Security (RLS) is recommended, but for simplicity we can start without it or open it up.
-- For now, let's allow public read access (since it's a store)
alter table public.products enable row level security;

create policy "Public products are viewable by everyone"
  on public.products for select
  using ( true );

-- For updates/inserts with the Service Role (which bypasses RLS anyway), we don't strictly need a policy, 
-- but if we want to allow the "dashboard" users to update, we need auth.
-- Assuming the user uses the Service Role Key for migration script, it will work.
