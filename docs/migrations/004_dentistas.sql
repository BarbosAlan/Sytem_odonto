-- ============================================================
-- MIGRATION 004 — Tabela Dentistas
--
-- Pré-requisitos:
--   001_auth_setup.sql          (tabelas clinica + perfis)
--   003_fix_rls_recursion.sql   (fn_auth_user_clinica_id + fn_auth_user_is_admin)
--
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de dentistas
CREATE TABLE IF NOT EXISTS public.dentistas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id     UUID NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  cro            TEXT NOT NULL,
  especialidades TEXT[] NOT NULL DEFAULT '{}',
  email          TEXT,
  telefone       TEXT,
  cor            TEXT NOT NULL DEFAULT '#3B82F6',
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_dentistas_clinica_id
  ON public.dentistas (clinica_id);

CREATE INDEX IF NOT EXISTS idx_dentistas_ativo
  ON public.dentistas (clinica_id, ativo);

-- 3. Trigger de updated_at
CREATE TRIGGER trg_dentistas_updated_at
  BEFORE UPDATE ON public.dentistas
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 4. RLS
ALTER TABLE public.dentistas ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer autenticado da mesma clínica
CREATE POLICY "dentistas_select_clinica"
  ON public.dentistas FOR SELECT TO authenticated
  USING (clinica_id = public.fn_auth_user_clinica_id());

-- Insert: apenas admin
CREATE POLICY "dentistas_insert_admin"
  ON public.dentistas FOR INSERT TO authenticated
  WITH CHECK (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );

-- Update: apenas admin
CREATE POLICY "dentistas_update_admin"
  ON public.dentistas FOR UPDATE TO authenticated
  USING (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );

-- Delete: apenas admin
CREATE POLICY "dentistas_delete_admin"
  ON public.dentistas FOR DELETE TO authenticated
  USING (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );
