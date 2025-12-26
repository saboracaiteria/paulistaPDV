-- ============================================
-- PAULISTA PDV - MÓDULO DE CAIXA
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. TABELA: CASH_REGISTERS (Sessões de Caixa)
-- Usado em: /dashboard/finance/cashier
-- ============================================
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opening_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    closing_amount NUMERIC(12, 2),
    expected_amount NUMERIC(12, 2),
    difference NUMERIC(12, 2),
    operator TEXT,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Cash registers are viewable by everyone"
    ON public.cash_registers FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert cash registers"
    ON public.cash_registers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update cash registers"
    ON public.cash_registers FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete cash registers"
    ON public.cash_registers FOR DELETE
    USING (true);

-- ============================================
-- 2. TABELA: CASH_MOVEMENTS (Movimentações)
-- Registra todas as entradas e saídas do caixa
-- ============================================
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id BIGSERIAL PRIMARY KEY,
    register_id BIGINT NOT NULL REFERENCES public.cash_registers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('opening', 'sale', 'sangria', 'suprimento', 'closing')),
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    payment_method TEXT,
    sale_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público
CREATE POLICY "Cash movements are viewable by everyone"
    ON public.cash_movements FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert cash movements"
    ON public.cash_movements FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update cash movements"
    ON public.cash_movements FOR UPDATE
    USING (true);

CREATE POLICY "Anyone can delete cash movements"
    ON public.cash_movements FOR DELETE
    USING (true);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cash_registers_date ON public.cash_registers(date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_registers_status ON public.cash_registers(status);
CREATE INDEX IF NOT EXISTS idx_cash_movements_register ON public.cash_movements(register_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_type ON public.cash_movements(type);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Após executar, verifique:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'cash%';
