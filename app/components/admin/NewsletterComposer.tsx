'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  previewNewsletterEmail,
  sendNewsletter,
  sendTestEmail,
} from '@/app/actions/newsletter'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function NewsletterComposer({
  subscriberCount,
  adminEmail,
  dict,
}: {
  subscriberCount: number
  adminEmail: string
  dict: Dictionary
}) {
  const t = dict.panel.newsletter
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sendState, setSendState] = useState<{
    loading: boolean
    result?: { success?: boolean; error?: string; sent?: number }
  }>({ loading: false })
  const [testState, setTestState] = useState<{
    loading: boolean
    result?: { success?: boolean; error?: string }
  }>({ loading: false })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPreview = useCallback(async (s: string, c: string, img: string) => {
    if (!s.trim() && !c.trim() && !img.trim()) {
      setPreviewHtml('')
      return
    }
    setPreviewLoading(true)
    try {
      const html = await previewNewsletterEmail(s, c, img || undefined)
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
      fetchPreview(subject, content, image)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [subject, content, image, fetchPreview])

  const handleSend = async () => {
    setSendState({ loading: true })
    try {
      const result = await sendNewsletter(subject, content, image || undefined)
      setSendState({ loading: false, result })
      if (result.success) {
        setSubject('')
        setContent('')
        setImage('')
        setPreviewHtml('')
      }
    } catch {
      setSendState({ loading: false, result: { error: dict.panel.common.unexpectedError } })
    }
  }

  const handleTest = async () => {
    setTestState({ loading: true })
    try {
      const result = await sendTestEmail(subject, content, image || undefined)
      setTestState({ loading: false, result })
    } catch {
      setTestState({ loading: false, result: { error: dict.panel.common.unexpectedError } })
    }
  }

  return (
    <div className="newsletter-composer">
      <div className="newsletter-composer-form">
        <h2>{t.compose}</h2>

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
            placeholder={t.contentPlaceholder}
            rows={12}
            className="admin-input admin-textarea"
          />
        </label>

        <div className="newsletter-composer-actions">
          <button
            type="button"
            onClick={handleTest}
            disabled={testState.loading || !subject.trim() || !content.trim()}
            className="btn btn-ghost"
          >
            {testState.loading ? dict.panel.common.sending : t.testTo.replace('{email}', adminEmail)}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sendState.loading || !subject.trim() || !content.trim()}
            className="nav-cta"
          >
            {sendState.loading
              ? dict.panel.common.sending
              : t.sendTo.replace('{count}', String(subscriberCount))}
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
        {sendState.result?.success && (
          <div className="newsletter-success show">
            {t.sent.replace('{count}', String(sendState.result.sent))}
          </div>
        )}
        {sendState.result?.error && (
          <div style={{ color: '#ff6b6b' }}>{sendState.result.error}</div>
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
              title="Email preview"
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
