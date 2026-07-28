'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { getTicketsUrlForRole } from '@/lib/role-routes'

interface RegisterModalProps {
  className?: string
}

export default function RegisterModal({ className = 'btn btn-ghost' }: RegisterModalProps) {
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [ticketsUrl, setTicketsUrl] = useState('/user/tickets')

  useEffect(() => {
    authClient.getSession().then((res) => {
      setLoggedIn(!!res.data)
      if (res.data) {
        fetch('/api/me', { credentials: 'include' })
          .then((r) => (r.ok ? r.json() : null))
          .then((me) => {
            if (me?.role) setTicketsUrl(getTicketsUrlForRole(me.role))
          })
      }
    })
  }, [])

  if (loggedIn) {
    return (
      <Link href={ticketsUrl} className={className}>
        Ver entradas
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        Registrarse
      </button>

      {open && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.currentTarget === e.target) setOpen(false)
          }}
        >
          <div className="modal">
            <button
              type="button"
              className="modal-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2>Crea tu cuenta en FADER</h2>
            <p>
              Registrarte te da acceso a herramientas pensadas para quienes
              siguen el colectivo de cerca.
            </p>
            <ul className="modal-list">
              <li>Gestiona tus entradas y accesos.</li>
              <li>Consulta tus puntos canjeables.</li>
              <li>Accede a preventas y contenido exclusivo.</li>
              <li>Recibe novedades antes que nadie.</li>
              <li>Forma parte de la comunidad privada.</li>
            </ul>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
              >
                ← Volver
              </button>
              <Link
                href="/login"
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="nav-cta"
                onClick={() => setOpen(false)}
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
