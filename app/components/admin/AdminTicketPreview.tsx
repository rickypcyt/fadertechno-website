'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

type Props = {
  code: string
  eventTitle: string
  ticketType: string
  userName: string
  checkedIn: boolean
}

export default function AdminTicketPreview({ code, eventTitle, ticketType, userName, checkedIn }: Props) {
  const [showQR, setShowQR] = useState(false)
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/verify?code=${code}`

  return (
    <div className="admin-ticket-preview">
      <button
        type="button"
        className="admin-ticket-toggle"
        onClick={() => setShowQR((v) => !v)}
      >
        {showQR ? 'Ocultar QR' : 'Ver QR'}
      </button>

      {showQR && (
        <div className="admin-ticket-qr">
          <QRCodeSVG value={verifyUrl} size={180} bgColor="#ffffff" fgColor="#0a0a0f" level="M" />
          <div className="admin-ticket-qr-code">{code}</div>
          <div className="admin-ticket-qr-status">
            {checkedIn ? '✓ Asistió' : 'Pendiente'}
          </div>
        </div>
      )}
    </div>
  )
}
