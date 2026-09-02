'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Reward = {
  id: string
  name: string
  description: string | null
  pointsCost: number
  stock: number | null
}

type Props = {
  dict: Dictionary
  rewards: Reward[]
  balance: number
  qrValiditySeconds: number
}

type RedeemState =
  | { status: 'idle' }
  | { status: 'loading'; rewardId: string }
  | {
      status: 'done'
      rewardName: string
      redeemUrl: string
      pointsSpent: number
      expiresAt: number // epoch ms
    }
  | { status: 'error'; message: string }

export default function RewardsClient({ dict, rewards, balance, qrValiditySeconds }: Props) {
  const t = dict.panel.userRewards
  const [state, setState] = useState<RedeemState>({ status: 'idle' })
  const [now, setNow] = useState(Date.now())

  const handleRedeem = async (rewardId: string, rewardName: string) => {
    setState({ status: 'loading', rewardId })
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setState({ status: 'error', message: data.error ?? t.redeemError })
        return
      }
      setNow(Date.now())
      setState({
        status: 'done',
        rewardName,
        redeemUrl: data.redeemUrl,
        pointsSpent: data.pointsSpent,
        expiresAt: new Date(data.expiresAt).getTime(),
      })
    } catch {
      setState({ status: 'error', message: dict.panel.common.connectionError })
    }
  }

  const closeQr = () => setState({ status: 'idle' })

  const remainingSeconds =
    state.status === 'done' ? Math.max(0, Math.ceil((state.expiresAt - now) / 1000)) : 0

  // Tick every second while the QR modal is open so the countdown updates.
  useEffect(() => {
    if (state.status !== 'done') return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [state.status])

  return (
    <>
      {/* QR modal */}
      {state.status === 'done' && (
        <div className="event-form-overlay" onClick={closeQr}>
          <div className="event-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', textAlign: 'center' }}>
            <div className="event-form-header">
              <h2>{t.qrTitle}</h2>
              <button type="button" className="event-form-close" onClick={closeQr}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div className="text-dim" style={{ marginBottom: '16px' }}>
                {state.rewardName} · −{state.pointsSpent} {t.points}
              </div>
              {remainingSeconds > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: '#fff', borderRadius: '12px' }}>
                    <QRCodeSVG value={state.redeemUrl} size={220} level="M" />
                  </div>
                  <div className="text-dim" style={{ marginTop: '16px' }}>
                    {t.qrSubtitle.replace('{seconds}', String(remainingSeconds))}
                  </div>
                </>
              ) : (
                <p className="auth-error">{t.qrExpired}</p>
              )}
              <button
                type="button"
                className="event-form-submit"
                style={{ marginTop: '20px', width: '100%' }}
                onClick={closeQr}
              >
                {t.closeQr}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards list */}
      <div className="admin-list">
        {rewards.map((reward) => {
          const canAfford = balance >= reward.pointsCost
          const outOfStock = reward.stock !== null && reward.stock <= 0
          const missing = reward.pointsCost - balance

          return (
            <div key={reward.id} className="admin-list-item">
              <div>
                <div>
                  <strong>{reward.name}</strong>
                </div>
                {reward.description && (
                  <div className="text-dim" style={{ fontSize: '1rem' }}>{reward.description}</div>
                )}
                <div className="text-dim" style={{ fontSize: '1rem' }}>
                  {t.costLabel.replace('{cost}', String(reward.pointsCost))}
                  {reward.stock !== null ? ` · ${dict.panel.common.stock}: ${reward.stock}` : ''}
                </div>
                {!canAfford && !outOfStock && (
                  <div className="text-dim" style={{ fontSize: '1rem', marginTop: '4px' }}>
                    {t.missing.replace('{amount}', String(missing))}
                  </div>
                )}
              </div>
              <div className="admin-actions">
                {outOfStock ? (
                  <span className="admin-badge muted">{t.soldOut}</span>
                ) : canAfford ? (
                  <button
                    type="button"
                    className="nav-cta"
                    disabled={state.status === 'loading'}
                    onClick={() => handleRedeem(reward.id, reward.name)}
                  >
                    {state.status === 'loading' && state.rewardId === reward.id
                      ? t.redeeming
                      : t.redeem}
                  </button>
                ) : (
                  <span className="admin-badge muted">{t.missing.replace('{amount}', String(missing))}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {state.status === 'error' && (
        <p className="auth-error" style={{ marginTop: '16px' }}>{state.message}</p>
      )}
    </>
  )
}
