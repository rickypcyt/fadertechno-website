'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

const VIDEOS = [
  '/fader.mp4',
  '/banner2.mp4',
  '/banner3.mp4',
  '/banner4.mp4',
]

const ROTATION_MS = 60_000
const CROSSFADE_MS = 1000
// Time to wait after a switch before swapping the src of the now-inactive slot,
// so we don't yank the source while it's still fading out.
const SWAP_DELAY_MS = CROSSFADE_MS + 500
const STORAGE_KEY = 'video-bg-index'

type Slot = 0 | 1

export default function VideoBg() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoA = useRef<HTMLVideoElement>(null)
  const videoB = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState<Slot>(0)
  const [index, setIndex] = useState(0)
  // Only used to disable the (already subtle) crossfade; the video itself
  // still plays — it's a slow background, not motion that triggers vestibular
  // issues.
  const [instantSwap, setInstantSwap] = useState(false)

  // Refs mirroring state so the rotation loop can read latest values without
  // re-subscribing the interval every render.
  const activeRef = useRef<Slot>(0)
  const indexRef = useRef(0)
  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => {
    indexRef.current = index
  }, [index])

  const getEl = useCallback((s: Slot) => (s === 0 ? videoA.current : videoB.current), [])

  // Ping-pong (seamless reverse) loop: instead of jumping back to frame 0
  // when the video ends, we play it backwards (negative playbackRate) and
  // then forward again — no visible cut. Tracked per-slot so each video
  // keeps its own direction state.
  const dirA = useRef<1 | -1>(1)
  const dirB = useRef<1 | -1>(1)
  const getDir = useCallback((s: Slot) => (s === 0 ? dirA : dirB), [])
  const setDir = useCallback((s: Slot, d: 1 | -1) => {
    const ref = s === 0 ? dirA : dirB
    ref.current = d
  }, [])

  // Small threshold (seconds) to detect "we're back at the start" while
  // playing in reverse. timeupdate fires ~4×/s so this is more than enough.
  const REVERSE_START_THRESHOLD = 0.05

  const tryPlay = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return
    const p = el.play()
    if (!p) return
    p.then(() => {
      // Forward start — direction is flipped back to 1 by onTimeUpdate
      // when the reverse pass reaches the beginning.
      el.playbackRate = 1
    }).catch(() => {
      // Autoplay blocked: retry on first user interaction.
      const resume = () => {
        el.play().then(() => {
          el.playbackRate = 1
        }).catch(() => {})
      }
      document.addEventListener('click', resume, { once: true })
      document.addEventListener('touchstart', resume, { once: true })
      document.addEventListener('keydown', resume, { once: true })
    })
  }, [])

  // Seamless reverse: when the forward pass ends, flip to negative
  // playbackRate and keep playing — no cut, no jump to 0.
  const handleEnded = useCallback((slot: Slot) => {
    const el = getEl(slot)
    if (!el) return
    try {
      el.playbackRate = -1
      setDir(slot, -1)
      // Some browsers pause on ended; kick it back into motion.
      const p = el.play()
      if (p) p.catch(() => {})
    } catch {}
  }, [getEl, setDir])

  // When the reverse pass reaches the start, flip back to forward.
  const handleTimeUpdate = useCallback((slot: Slot) => {
    const el = getEl(slot)
    if (!el) return
    const dir = getDir(slot).current
    if (dir === -1 && el.currentTime <= REVERSE_START_THRESHOLD) {
      try {
        el.currentTime = 0
        el.playbackRate = 1
        setDir(slot, 1)
      } catch {}
    }
  }, [getEl, getDir, setDir])

  // Reduced motion => drop the crossfade to an instant swap, but keep the
  // video (it's a slow, dim background, not vestibular-triggering motion).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInstantSwap(true)
    }
  }, [])

  // Restore last index from sessionStorage so a refresh continues the cycle.
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

  // Persist index.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(index))
    } catch {}
  }, [index])

  // Bootstrap + rotation loop. Runs once on mount.
  useEffect(() => {
    // Load current video into the active slot and start it.
    const currentEl = getEl(activeRef.current)
    if (currentEl) {
      setDir(activeRef.current, 1)
      currentEl.playbackRate = 1
      currentEl.src = VIDEOS[indexRef.current]
      currentEl.load()
      tryPlay(currentEl)
    }

    // Preload the next video into the inactive slot so it's ready to fade in.
    const preloadNext = () => {
      const nextSlot: Slot = activeRef.current === 0 ? 1 : 0
      const nextIndex = (indexRef.current + 1) % VIDEOS.length
      const el = getEl(nextSlot)
      if (el) {
        setDir(nextSlot, 1)
        el.playbackRate = 1
        el.src = VIDEOS[nextIndex]
        el.load()
      }
    }
    preloadNext()

    const interval = setInterval(() => {
      const nextSlot: Slot = activeRef.current === 0 ? 1 : 0
      const nextIndex = (indexRef.current + 1) % VIDEOS.length
      const el = getEl(nextSlot)
      if (!el) return

      // Start the incoming video from its beginning (forward), then crossfade.
      setDir(nextSlot, 1)
      try {
        el.currentTime = 0
        el.playbackRate = 1
      } catch {}
      tryPlay(el)

      setActive(nextSlot)
      setIndex(nextIndex)

      // After the crossfade finishes, swap the now-inactive slot's src to the
      // following video (paused/preloaded) — keeps only two videos in memory.
      window.setTimeout(() => {
        const inactiveSlot: Slot = nextSlot === 0 ? 1 : 0
        const followingIndex = (nextIndex + 1) % VIDEOS.length
        const inel = getEl(inactiveSlot)
        if (!inel) return
        inel.pause()
        setDir(inactiveSlot, 1)
        try {
          inel.removeAttribute('src')
          inel.load()
        } catch {}
        inel.src = VIDEOS[followingIndex]
        inel.load()
      }, SWAP_DELAY_MS)
    }, ROTATION_MS)

    return () => clearInterval(interval)
  }, [getEl, getDir, setDir, tryPlay])

  // Resume the active video when returning to the tab.
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
        onEnded={() => handleEnded(0)}
        onTimeUpdate={() => handleTimeUpdate(0)}
        className={active === 0 ? 'is-active' : 'is-hidden'}
        style={instantSwap ? { transition: 'none' } : undefined}
      />
      <video
        ref={videoB}
        muted
        playsInline
        preload="auto"
        onEnded={() => handleEnded(1)}
        onTimeUpdate={() => handleTimeUpdate(1)}
        className={active === 1 ? 'is-active' : 'is-hidden'}
        style={instantSwap ? { transition: 'none' } : undefined}
      />
    </div>
  )
}
