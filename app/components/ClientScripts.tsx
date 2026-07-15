'use client'

import { useEffect } from 'react'

export default function ClientScripts() {
  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => {
      if (!nav) return
      nav.style.padding = window.scrollY > 40 ? '10px 0' : '16px 0'
    }
    window.addEventListener('scroll', onScroll)

    const burger = document.getElementById('navBurger')
    const navLinks = document.getElementById('navLinks')
    const toggle = () => navLinks?.classList.toggle('open')
    burger?.addEventListener('click', toggle)

    const linkClick = () => navLinks?.classList.remove('open')
    navLinks?.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', linkClick)
    )

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
      burger?.removeEventListener('click', toggle)
      navLinks?.querySelectorAll('a').forEach((link) =>
        link.removeEventListener('click', linkClick)
      )
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  return null
}
