-- ============================================================
-- MIGRATION 005 — Tabela Procedimentos
--
-- Pré-requisitos:
--   001_auth_setup.sql          (tabelas clinica + perfis)
--   003_fix_rls_recursion.sql   (fn_auth_user_clinica_id + fn_auth_user_is_admin)
--
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de procedimentos
CREATE TABLE IF NOT EXISTS public.procedimentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id       UUID NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  nome             TEXT NOT NULL,
  codigo           TEXT,
  descricao        TEXT,
  categoria        TEXT NOT NULL DEFAULT 'Outros',
  duracao_minutos  INTEGER NOT NULL DEFAULT 30,
  preco            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cor              TEXT NOT NULL DEFAULT '#3B82F6',
  ativo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_procedimentos_clinica_id
  ON public.procedimentos (clinica_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_categoria
  ON public.procedimentos (clinica_id, categoria);

CREATE INDEX IF NOT EXISTS idx_procedimentos_ativo
  ON public.procedimentos (clinica_id, ativo);

-- 3. Trigger de updated_at
CREATE TRIGGER trg_procedimentos_updated_at
  BEFORE UPDATE ON public.procedimentos
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 4. RLS
ALTER TABLE public.procedimentos ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer autenticado da mesma clínica
CREATE POLICY "procedimentos_select_clinica"
  ON public.procedimentos FOR SELECT TO authenticated
  USING (clinica_id = public.fn_auth_user_clinica_id());

-- Insert: apenas admin
CREATE POLICY "procedimentos_insert_admin"
  ON public.procedimentos FOR INSERT TO authenticated
  WITH CHECK (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );

-- Update: apenas admin
CREATE POLICY "procedimentos_update_admin"
  ON public.procedimentos FOR UPDATE TO authenticated
  USING (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );

-- Delete: apenas admin
CREATE POLICY "procedimentos_delete_admin"
  ON public.procedimentos FOR DELETE TO authenticated
  USING (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );
