'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { clinicaService } from '../services/clinicaService'

interface ClinicaLogoUploadProps {
  clinicaId: string
  currentLogoUrl: string | null
}

export function ClinicaLogoUpload({ clinicaId, currentLogoUrl }: ClinicaLogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayUrl = previewUrl ?? logoUrl

  // ── Selecionar arquivo ─────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione apenas arquivos de imagem')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2 MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)

    // Limpa o input para permitir re-selecionar o mesmo arquivo
    e.target.value = ''
  }

  // ── Upload ─────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!selectedFile) return

    setIsBusy(true)
    try {
      const url = await clinicaService.uploadLogo(clinicaId, selectedFile)
      setLogoUrl(url)
      setPreviewUrl(null)
      setSelectedFile(null)
      toast.success('Logo atualizado com sucesso!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao enviar logo'
      )
    } finally {
      setIsBusy(false)
    }
  }

  // ── Cancelar seleção ───────────────────────────────────────────────────

  function handleCancel() {
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  // ── Remover logo ───────────────────────────────────────────────────────

  async function handleRemove() {
    setIsBusy(true)
    try {
      await clinicaService.removeLogo(clinicaId)
      setLogoUrl(null)
      toast.success('Logo removido com sucesso!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao remover logo'
      )
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo da Clínica</CardTitle>
        <CardDescription>
          Imagem exibida no sistema e nos documentos gerados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de preview */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Selecionar logo"
          onClick={() => !isBusy && fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !isBusy && fileInputRef.current?.click()}
          className="relative mx-auto flex h-36 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Logo da clínica"
              className="h-full w-full object-contain p-3"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="h-10 w-10" />
              <span className="text-xs text-center">Clique para selecionar</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFileSelect}
        />

        <p className="text-center text-xs text-gray-400">
          PNG, JPG, WebP ou SVG · Máximo 2 MB
        </p>

        {/* Ações */}
        <div className="flex flex-wrap justify-center gap-2">
          {/* Se há arquivo selecionado: Salvar / Cancelar */}
          {selectedFile ? (
            <>
              <Button onClick={handleUpload} disabled={isBusy} size="sm">
                <Upload className="mr-2 h-4 w-4" />
                {isBusy ? 'Enviando…' : 'Salvar Logo'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isBusy}
                size="sm"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                {logoUrl ? 'Trocar Logo' : 'Selecionar Logo'}
              </Button>
              {logoUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isBusy}
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isBusy ? 'Removendo…' : 'Remover'}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
