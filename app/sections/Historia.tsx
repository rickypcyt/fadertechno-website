import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function Historia({ dict }: { dict: Dictionary }) {
  const blocks = dict.historia.blocks

  return (
    <section id="historia" className="historia sec sec-4 layout-wide">
      <div className="historia-inner">
        <div className="historia-head reveal reveal-left">
          <div className="section-label">{dict.historia.label}</div>
          <h2>{dict.historia.title}</h2>
        </div>

        <div className="historia-block reveal reveal-left">
          <h3>{blocks.origen.title}</h3>
          <p>
            {blocks.origen.body}
          </p>
        </div>

        <div className="historia-block reveal reveal-right">
          <h3>{blocks.enfoque.title}</h3>
          <p>
            {blocks.enfoque.body}
          </p>
        </div>

        <div className="historia-block reveal reveal-left">
          <h3>{blocks.experiencia.title}</h3>
          <p>
            {blocks.experiencia.body}
          </p>
        </div>

        <div className="historia-block reveal reveal-right">
          <h3>{blocks.comunidad.title}</h3>
          <p>
            {blocks.comunidad.body}
          </p>
        </div>
      </div>
    </section>
  )
}
