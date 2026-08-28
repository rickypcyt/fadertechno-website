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

type WelcomeEmailProps = {
  subject?: string
  content?: string
  ctaText?: string
  ctaUrl?: string | null
  image?: string | null
}

export default function WelcomeEmail({
  subject = 'Bienvenido a FADER',
  content = 'Estás dentro. A partir de ahora recibirás información sobre próximos eventos, preventas y anuncios antes que nadie.',
  ctaText = 'Comprar entradas',
  ctaUrl,
  image,
}: WelcomeEmailProps) {
  const finalCtaUrl = ctaUrl || `${siteUrl}/user/events`

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
          <Text style={subheading}>{subject}</Text>
          <div style={contentStyle}>
            {content.split('\n').map((line, i) => (
              <Text key={i} style={paragraph}>
                {line || '\u00A0'}
              </Text>
            ))}
          </div>
          {image && (
            <Img
              src={image}
              alt={subject}
              style={imageStyle}
            />
          )}
          <Section style={ctaSection}>
            <Button style={button} href={finalCtaUrl}>
              {ctaText}
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            FADER — Colectivo independiente · Alicante, España
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

const subheading: React.CSSProperties = {
  color: '#cccccc',
  fontSize: '20px',
  fontWeight: 500,
  textAlign: 'center',
  margin: '0 0 24px',
}

const contentStyle: React.CSSProperties = {
  margin: '24px 0',
}

const paragraph: React.CSSProperties = {
  color: '#aaaaaa',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0',
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

const hr: React.CSSProperties = {
  borderColor: '#222222',
  margin: '32px 0',
}

const footer: React.CSSProperties = {
  color: '#666666',
  fontSize: '13px',
  textAlign: 'center',
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  height: 'auto',
  display: 'block',
  margin: '0 auto 24px',
  borderRadius: '8px',
}
