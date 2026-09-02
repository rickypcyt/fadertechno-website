'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientScripts() {
  const pathname = usePathname()

  useEffect(() => {
    const segments = pathname.split('/')
    const maybeLang = segments[1]
    if (maybeLang === 'es' || maybeLang === 'en') {
      document.documentElement.lang = maybeLang
    }

    const nav = document.getElementById('nav')
    const progressBar = document.getElementById('scroll-progress')
    const glow = document.getElementById('cursor-glow')

    const onScroll = () => {
      if (progressBar) {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        progressBar.style.width = `${progress}%`
      }
    }
    window.addEventListener('scroll', onScroll)

    const onMouseMove = (e: MouseEvent) => {
      if (!glow) return
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    window.addEventListener('mousemove', onMouseMove)

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

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [pathname])

  return null
}
