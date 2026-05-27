-- ============================================================
-- MIGRATION 002 — Storage para Logos da Clínica
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Bucket público para logos de clínicas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinica-logos',
  'clinica-logos',
  true,
  2097152,   -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Leitura pública (qualquer pessoa pode ver o logo)
CREATE POLICY "logos_public_select"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'logos' OR bucket_id = 'clinica-logos');

-- 3. Admin pode fazer upload
CREATE POLICY "logos_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'clinica-logos'
    AND (
      SELECT role FROM public.perfis WHERE id = auth.uid()
    ) = 'admin'
  );

-- 4. Admin pode atualizar
CREATE POLICY "logos_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'clinica-logos'
    AND (
      SELECT role FROM public.perfis WHERE id = auth.uid()
    ) = 'admin'
  );

-- 5. Admin pode excluir
CREATE POLICY "logos_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'clinica-logos'
    AND (
      SELECT role FROM public.perfis WHERE id = auth.uid()
    ) = 'admin'
  );
