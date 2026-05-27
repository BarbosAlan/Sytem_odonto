-- ============================================================
-- MIGRATION 007 — Tabela Agendamentos
--
-- Pré-requisitos:
--   001_auth_setup.sql          (clinica + perfis)
--   003_fix_rls_recursion.sql   (fn_auth_user_clinica_id + fn_auth_user_is_admin)
--   004_dentistas.sql           (dentistas)
--   005_procedimentos.sql       (procedimentos)
--   006_pacientes.sql           (pacientes)
--
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id        UUID NOT NULL REFERENCES public.clinica(id) ON DELETE CASCADE,
  paciente_id       UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  dentista_id       UUID NOT NULL REFERENCES public.dentistas(id) ON DELETE RESTRICT,
  procedimento_id   UUID REFERENCES public.procedimentos(id) ON DELETE SET NULL,

  data_hora         TIMESTAMPTZ NOT NULL,
  duracao_minutos   INT NOT NULL DEFAULT 30,
  status            TEXT NOT NULL DEFAULT 'agendado',

  observacoes       TEXT,
  cor               TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT agendamentos_status_check CHECK (
    status IN (
      'agendado', 'confirmado', 'em_atendimento',
      'concluido', 'cancelado', 'faltou'
    )
  ),
  CONSTRAINT agendamentos_duracao_check CHECK (
    duracao_minutos > 0 AND duracao_minutos <= 480
  )
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_agendamentos_clinica_id
  ON public.agendamentos (clinica_id);

CREATE INDEX IF NOT EXISTS idx_agendamentos_dentista_data
  ON public.agendamentos (clinica_id, dentista_id, data_hora);

CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente
  ON public.agendamentos (clinica_id, paciente_id)
  WHERE paciente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_agendamentos_status
  ON public.agendamentos (clinica_id, status);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora
  ON public.agendamentos (clinica_id, data_hora);

-- 3. Trigger de updated_at
CREATE TRIGGER trg_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 4. RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer usuário autenticado da clínica
CREATE POLICY "agendamentos_select_clinica"
  ON public.agendamentos FOR SELECT TO authenticated
  USING (clinica_id = public.fn_auth_user_clinica_id());

-- Insert: qualquer usuário autenticado da clínica
CREATE POLICY "agendamentos_insert_clinica"
  ON public.agendamentos FOR INSERT TO authenticated
  WITH CHECK (clinica_id = public.fn_auth_user_clinica_id());

-- Update: qualquer usuário autenticado da clínica
CREATE POLICY "agendamentos_update_clinica"
  ON public.agendamentos FOR UPDATE TO authenticated
  USING (clinica_id = public.fn_auth_user_clinica_id());

-- Delete: apenas admin
CREATE POLICY "agendamentos_delete_admin"
  ON public.agendamentos FOR DELETE TO authenticated
  USING (
    clinica_id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );
