import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

type TicketEmailProps = {
  eventTitle: string
  ticketType: string
  eventDate: string
  venue: string
  city?: string | null
  code: string
  qrDataUrl: string
  userName?: string | null
}

export default function TicketEmail({
  eventTitle,
  ticketType,
  eventDate,
  venue,
  city,
  code,
  qrDataUrl,
  userName,
}: TicketEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu entrada para {eventTitle} — FADER</Preview>
      <Body style={{ backgroundColor: '#0a0a0f', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#12121a', maxWidth: '480px', margin: '0 auto', padding: '40px 24px', borderRadius: '12px' }}>
          <Text style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            FADER
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 32px' }}>
            Entrada confirmada
          </Text>

          <Text style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, margin: '0 0 24px' }}>
            {eventTitle}
          </Text>

          <Section style={{ backgroundColor: '#0a0a0f', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
            <Text style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Tipo
            </Text>
            <Text style={{ color: '#ffffff', fontSize: '14px', margin: '0 0 16px' }}>
              {ticketType}
            </Text>

            <Text style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Fecha
            </Text>
            <Text style={{ color: '#ffffff', fontSize: '14px', margin: '0 0 16px' }}>
              {eventDate}
            </Text>

            <Text style={{ color: '#9ca3af', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Sala
            </Text>
            <Text style={{ color: '#ffffff', fontSize: '14px', margin: '0 0 24px' }}>
              {venue}{city ? `, ${city}` : ''}
            </Text>

            <Hr style={{ borderColor: '#2a2a35', margin: '0 0 24px' }} />

            <Section style={{ textAlign: 'center' }}>
              <Img
                src={qrDataUrl}
                alt={`QR ${code}`}
                width="200"
                height="200"
                style={{ margin: '0 auto', display: 'block' }}
              />
              <Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em', margin: '16px 0 0' }}>
                {code}
              </Text>
            </Section>
          </Section>

          <Text style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.6', margin: '0 0 24px' }}>
            Muestra este QR en la entrada del evento. {userName ? `Nos vemos ahí, ${userName}.` : 'Nos vemos ahí.'}
          </Text>

          <Button
            href={`${siteUrl}/user/tickets`}
            style={{ backgroundColor: '#ffffff', color: '#0a0a0f', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }}
          >
            Ver mis entradas
          </Button>

          <Hr style={{ borderColor: '#2a2a35', margin: '32px 0' }} />
          <Text style={{ color: '#6b7280', fontSize: '11px' }}>
            © 2026 FADER Colectivo. Alicante, España.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
