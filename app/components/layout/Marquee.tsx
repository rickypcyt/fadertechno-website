'use client'

import { useEffect, useRef } from 'react'

interface MarqueeProps {
  items: string[]
  speed?: number
  opacity?: number
}

export default function Marquee({
  items,
  speed = 40,
  opacity = 0.06,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.animationDuration = `${speed}s`
  }, [speed])

  const content = [...items, ...items, ...items]

  return (
    <div className="marquee" style={{ opacity }}>
      <div className="marquee-track" ref={ref}>
        {content.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
