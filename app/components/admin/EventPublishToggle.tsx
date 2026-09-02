'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Props = {
  eventId: string
  published: boolean
  dict: Dictionary
}

export default function EventPublishToggle({ eventId, published, dict }: Props) {
  const [isPublished, setIsPublished] = useState(published)
  const [loading, setLoading] = useState(false)
  const t = dict.panel.events

  const toggle = async () => {
    setLoading(true)
    const next = !isPublished
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, published: next }),
      })
      if (res.ok) {
        setIsPublished(next)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`event-toggle ${isPublished ? 'is-on' : 'is-off'} ${loading ? 'is-loading' : ''}`}
      onClick={toggle}
      disabled={loading}
      aria-label={isPublished ? t.toggleOnAria : t.toggleOffAria}
    >
      <span className="event-toggle-track">
        <span className="event-toggle-thumb" />
      </span>
      <span className="event-toggle-label">
        {loading ? dict.panel.common.loading : isPublished ? t.toggleOn : t.toggleOff}
      </span>
    </button>
  )
}
