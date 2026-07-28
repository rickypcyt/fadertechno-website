'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientScripts() {
  const pathname = usePathname()

  useEffect(() => {
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        el.classList.add('visible')
      })
    }, 3000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('hashchange', onHashChange)
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [pathname])

  return null
}
