'use client'

import { useRef, useEffect, useState } from 'react'

const VIDEOS = [
  '/fader.mp4',
  '/banner2.mp4',
  '/banner3.mp4',
  '/banner4.mp4',
]

const ROTATION_MS = 60_000
const STORAGE_KEY = 'video-bg-index'

export default function VideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const i = parseInt(saved, 10)
        if (!isNaN(i) && i >= 0 && i < VIDEOS.length) {
          setIndex(i)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(index))
    } catch {}
  }, [index])

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % VIDEOS.length)
    }, ROTATION_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const forcePlay = () => {
      if (video.paused || video.ended) {
        video.currentTime = video.ended ? 0 : video.currentTime
        video.play().then(() => {
          video.playbackRate = 1
        }).catch(() => {
          // If autoplay blocked, try on next user interaction
          const resume = () => {
            video.play().catch(() => {})
            document.removeEventListener('click', resume)
            document.removeEventListener('touchstart', resume)
            document.removeEventListener('keydown', resume)
          }
          document.addEventListener('click', resume, { once: true })
          document.addEventListener('touchstart', resume, { once: true })
          document.addEventListener('keydown', resume, { once: true })
        })
      }
    }

    const onLoaded = () => forcePlay()
    const onPause = () => forcePlay()
    const onEnded = () => {
      video.currentTime = 0
      forcePlay()
    }
    const onVisibilityChange = () => {
      if (!document.hidden) {
        forcePlay()
      }
    }
    const onPlay = () => {
      video.playbackRate = 1
    }

    // Periodic check every 2s to ensure video is playing
    const checkInterval = setInterval(() => {
      if (!document.hidden) {
        forcePlay()
      }
    }, 2000)

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('play', onPlay)
    document.addEventListener('visibilitychange', onVisibilityChange)

    forcePlay()

    return () => {
      clearInterval(checkInterval)
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('play', onPlay)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [index])

  return (
    <div className="video-bg">
      <video
        key={index}
        ref={videoRef}
        src={VIDEOS[index]}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  )
}
