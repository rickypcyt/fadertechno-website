'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  previewWelcomeEmail,
  saveWelcomeEmailConfig,
  sendWelcomeTestEmail,
  type WelcomeEmailConfig,
} from '@/app/actions/welcome-email'

export default function WelcomeEmailComposer({
  initialConfig,
  adminEmail,
}: {
  initialConfig: WelcomeEmailConfig
  adminEmail: string
}) {
  const [subject, setSubject] = useState(initialConfig.subject)
  const [content, setContent] = useState(initialConfig.content)
  const [ctaText, setCtaText] = useState(initialConfig.ctaText)
  const [ctaUrl, setCtaUrl] = useState(initialConfig.ctaUrl)
  const [image, setImage] = useState(initialConfig.image)
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saveState, setSaveState] = useState<{
    loading: boolean
    result?: { success?: boolean; error?: string }
  }>({ loading: false })
  const [testState, setTestState] = useState<{
    loading: boolean
    result?: { success?: boolean; error?: string }
  }>({ loading: false })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentConfig: WelcomeEmailConfig = {
    subject,
    content,
    ctaText,
    ctaUrl,
    image,
  }

  const fetchPreview = useCallback(async (config: WelcomeEmailConfig) => {
    if (!config.subject.trim() && !config.content.trim()) {
      setPreviewHtml('')
      return
    }
    setPreviewLoading(true)
    try {
      const html = await previewWelcomeEmail(config)
      setPreviewHtml(html)
    } catch {
      setPreviewHtml('')
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchPreview(currentConfig)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, content, ctaText, ctaUrl, image, fetchPreview])

  const handleSave = async () => {
    setSaveState({ loading: true })
    try {
      const result = await saveWelcomeEmailConfig(currentConfig)
      setSaveState({ loading: false, result })
    } catch {
      setSaveState({ loading: false, result: { error: 'Error inesperado' } })
    }
  }

  const handleTest = async () => {
    setTestState({ loading: true })
    try {
      const result = await sendWelcomeTestEmail(currentConfig)
      setTestState({ loading: false, result })
    } catch {
      setTestState({ loading: false, result: { error: 'Error inesperado' } })
    }
  }

  return (
    <div className="newsletter-composer">
      <div className="newsletter-composer-form">
        <h2>Email de bienvenida</h2>
        <p className="text-dim" style={{ marginBottom: '20px' }}>
          Se envía automáticamente cuando alguien se suscribe a la newsletter.
        </p>

        <label className="admin-form-label">
          Asunto
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Asunto del email"
            className="admin-input"
          />
        </label>

        <label className="admin-form-label">
          Imagen (URL)
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://... (opcional)"
            className="admin-input"
          />
        </label>

        <label className="admin-form-label">
          Contenido
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe el contenido del email..."
            rows={8}
            className="admin-input admin-textarea"
          />
        </label>

        <label className="admin-form-label">
          Texto del botón
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="Comprar entradas"
            className="admin-input"
          />
        </label>

        <label className="admin-form-label">
          URL del botón (opcional)
          <input
            type="url"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder="Vacío = próximo evento"
            className="admin-input"
          />
        </label>

        <div className="newsletter-composer-actions">
          <button
            type="button"
            onClick={handleTest}
            disabled={
              testState.loading || !subject.trim() || !content.trim()
            }
            className="btn btn-ghost"
          >
            {testState.loading ? 'Enviando...' : `Probar a ${adminEmail}`}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={
              saveState.loading ||
              !subject.trim() ||
              !content.trim() ||
              !ctaText.trim()
            }
            className="nav-cta"
          >
            {saveState.loading ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>

        {testState.result?.success && (
          <div className="newsletter-success show">
            Email de prueba enviado a {adminEmail}
          </div>
        )}
        {testState.result?.error && (
          <div style={{ color: '#ff6b6b' }}>{testState.result.error}</div>
        )}
        {saveState.result?.success && (
          <div className="newsletter-success show">
            Configuración guardada.
          </div>
        )}
        {saveState.result?.error && (
          <div style={{ color: '#ff6b6b' }}>{saveState.result.error}</div>
        )}
      </div>

      <div className="newsletter-preview">
        <div className="newsletter-preview-header">
          <h3>Preview en vivo</h3>
          {previewLoading && (
            <span className="text-dim" style={{ fontSize: '1rem' }}>
              actualizando...
            </span>
          )}
        </div>
        <div className="newsletter-preview-frame">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              title="Welcome email preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#0a0a0a',
              }}
            />
          ) : (
            <div
              className="text-dim"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
              }}
            >
              Escribe un asunto y contenido para ver el preview
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
