-- ============================================
-- PAULISTA PDV - MIGRAÇÃO COMPLETA SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. TABELA: TRANSACTIONS (Financeiro)
-- Usado em: /dashboard/finance
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12, 2) NOT NULL,
    method TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política de acesso público (leitura)
CREATE POLICY "Transactions are viewable by everyone"
    ON public.transactions FOR SELECT
    USING (true);

-- Política de inserção pública
CREATE POLICY "Anyone can insert transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (true);

-- Política de atualização pública
CREATE POLICY "Anyone can update transactions"
    ON public.transactions FOR UPDATE
    USING (true);

-- Política de exclusão pública
CREATE POLICY "Anyone can delete transactions"
    ON public.transactions FOR DELETE
    USING (true);

-- ============================================
-- 2. TABELA: CUSTOMERS (Clientes)
-- Usado em: /dashboard/customers
-- ============================================
CREATE TABLE IF NOT EXISTS public.customers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Customers are viewable by everyone"
    ON public.customers FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert customers"
    ON public.customers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update customers"
    ON public.customers FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete customers"
    ON public.customers FOR DELETE
    USING (true);

-- ============================================
-- 3. TABELA: SUPPLIERS (Fornecedores)
-- Usado em: /dashboard/suppliers
-- ============================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    phone TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Suppliers are viewable by everyone"
    ON public.suppliers FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert suppliers"
    ON public.suppliers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update suppliers"
    ON public.suppliers FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete suppliers"
    ON public.suppliers FOR DELETE
    USING (true);

-- ============================================
-- 4. TABELA: RECEIVABLES (Contas a Receber)
-- Usado em: /dashboard/finance/receivables
-- ============================================
CREATE TABLE IF NOT EXISTS public.receivables (
    id BIGSERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    customer TEXT,
    value NUMERIC(12, 2) NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Recebido', 'Atrasado')),
    -- Campos para baixa de contas
    original_value NUMERIC(12, 2),
    discount NUMERIC(12, 2),
    addition NUMERIC(12, 2),
    payment_date DATE,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Receivables are viewable by everyone"
    ON public.receivables FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert receivables"
    ON public.receivables FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update receivables"
    ON public.receivables FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete receivables"
    ON public.receivables FOR DELETE
    USING (true);

-- ============================================
-- 5. TABELA: SALES (Vendas)
-- Usado em: /dashboard/sales
-- ============================================
CREATE TABLE IF NOT EXISTS public.sales (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT DEFAULT 'Consumidor Final',
    customer_phone TEXT,
    address TEXT,
    observations TEXT,
    payment_method TEXT NOT NULL,
    payment_condition TEXT DEFAULT 'a_vista',
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Sales are viewable by everyone"
    ON public.sales FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert sales"
    ON public.sales FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update sales"
    ON public.sales FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete sales"
    ON public.sales FOR DELETE
    USING (true);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- Suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);

-- Receivables
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON public.receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_receivables_status ON public.receivables(status);
CREATE INDEX IF NOT EXISTS idx_receivables_customer ON public.receivables(customer);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales(customer_name);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Após executar, verifique se estas tabelas existem:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Resultado esperado deve incluir:
-- transactions
-- customers  
-- suppliers
-- receivables
-- sales
-- products (já existente)
