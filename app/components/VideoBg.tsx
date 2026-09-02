'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

const VIDEOS = [
  '/fader.mp4',
  '/banner2.mp4',
  '/banner3.mp4',
  '/banner4.mp4',
]

const CROSSFADE_MS = 2000
const STORAGE_KEY = 'video-bg-index'

type Slot = 0 | 1

export default function VideoBg() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoA = useRef<HTMLVideoElement>(null)
  const videoB = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState<Slot>(0)
  const [index, setIndex] = useState(0)
  const [instantSwap, setInstantSwap] = useState(false)

  const activeRef = useRef<Slot>(0)
  const indexRef = useRef(0)
  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => {
    indexRef.current = index
  }, [index])

  const getEl = useCallback((s: Slot) => (s === 0 ? videoA.current : videoB.current), [])

  const tryPlay = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return
    const p = el.play()
    if (!p) return
    p.catch(() => {
      const resume = () => {
        el.play().catch(() => {})
      }
      document.addEventListener('click', resume, { once: true })
      document.addEventListener('touchstart', resume, { once: true })
      document.addEventListener('keydown', resume, { once: true })
    })
  }, [])

  // Crossfade to the next video. The inactive slot already has the next video
  // preloaded — we just start it and swap opacity.
  const crossfadeToNext = useCallback(() => {
    const nextSlot: Slot = activeRef.current === 0 ? 1 : 0
    const nextIndex = (indexRef.current + 1) % VIDEOS.length
    const el = getEl(nextSlot)
    if (!el) return

    // Start the incoming video from the beginning
    try {
      el.currentTime = 0
      el.playbackRate = 1
    } catch {}
    tryPlay(el)

    setActive(nextSlot)
    setIndex(nextIndex)

    // After the crossfade finishes, preload the following video into the
    // now-inactive slot so it's ready for the next transition.
    window.setTimeout(() => {
      const inactiveSlot: Slot = nextSlot === 0 ? 1 : 0
      const followingIndex = (nextIndex + 1) % VIDEOS.length
      const inel = getEl(inactiveSlot)
      if (!inel) return
      inel.pause()
      try {
        inel.removeAttribute('src')
        inel.load()
      } catch {}
      inel.src = VIDEOS[followingIndex]
      inel.load()
    }, CROSSFADE_MS + 500)
  }, [getEl, tryPlay])

  // When the active video ends, crossfade to the next one
  const handleEnded = useCallback(() => {
    crossfadeToNext()
  }, [crossfadeToNext])

  // Reduced motion => instant swap, no crossfade
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInstantSwap(true)
    }
  }, [])

  // Restore last index from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const i = parseInt(saved, 10)
        if (!isNaN(i) && i >= 0 && i < VIDEOS.length) {
          setIndex(i)
          indexRef.current = i
        }
      }
    } catch {}
  }, [])

  // Persist index
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(index))
    } catch {}
  }, [index])

  // Bootstrap: load current video into active slot, preload next into inactive
  useEffect(() => {
    const currentEl = getEl(activeRef.current)
    if (currentEl) {
      currentEl.playbackRate = 1
      currentEl.src = VIDEOS[indexRef.current]
      currentEl.load()
      tryPlay(currentEl)
    }

    // Preload next video into inactive slot
    const nextSlot: Slot = activeRef.current === 0 ? 1 : 0
    const nextIndex = (indexRef.current + 1) % VIDEOS.length
    const nextEl = getEl(nextSlot)
    if (nextEl) {
      nextEl.playbackRate = 1
      nextEl.src = VIDEOS[nextIndex]
      nextEl.load()
    }
  }, [getEl, tryPlay])

  // Resume active video when returning to the tab
  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) tryPlay(getEl(activeRef.current))
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [getEl, tryPlay])

  return (
    <div className="video-bg" ref={containerRef} aria-hidden>
      <video
        ref={videoA}
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        className={active === 0 ? 'is-active' : 'is-hidden'}
        style={instantSwap ? { transition: 'none' } : undefined}
      />
      <video
        ref={videoB}
        muted
        playsInline
        preload="auto"
        onEnded={handleEnded}
        className={active === 1 ? 'is-active' : 'is-hidden'}
        style={instantSwap ? { transition: 'none' } : undefined}
      />
    </div>
  )
}
