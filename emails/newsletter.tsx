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

type NewsletterEmailProps = {
  subject?: string
  content?: string
  image?: string
  ticketsUrl?: string | null
}

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://faderclub.com'

export default function NewsletterEmail({
  subject = 'Newsletter FADER',
  content = 'Escribe aquí el contenido del newsletter...',
  image,
  ticketsUrl,
}: NewsletterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${siteUrl}/logo.jpeg`}
            alt="FADER"
            width={80}
            height={80}
            style={logo}
          />
          <Text style={subjectStyle}>{subject}</Text>
          <Hr style={hr} />
          {image && (
            <Img
              src={image}
              alt={subject}
              style={imageStyle}
            />
          )}
          <div style={contentStyle}>
            {content.split('\n').map((line, i) => (
              <Text key={i} style={paragraph}>
                {line || '\u00A0'}
              </Text>
            ))}
          </div>
          {ticketsUrl && (
            <Section style={ctaSection}>
              <Button style={button} href={ticketsUrl}>
                Comprar entradas
              </Button>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            FADER — Colectivo independiente · Alicante, España
          </Text>
          <Text style={unsubscribe}>
            Si no quieres recibir más emails, responde a este correo con
            &quot;unsubscribe&quot;.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  padding: '40px 20px',
  maxWidth: '560px',
  margin: '0 auto',
}

const logo: React.CSSProperties = {
  display: 'block',
  margin: '0 auto 24px',
  borderRadius: '8px',
}

const subjectStyle: React.CSSProperties = {
  color: '#cccccc',
  fontSize: '22px',
  fontWeight: 600,
  textAlign: 'center',
  margin: '0 0 24px',
}

const hr: React.CSSProperties = {
  borderColor: '#222222',
  margin: '24px 0',
}

const contentStyle: React.CSSProperties = {
  margin: '24px 0',
}

const paragraph: React.CSSProperties = {
  color: '#aaaaaa',
  fontSize: '16px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const footer: React.CSSProperties = {
  color: '#666666',
  fontSize: '13px',
  textAlign: 'center',
}

const unsubscribe: React.CSSProperties = {
  color: '#444444',
  fontSize: '12px',
  textAlign: 'center',
  marginTop: '16px',
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  height: 'auto',
  display: 'block',
  margin: '0 auto 24px',
  borderRadius: '8px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0',
}

const button: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#0a0a0a',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '6px',
  display: 'inline-block',
}
