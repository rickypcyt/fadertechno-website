import NewsletterForm from '@/app/components/NewsletterForm'

export default function Editorial() {
  return (
    <section id="editorial" className="editorial sec sec-6 layout-wide">
      <div className="reveal">
        <div className="section-label" style={{ marginBottom: '40px' }}>06 — Newsletter</div>
        <h2>Suscríbete a nuestro<br />newsletter</h2>
        <p>
          Recibe información sobre próximos eventos, preventas y anuncios
          antes de su publicación.
        </p>
        <NewsletterForm />
      </div>
    </section>
  )
}
