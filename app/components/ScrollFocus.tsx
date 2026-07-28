'use client'

import { useEffect } from 'react'

export default function ScrollFocus() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main > section, main > header')
    )

    if (sections.length === 0) return

    let scrollY = window.scrollY
    let vh = window.innerHeight

    const updateFocus = () => {
      const viewportCenter = scrollY + vh / 2

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i]
        const top = sec.offsetTop
        const height = sec.offsetHeight

        if (top + height < scrollY - 100 || top > scrollY + vh + 100) {
          continue
        }

        const secCenter = top + height / 2
        const distance = Math.abs(secCenter - viewportCenter)
        const maxDistance = vh * 0.7

        let targetOpacity: string
        if (distance < maxDistance) {
          const opacity = 1 - (distance / maxDistance) * 0.35
          targetOpacity = opacity.toFixed(2)
        } else {
          targetOpacity = '0.65'
        }

        if (sec.style.opacity !== targetOpacity) {
          sec.style.opacity = targetOpacity
        }
      }
    }

    updateFocus()

    let ticking = false
    const onScroll = () => {
      scrollY = window.scrollY
      if (!ticking) {
        requestAnimationFrame(() => {
          updateFocus()
          ticking = false
        })
        ticking = true
      }
    }

    const onResize = () => {
      vh = window.innerHeight
      updateFocus()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      sections.forEach((sec) => {
        sec.style.opacity = ''
      })
    }
  }, [])

  return null
}
