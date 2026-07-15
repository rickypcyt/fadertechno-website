import Image from 'next/image'
import Link from 'next/link'

export default function Sessions() {
  return (
    <section id="eventos" className="sec sec-2 layout-wide" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="sessions-event sessions-event-tba reveal">
        <div className="sessions-tba">
          <span className="sessions-tba-text">TBA</span>
        </div>
        <div className="sessions-info">
          <div className="section-label">02 — Próximo evento</div>
          <h3>FADER Session 015</h3>
          <p>Próximo evento. Pronto anunciaremos line-up y fecha.</p>
          <div className="sessions-meta">
            <div className="sessions-meta-item">
              <strong>Sala</strong>
              Kalicante — Alicante
            </div>
            <div className="sessions-meta-item">
              <strong>Acceso</strong>
              +18
            </div>
          </div>
          <div className="sessions-actions">
            <Link href="#" className="nav-cta">
              Early Bird
            </Link>
            <Link href="#" className="btn btn-ghost">
              Más info
            </Link>
          </div>
        </div>
      </div>

      <div className="sessions-event reveal" style={{ marginTop: '80px' }}>
        <div className="sessions-image">
          <Image
            src="/wonderfull.jpg"
            alt="Wonderfull"
            width={400}
            height={300}
            sizes="(max-width: 860px) 100vw, 60vw"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <div className="archive-overlay" />
        </div>
        <div className="sessions-info">
          <div className="section-label">Última experiencia</div>
          <h3>Wonderfull</h3>
          <p>El evento más reciente. Lo que vivimos.</p>
          <div className="sessions-actions">
            <Link href="#archivo" className="btn btn-ghost">
              Ver archivo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
