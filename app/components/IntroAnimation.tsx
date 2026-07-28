'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function IntroAnimation() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!show) return null

  return (
    <div
      className="intro-overlay"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setShow(false)
      }}
    >
      <div className="intro-content">
        <div className="intro-logo">
          <Image
            src="/logofader.png"
            alt="FADER"
            width={500}
            height={500}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        <div className="intro-text">
          <span>F</span>
          <span>A</span>
          <span>D</span>
          <span>E</span>
          <span>R</span>
        </div>
      </div>
    </div>
  )
}
