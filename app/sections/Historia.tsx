import { Reveal } from '@/app/components/Reveal'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function Historia({ dict }: { dict: Dictionary }) {
  const blocks = dict.historia.blocks

  return (
    <section id="historia" className="historia sec sec-4 layout-full">
      <div className="historia-inner">
        <Reveal from="left" className="historia-head">
          <div className="section-label">{dict.historia.label}</div>
          <h2>{dict.historia.title}</h2>
        </Reveal>

        <Reveal from="left" className="historia-block">
          <h3>{blocks.origen.title}</h3>
          <p>
            {blocks.origen.body}
          </p>
        </Reveal>

        <Reveal from="right" className="historia-block">
          <h3>{blocks.enfoque.title}</h3>
          <p>
            {blocks.enfoque.body}
          </p>
        </Reveal>

        <Reveal from="left" className="historia-block">
          <h3>{blocks.experiencia.title}</h3>
          <p>
            {blocks.experiencia.body}
          </p>
        </Reveal>

        <Reveal from="right" className="historia-block">
          <h3>{blocks.comunidad.title}</h3>
          <p>
            {blocks.comunidad.body}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
