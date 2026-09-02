import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function Hero({ dict }: { dict: Dictionary }) {
  return (
    <header className="hero layout-full">
      <span className="hero-tag">
        {dict.hero.tag}
      </span>
      <p className="hero-desc">
        {dict.hero.desc}
      </p>
    </header>
  )
}
