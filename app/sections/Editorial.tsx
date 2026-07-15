import NewsletterForm from '@/app/components/NewsletterForm'
import RegisterModal from '@/app/components/RegisterModal'

export default function Editorial() {
  return (
    <section id="editorial" className="editorial sec sec-6">
      <div className="reveal">
        <div className="section-label" style={{ marginBottom: '40px' }}>06 — Newsletter</div>
        <h2>Recibe<br />nuestra info</h2>
        <p>
          Recibe información sobre próximos eventos, preventas y anuncios
          antes de su publicación.
        </p>
        <NewsletterForm />
        <div className="newsletter-actions">
          <RegisterModal />
          <a
            href="#"
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Comunidad WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
