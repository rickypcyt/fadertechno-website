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

  // Dos copias exactas para un loop seamless de 0 -> -50%
  const content = [...items, ...items]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respetar preferencia de movimiento reducido
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) return

    let anim: Animation | undefined
    let ro: ResizeObserver | undefined

    const start = () => {
      // Forzar layout antes de medir
      const width = el.scrollWidth
      if (width <= 0) return
      const distance = width / 2 // una copia completa

      anim?.cancel()
      anim = el.animate(
        [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: `translate3d(${-distance}px, 0, 0)` },
        ],
        {
          duration: speed * 1000,
          iterations: Infinity,
          easing: 'linear',
        }
      )
    }

    start()

    // Recalcular si cambia el tamaño (rotacion, responsive font-size)
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => start())
      ro.observe(el)
    }

    return () => {
      anim?.cancel()
      ro?.disconnect()
    }
  }, [speed, items])

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
