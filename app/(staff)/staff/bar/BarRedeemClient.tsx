'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type RedeemResult = {
  ok: boolean
  rewardName?: string
  pointsSpent?: number
  redeemedAt?: string
  user?: { name: string | null; email: string }
  message?: string
  error?: string
}

export default function BarRedeemClient({ dict }: { dict: Dictionary }) {
  const t = dict.panel.userRewards
  const [token, setToken] = useState('')
  const [result, setResult] = useState<RedeemResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [recent, setRecent] = useState<RedeemResult[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const redeem = useCallback(async (rawToken: string) => {
    const trimmed = rawToken.trim()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/bar/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: trimmed }),
      })
      const data = (await res.json()) as RedeemResult
      setResult(data)
      setRecent((prev) => [data, ...prev].slice(0, 5))
    } catch {
      setResult({ ok: false, message: dict.panel.common.connectionError })
    } finally {
      setLoading(false)
    }
  }, [dict.panel.common.connectionError])

  const startCamera = useCallback(async () => {
    setScanning(true)
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanFrame()
      }
    } catch {
      setResult({ ok: false, message: 'No se pudo abrir la cámara' })
      setScanning(false)
    }
  }, [])

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    import('qr-scanner').then(async ({ default: QrScanner }) => {
      try {
        const scanned = await QrScanner.scanImage(canvas)
        if (scanned) {
          const extracted = extractToken(scanned)
          if (extracted) {
            stopCamera()
            setToken(extracted)
            redeem(extracted)
            return
          }
        }
      } catch {}
      if (scanning) requestAnimationFrame(scanFrame)
    }).catch(() => {
      if (scanning) requestAnimationFrame(scanFrame)
    })
  }, [scanning, redeem])

  const stopCamera = useCallback(() => {
    setScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const stats = {
    valid: recent.filter((r) => r.ok).length,
    failed: recent.filter((r) => !r.ok).length,
  }

  return (
    <div className="verify-page">
      <h1>Canje bar</h1>
      <p className="text-dim">Escanea el QR de la recompensa del cliente.</p>

      <div className="verify-stats">
        <div className="verify-stat-card verify-stat-valid">
          <div className="verify-stat-icon">✓</div>
          <div className="verify-stat-num">{stats.valid}</div>
          <div className="verify-stat-label">Canjeadas</div>
        </div>
        <div className="verify-stat-card verify-stat-err">
          <div className="verify-stat-icon">✗</div>
          <div className="verify-stat-num">{stats.failed}</div>
          <div className="verify-stat-label">Errores</div>
        </div>
      </div>

      <div className="verify-section">
        {!scanning ? (
          <button type="button" className="verify-camera-btn" onClick={startCamera}>
            <span className="verify-camera-icon">⬡</span>
            Abrir cámara
          </button>
        ) : (
          <div className="verify-camera-wrap">
            <div className="verify-camera-frame">
              <video ref={videoRef} playsInline muted className="verify-video" />
              <div className="verify-camera-overlay" />
              <div className="verify-scan-line" />
            </div>
            <button type="button" className="verify-stop-btn" onClick={stopCamera}>
              Cerrar cámara
            </button>
          </div>
        )}
      </div>

      <div className="verify-divider"><span>o pega el código</span></div>

      <form className="verify-manual" onSubmit={(e) => { e.preventDefault(); redeem(token) }}>
        <input
          type="text"
          placeholder="Token..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="verify-input"
        />
        <button type="submit" className="verify-submit-btn" disabled={loading || !token.trim()}>
          {loading ? <span className="verify-spinner" /> : 'Validar'}
        </button>
      </form>

      {result && (
        <div className={`verify-result verify-result-${result.ok ? 'valid' : 'error'}`}>
          <div className="verify-result-icon">{result.ok ? '✓' : '✗'}</div>
          <div className="verify-result-body">
            {result.ok ? (
              <>
                <div className="verify-result-title">{result.rewardName}</div>
                <div className="verify-result-sub">−{result.pointsSpent} {t.points}</div>
                <div className="verify-result-meta">
                  {result.user?.name ?? result.user?.email}
                </div>
              </>
            ) : (
              <div className="verify-result-title">{result.message}</div>
            )}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="verify-recent">
          <h3 className="verify-recent-title">Recientes</h3>
          <div className="verify-recent-list">
            {recent.map((check, i) => (
              <div key={i} className={`verify-recent-item verify-recent-${check.ok ? 'valid' : 'err'}`}>
                <div className="verify-recent-info">
                  <div className="verify-recent-code">
                    {check.ok ? check.rewardName : '---'}
                  </div>
                  <div className="verify-recent-user">
                    {check.ok ? (check.user?.name ?? check.user?.email) : check.message}
                  </div>
                </div>
                <span className="verify-recent-badge">{check.ok ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Extracts the redemption token from a scanned QR URL like .../redeem/<token>. */
function extractToken(scanned: string): string | null {
  try {
    const url = new URL(scanned)
    const segments = url.pathname.split('/').filter(Boolean)
    const redeemIdx = segments.lastIndexOf('redeem')
    if (redeemIdx !== -1 && segments[redeemIdx + 1]) {
      return segments[redeemIdx + 1]
    }
    return null
  } catch {
    // Not a URL — maybe a raw token was encoded.
    return /^[a-f0-9]{64}$/i.test(scanned) ? scanned : null
  }
}
