'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

type Props = {
  code: string
  eventTitle: string
  ticketType: string
  eventDate: string
  venue: string
}

export default function TicketQR({ code, eventTitle, ticketType, eventDate, venue }: Props) {
  const [showQR, setShowQR] = useState(false)

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/verify?code=${code}`

  return (
    <div className="ticket-card">
      <div className="ticket-card-notch" />

      <div className="ticket-card-header">
        <div className="ticket-card-event">{eventTitle}</div>
        <span className="ticket-badge">VÁLIDA</span>
      </div>

      <div className="ticket-card-meta">
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Tipo</span>
          <span className="ticket-meta-value">{ticketType}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Fecha</span>
          <span className="ticket-meta-value">{eventDate}</span>
        </div>
        <div className="ticket-meta-row">
          <span className="ticket-meta-label">Sala</span>
          <span className="ticket-meta-value">{venue}</span>
        </div>
      </div>

      <div className="ticket-card-divider" />

      <div className="ticket-card-footer">
        <div className="ticket-code">{code}</div>
        <button
          type="button"
          className="ticket-qr-toggle"
          onClick={() => setShowQR((v) => !v)}
          aria-expanded={showQR}
        >
          {showQR ? '✕ Cerrar' : '⬡ Mostrar QR'}
        </button>
      </div>

      {showQR && (
        <div className="ticket-qr-container">
          <div className="ticket-qr-frame">
            <QRCodeSVG
              value={verifyUrl}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#0a0a12"
              marginSize={0}
            />
            <div className="ticket-qr-corner ticket-qr-corner-tl" />
            <div className="ticket-qr-corner ticket-qr-corner-tr" />
            <div className="ticket-qr-corner ticket-qr-corner-bl" />
            <div className="ticket-qr-corner ticket-qr-corner-br" />
          </div>
          <p className="ticket-qr-hint">Muestra este código en la entrada</p>
        </div>
      )}
    </div>
  )
}
