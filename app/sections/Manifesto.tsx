import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function Manifesto({ dict }: { dict: Dictionary }) {
  return (
    <section id="manifesto" className="manifesto sec sec-1 layout-wide">
      <div className="manifesto-inner">
        <div className="manifesto-content reveal reveal-left">
        <div className="section-label">{dict.manifesto.label}</div>
        <p>
          {dict.manifesto.body}
        </p>
        </div>
      </div>
    </section>
  )
}
