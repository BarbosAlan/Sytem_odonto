-- ============================================================
-- MIGRATION 006 — Tabela Pacientes
--
-- Pré-requisitos:
--   001_auth_setup.sql          (tabelas clinica + perfis)
--   003_fix_rls_recursion.sql   (fn_auth_user_clinica_id + fn_auth_user_is_admin)
--
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id           UUID NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,

  -- Dados pessoais
  nome                 TEXT NOT NULL,
  cpf                  TEXT,
  data_nascimento      DATE,
  sexo                 TEXT CHECK (sexo IN ('M', 'F', 'O')),
  estado_civil         TEXT,
  profissao            TEXT,

  -- Contato
  telefone             TEXT,
  email                TEXT,
  nome_emergencia      TEXT,
  telefone_emergencia  TEXT,

  -- Endereço (JSONB)
  endereco             JSONB NOT NULL DEFAULT '{}',

  -- Plano de saúde
  convenio             TEXT,
  numero_convenio      TEXT,

  -- Outros
  observacoes          TEXT,
  ativo                BOOLEAN NOT NULL DEFAULT TRUE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica_id
  ON public.pacientes (clinica_id);

CREATE INDEX IF NOT EXISTS idx_pacientes_nome
  ON public.pacientes (clinica_id, nome);

CREATE INDEX IF NOT EXISTS idx_pacientes_cpf
  ON public.pacientes (clinica_id, cpf)
  WHERE cpf IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pacientes_ativo
  ON public.pacientes (clinica_id, ativo);

-- 3. Trigger de updated_at
CREATE TRIGGER trg_pacientes_updated_at
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 4. RLS
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado da clínica
CREATE POLICY "pacientes_select_clinica"
  ON public.pacientes FOR SELECT TO authenticated
  USING (clinica_id = public.fn_auth_user_clinica_id());

-- Insert: qualquer usuário autenticado da clínica
CREATE POLICY "pacientes_insert_clinica"
  ON public.pacientes FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.fn_auth_user_clinica_id());

-- Update: qualquer usuário autenticado da clínica
CREATE POLICY "pacientes_update_clinica"
  ON public.pacientes FOR UPDATE TO authenticated
  USING (clinica_id = public.fn_auth_user_clinica_id());

-- Delete: apenas admin
CREATE POLICY "pacientes_delete_admin"
  ON public.pacientes FOR DELETE TO authenticated
  USING (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );
