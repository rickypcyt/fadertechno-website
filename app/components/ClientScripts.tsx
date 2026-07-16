'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientScripts() {
  const pathname = usePathname()

  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => {
      if (!nav) return
      nav.style.padding = window.scrollY > 40 ? '10px 0' : '16px 0'
    }
    window.addEventListener('scroll', onScroll)

    const onHashChange = () => {
      if (window.location.hash) {
        const id = window.location.hash.slice(1)
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
        history.replaceState(null, '', window.location.pathname)
      }
    }
    window.addEventListener('hashchange', onHashChange)

    if (window.location.hash) {
      const id = window.location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
        })
      }
      history.replaceState(null, '', window.location.pathname)
    }

    const reveals = document.querySelectorAll('.reveal')
    reveals.forEach((el) => el.classList.add('reveal-animate'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.01, rootMargin: '0px' }
    )
    reveals.forEach((el) => observer.observe(el))

    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll('.reveal-animate:not(.visible)').forEach((el) => {
        el.classList.add('visible')
      })
    }, 300)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', onHashChange)
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [pathname])

  return null
}
