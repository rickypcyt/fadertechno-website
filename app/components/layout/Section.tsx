type Width = 'full' | 'wide' | 'normal' | 'narrow' | 'tight'

const widthMap: Record<Width, string> = {
  full: 'layout-full',
  wide: 'layout-wide',
  normal: 'layout-normal',
  narrow: 'layout-narrow',
  tight: 'layout-tight',
}

interface SectionProps {
  children: React.ReactNode
  width?: Width
  bg?: 'dark' | 'darker' | 'black' | 'elevated'
  id?: string
  className?: string
  divider?: boolean
}

export function Section({
  children,
  width = 'normal',
  bg = 'dark',
  id,
  className = '',
  divider = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`sec sec-${bg} ${widthMap[width]} ${className} ${divider ? 'sec-divider' : ''}`}
    >
      {divider && <div className="sec-line" />}
      {children}
    </section>
  )
}

interface SplitProps {
  children: React.ReactNode
  leftSpan?: number
  rightSpan?: number
  reverse?: boolean
  className?: string
}

export function Split({
  children,
  leftSpan = 6,
  rightSpan = 6,
  reverse = false,
  className = '',
}: SplitProps) {
  const [left, right] = Array.isArray(children) ? children : [children]
  return (
    <div className={`split ${reverse ? 'split-reverse' : ''} ${className}`}>
      <div className={`split-left col-${leftSpan}`}>{left}</div>
      <div className={`split-right col-${rightSpan}`}>{right}</div>
    </div>
  )
}

interface StickyProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  sidebarSpan?: number
  contentSpan?: number
}

export function StickySection({
  sidebar,
  children,
  sidebarSpan = 4,
  contentSpan = 8,
}: StickyProps) {
  return (
    <div className="sticky-layout">
      <div className={`sticky-sidebar col-${sidebarSpan}`}>{sidebar}</div>
      <div className={`sticky-content col-${contentSpan}`}>{children}</div>
    </div>
  )
}

interface NumberBlockProps {
  number: string
  label: string
  children: React.ReactNode
}

export function NumberBlock({ number, label, children }: NumberBlockProps) {
  return (
    <div className="number-block reveal">
      <div className="number-block-head">
        <span className="number-block-num">{number}</span>
        <span className="number-block-label">{label}</span>
      </div>
      <div className="number-block-body">{children}</div>
    </div>
  )
}

interface AsymGridProps {
  children: React.ReactNode
  spans?: number[]
  className?: string
}

export function AsymGrid({
  children,
  spans = [8, 4, 5, 7],
  className = '',
}: AsymGridProps) {
  const items = Array.isArray(children) ? children : [children]
  return (
    <div className={`asym-grid ${className}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className={`asym-item col-${spans[i % spans.length]}`}
        >
          {item}
        </div>
      ))}
    </div>
  )
}
