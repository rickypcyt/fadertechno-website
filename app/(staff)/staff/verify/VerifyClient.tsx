'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type TicketInfo = {
  id: string
  code: string
  checkedIn: boolean
  checkedInAt: string | null
  ticketType: { name: string }
  order: {
    user: { name: string | null; email: string }
  }
  ticketTypeEvent: { title: string; startDate: string }
}

type VerifyResult = {
  status: 'valid' | 'already' | 'not_found' | 'error'
  ticket?: TicketInfo
  message: string
}

export default function VerifyClient() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [recentChecks, setRecentChecks] = useState<VerifyResult[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const verifyTicket = useCallback(async (ticketCode: string) => {
    if (!ticketCode.trim()) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ticketCode.trim() }),
      })
      const data = await res.json()
      setResult(data)
      setRecentChecks((prev) => [data, ...prev].slice(0, 5))
    } catch {
      setResult({ status: 'error', message: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }, [])

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
      setResult({ status: 'error', message: 'No se pudo acceder a la cámara' })
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
        const result = await QrScanner.scanImage(canvas)
        if (result) {
          const url = new URL(result)
          const codeParam = url.searchParams.get('code')
          if (codeParam) {
            stopCamera()
            setCode(codeParam)
            verifyTicket(codeParam)
            return
          }
        }
      } catch {}

      if (scanning) {
        requestAnimationFrame(scanFrame)
      }
    }).catch(() => {
      if (scanning) {
        requestAnimationFrame(scanFrame)
      }
    })
  }, [scanning, verifyTicket])

  const stopCamera = useCallback(() => {
    setScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const stats = {
    valid: recentChecks.filter((r) => r.status === 'valid').length,
    already: recentChecks.filter((r) => r.status === 'already').length,
    errors: recentChecks.filter((r) => r.status === 'error' || r.status === 'not_found').length,
  }

  return (
    <div className="verify-page">
      <h1>Validar entrada</h1>
      <p className="text-dim">Escanea el QR o introduce el código manualmente</p>

      <div className="verify-stats">
        <div className="verify-stat-card verify-stat-valid">
          <div className="verify-stat-icon">✓</div>
          <div className="verify-stat-num">{stats.valid}</div>
          <div className="verify-stat-label">Válidas</div>
        </div>
        <div className="verify-stat-card verify-stat-warn">
          <div className="verify-stat-icon">⚠</div>
          <div className="verify-stat-num">{stats.already}</div>
          <div className="verify-stat-label">Repetidas</div>
        </div>
        <div className="verify-stat-card verify-stat-err">
          <div className="verify-stat-icon">✗</div>
          <div className="verify-stat-num">{stats.errors}</div>
          <div className="verify-stat-label">Errores</div>
        </div>
      </div>

      <div className="verify-section">
        {!scanning ? (
          <button
            type="button"
            className="verify-camera-btn"
            onClick={startCamera}
          >
            <span className="verify-camera-icon">⬡</span>
            Abrir cámara
          </button>
        ) : (
          <div className="verify-camera-wrap">
            <div className="verify-camera-frame">
              <video
                ref={videoRef}
                playsInline
                muted
                className="verify-video"
              />
              <div className="verify-camera-overlay" />
              <div className="verify-scan-line" />
            </div>
            <button
              type="button"
              className="verify-stop-btn"
              onClick={stopCamera}
            >
              ✕ Cerrar cámara
            </button>
          </div>
        )}
      </div>

      <div className="verify-divider">
        <span>o introduce el código</span>
      </div>

      <form
        className="verify-manual"
        onSubmit={(e) => { e.preventDefault(); verifyTicket(code) }}
      >
        <input
          type="text"
          placeholder="FC-XXXXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="verify-input"
        />
        <button
          type="submit"
          className="verify-submit-btn"
          disabled={loading || !code.trim()}
        >
          {loading ? <span className="verify-spinner" /> : 'Validar'}
        </button>
      </form>

      {result && (
        <div className={`verify-result verify-result-${result.status}`}>
          <div className="verify-result-icon">
            {result.status === 'valid' && '✓'}
            {result.status === 'already' && '⚠'}
            {result.status === 'not_found' && '✗'}
            {result.status === 'error' && '✗'}
          </div>
          <div className="verify-result-body">
            {result.status === 'valid' && (
              <>
                <div className="verify-result-title">Entrada válida</div>
                {result.ticket && (
                  <>
                    <div className="verify-result-sub">{result.ticket.ticketType.name}</div>
                    <div className="verify-result-meta">
                      {result.ticket.order.user.name ?? result.ticket.order.user.email}
                    </div>
                    <div className="verify-result-code">{result.ticket.code}</div>
                  </>
                )}
              </>
            )}
            {result.status === 'already' && (
              <>
                <div className="verify-result-title">Entrada ya usada</div>
                {result.ticket && (
                  <>
                    <div className="verify-result-meta">
                      {result.ticket.order.user.name ?? result.ticket.order.user.email}
                    </div>
                    <div className="verify-result-time">
                      Validada: {result.ticket.checkedInAt && new Date(result.ticket.checkedInAt).toLocaleTimeString('es-ES')}
                    </div>
                  </>
                )}
              </>
            )}
            {result.status === 'not_found' && (
              <div className="verify-result-title">Código no encontrado</div>
            )}
            {result.status === 'error' && (
              <div className="verify-result-title">{result.message}</div>
            )}
          </div>
        </div>
      )}

      {recentChecks.length > 0 && (
        <div className="verify-recent">
          <h3 className="verify-recent-title">Validaciones recientes</h3>
          <div className="verify-recent-list">
            {recentChecks.map((check, i) => (
              <div key={i} className={`verify-recent-item verify-recent-${check.status}`}>
                <div className="verify-recent-info">
                  <div className="verify-recent-code">
                    {check.ticket?.code ?? '---'}
                  </div>
                  <div className="verify-recent-user">
                    {check.ticket?.order.user.name ?? check.ticket?.order.user.email ?? check.message}
                  </div>
                </div>
                <span className="verify-recent-badge">
                  {check.status === 'valid' ? '✓' : check.status === 'already' ? '⚠' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
