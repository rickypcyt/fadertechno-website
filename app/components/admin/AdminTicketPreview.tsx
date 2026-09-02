'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Props = {
  code: string
  eventTitle: string
  ticketType: string
  userName: string
  checkedIn: boolean
  dict: Dictionary
}

export default function AdminTicketPreview({ code, eventTitle, ticketType, userName, checkedIn, dict }: Props) {
  const [showQR, setShowQR] = useState(false)
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/verify?code=${code}`
  const t = dict.panel.tickets

  return (
    <div className="admin-ticket-preview">
      <button
        type="button"
        className="admin-ticket-toggle"
        onClick={() => setShowQR((v) => !v)}
      >
        {showQR ? t.hideQR : t.viewQR}
      </button>

      {showQR && (
        <div className="admin-ticket-qr">
          <QRCodeSVG value={verifyUrl} size={180} bgColor="#ffffff" fgColor="#0a0a0f" level="M" />
          <div className="admin-ticket-qr-code">{code}</div>
          <div className="admin-ticket-qr-status">
            {checkedIn ? t.attended : t.pendingBadge}
          </div>
        </div>
      )}
    </div>
  )
}
