-- ============================================================
-- MIGRATION 003 — Corrige recursão infinita nas políticas RLS
--
-- PROBLEMA: Policies em `perfis` que consultam `perfis` causam
-- recursão infinita (PostgreSQL error 42P17).
-- Policies em `clinica` que consultam `perfis` também falham.
--
-- SOLUÇÃO: Funções SECURITY DEFINER que ignoram RLS ao serem
-- chamadas de dentro das políticas.
--
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ─── 1. Funções auxiliares (SECURITY DEFINER ignora RLS) ───────────────────

-- Retorna o clinica_id do usuário autenticado (sem RLS)
CREATE OR REPLACE FUNCTION public.fn_auth_user_clinica_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT clinica_id
  FROM perfis
  WHERE id = auth.uid()
  LIMIT 1
$$;

-- Retorna TRUE se o usuário autenticado é admin (sem RLS)
CREATE OR REPLACE FUNCTION public.fn_auth_user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM perfis
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1
  )
$$;

-- ─── 2. Remove policies antigas (recursivas) ───────────────────────────────

DROP POLICY IF EXISTS "clinica_select_autenticado"  ON public.clinica;
DROP POLICY IF EXISTS "clinica_update_admin"         ON public.clinica;
DROP POLICY IF EXISTS "perfis_select_proprio"        ON public.perfis;
DROP POLICY IF EXISTS "perfis_select_admin"          ON public.perfis;
DROP POLICY IF EXISTS "perfis_update_proprio"        ON public.perfis;
DROP POLICY IF EXISTS "perfis_update_admin"          ON public.perfis;

-- ─── 3. Recria policies sem recursão ───────────────────────────────────────

-- Clínica: usuário autenticado vê a clínica a que pertence
CREATE POLICY "clinica_select_autenticado"
  ON public.clinica FOR SELECT TO authenticated
  USING (id = public.fn_auth_user_clinica_id());

-- Clínica: somente admin pode atualizar
CREATE POLICY "clinica_update_admin"
  ON public.clinica FOR UPDATE TO authenticated
  USING (
    id = public.fn_auth_user_clinica_id()
    AND public.fn_auth_user_is_admin()
  );

-- Perfis: usuário vê o próprio perfil (nunca causa recursão)
CREATE POLICY "perfis_select_proprio"
  ON public.perfis FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Perfis: admin vê todos os perfis da mesma clínica (sem recursão)
CREATE POLICY "perfis_select_admin"
  ON public.perfis FOR SELECT TO authenticated
  USING (
    public.fn_auth_user_is_admin()
    AND clinica_id = public.fn_auth_user_clinica_id()
  );

-- Perfis: usuário atualiza o próprio perfil
CREATE POLICY "perfis_update_proprio"
  ON public.perfis FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Perfis: admin atualiza qualquer perfil da clínica
CREATE POLICY "perfis_update_admin"
  ON public.perfis FOR UPDATE TO authenticated
  USING (
    public.fn_auth_user_is_admin()
    AND clinica_id = public.fn_auth_user_clinica_id()
  );
