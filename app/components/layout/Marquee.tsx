'use client'

import { useEffect, useRef } from 'react'

interface MarqueeProps {
  items: string[]
  speed?: number
  opacity?: number
}

export default function Marquee({
  items,
  speed = 50,
  opacity = 0.06,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--marquee-duration', `${speed}s`)
  }, [speed])

  // Dos copias exactas para un loop seamless de 0 -> -50%
  const content = [...items, ...items]

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
