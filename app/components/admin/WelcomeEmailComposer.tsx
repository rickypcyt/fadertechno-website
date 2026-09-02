'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  previewWelcomeEmail,
  saveWelcomeEmailConfig,
  sendWelcomeTestEmail,
  type WelcomeEmailConfig,
} from '@/app/actions/welcome-email'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function WelcomeEmailComposer({
  initialConfig,
  adminEmail,
  dict,
}: {
  initialConfig: WelcomeEmailConfig
  adminEmail: string
  dict: Dictionary
}) {
  const t = dict.panel.newsletter
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
      setSaveState({ loading: false, result: { error: dict.panel.common.unexpectedError } })
    }
  }

  const handleTest = async () => {
    setTestState({ loading: true })
    try {
      const result = await sendWelcomeTestEmail(currentConfig)
      setTestState({ loading: false, result })
    } catch {
      setTestState({ loading: false, result: { error: dict.panel.common.unexpectedError } })
    }
  }

  return (
    <div className="newsletter-composer">
      <div className="newsletter-composer-form">
        <h2>{t.welcomeEmail}</h2>
        <p className="text-dim" style={{ marginBottom: '20px' }}>
          {t.welcomeAuto}
        </p>

        <label className="admin-form-label">
          {t.subject}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t.subjectPlaceholder}
            className="admin-input"
          />
        </label>

        <label className="admin-form-label">
          {t.imageLabel}
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder={t.imagePlaceholder}
            className="admin-input"
          />
        </label>

        <label className="admin-form-label">
          {t.contentLabel}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.welcomeContentPlaceholder}
            rows={8}
            className="admin-input admin-textarea"
          />
        </label>

        <label className="admin-form-label">
          {t.ctaTextLabel}
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder={t.ctaTextPlaceholder}
            className="admin-input"
          />
        </label>

        <label className="admin-form-label">
          {t.ctaUrlLabel}
          <input
            type="url"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder={t.ctaUrlPlaceholder}
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
            {testState.loading ? dict.panel.common.sending : t.testTo.replace('{email}', adminEmail)}
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
            {saveState.loading ? dict.panel.common.saving : t.saveConfig}
          </button>
        </div>

        {testState.result?.success && (
          <div className="newsletter-success show">
            {t.testSent.replace('{email}', adminEmail)}
          </div>
        )}
        {testState.result?.error && (
          <div style={{ color: '#ff6b6b' }}>{testState.result.error}</div>
        )}
        {saveState.result?.success && (
          <div className="newsletter-success show">
            {t.configSaved}
          </div>
        )}
        {saveState.result?.error && (
          <div style={{ color: '#ff6b6b' }}>{saveState.result.error}</div>
        )}
      </div>

      <div className="newsletter-preview">
        <div className="newsletter-preview-header">
          <h3>{t.livePreview}</h3>
          {previewLoading && (
            <span className="text-dim" style={{ fontSize: '1rem' }}>
              {t.updating}
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
              {t.previewEmpty}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
