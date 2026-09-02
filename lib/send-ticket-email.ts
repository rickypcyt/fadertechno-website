import QRCode from 'qrcode'
import { render } from '@react-email/render'
import { resend, FROM_EMAIL } from '@/lib/resend'
import TicketEmail from '@/emails/ticket'
import { formatFullDate } from '@/lib/dates'

interface SendTicketEmailParams {
  to: string
  eventTitle: string
  ticketType: string
  eventDate: Date
  venue: string
  city?: string | null
  code: string
  verifyUrl: string
  userName?: string | null
}

export async function sendTicketEmail({
  to,
  eventTitle,
  ticketType,
  eventDate,
  venue,
  city,
  code,
  verifyUrl,
  userName,
}: SendTicketEmailParams) {
  // Generate QR as data URL (base64 PNG)
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#0a0a0f', light: '#ffffff' },
  })

  const html = await render(
    TicketEmail({
      eventTitle,
      ticketType,
      eventDate: formatFullDate(eventDate),
      venue,
      city,
      code,
      qrDataUrl,
      userName,
    })
  )

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Tu entrada para ${eventTitle} — FADER`,
    html,
  })
}
