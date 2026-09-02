import NewsletterForm from '@/app/components/NewsletterForm'
import { Reveal } from '@/app/components/Reveal'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function Editorial({ dict }: { dict: Dictionary }) {
  return (
    <section id="editorial" className="editorial sec sec-6 layout-wide">
      <Reveal>
        <div className="section-label" style={{ marginBottom: '40px', textAlign: 'right' }}>{dict.editorial.label}</div>
        <h2>{dict.editorial.title}</h2>
        <p>
          {dict.editorial.intro}
        </p>
        <NewsletterForm dict={dict} />
      </Reveal>
    </section>
  )
}
