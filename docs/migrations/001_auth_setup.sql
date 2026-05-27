-- ============================================================
-- MIGRATION 001 — Autenticação e Perfis
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Enum de papéis de usuário
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'dentista',
  'secretaria',
  'recepcionista'
);

-- 2. Tabela da clínica (deve existir antes de perfis)
CREATE TABLE IF NOT EXISTS public.clinica (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  cnpj         TEXT UNIQUE,
  telefone     TEXT,
  email        TEXT,
  endereco     JSONB DEFAULT '{}',
  logo_url     TEXT,
  configuracoes JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de perfis (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id  UUID REFERENCES public.clinica(id) ON DELETE SET NULL,
  nome        TEXT NOT NULL,
  role        public.user_role NOT NULL DEFAULT 'recepcionista',
  avatar_url  TEXT,
  telefone    TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Função: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 5. Triggers de updated_at
CREATE TRIGGER trg_clinica_updated_at
  BEFORE UPDATE ON public.clinica
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_perfis_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 6. Função: cria perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.fn_create_profile_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'recepcionista'
    )
  );
  RETURN NEW;
END;
$$;

-- 7. Trigger: dispara ao criar usuário no Supabase Auth
CREATE OR REPLACE TRIGGER trg_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_create_profile_on_signup();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis  ENABLE ROW LEVEL SECURITY;

-- Clínica: usuário autenticado vê a clínica a que pertence
CREATE POLICY "clinica_select_autenticado"
  ON public.clinica FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT clinica_id FROM public.perfis WHERE id = auth.uid()
    )
  );

-- Clínica: somente admin da clínica pode atualizar
CREATE POLICY "clinica_update_admin"
  ON public.clinica FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT clinica_id FROM public.perfis
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Perfis: usuário vê o próprio perfil
CREATE POLICY "perfis_select_proprio"
  ON public.perfis FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Perfis: admin vê todos os perfis da mesma clínica
CREATE POLICY "perfis_select_admin"
  ON public.perfis FOR SELECT TO authenticated
  USING (
    clinica_id IN (
      SELECT clinica_id FROM public.perfis
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Perfis: usuário atualiza o próprio perfil (campos básicos)
CREATE POLICY "perfis_update_proprio"
  ON public.perfis FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Perfis: admin atualiza qualquer perfil da clínica
CREATE POLICY "perfis_update_admin"
  ON public.perfis FOR UPDATE TO authenticated
  USING (
    clinica_id IN (
      SELECT clinica_id FROM public.perfis
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- DADOS INICIAIS (opcional: crie a primeira clínica)
-- ============================================================
-- INSERT INTO public.clinica (nome, email)
-- VALUES ('Minha Clínica Odontológica', 'contato@minhaClinica.com.br');
--
-- Após criar o primeiro usuário, vincule-o à clínica como admin:
-- UPDATE public.perfis
-- SET clinica_id = '<clinica_id>', role = 'admin'
-- WHERE id = '<user_id>';
