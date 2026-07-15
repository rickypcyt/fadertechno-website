import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminSettingsPage() {
  await requireRole('ADMIN')

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'main' },
  })

  return (
    <div className="admin-page">
      <h1>Configuración</h1>
      <div className="admin-card">
        {settings ? (
          <>
            <div className="admin-card-label">Hero title</div>
            <div className="admin-card-value">{settings.heroTitle}</div>
            <div className="admin-card-meta">{settings.heroDescription}</div>
            {settings.instagram && <p>Instagram: {settings.instagram}</p>}
            {settings.soundcloud && <p>SoundCloud: {settings.soundcloud}</p>}
            {settings.spotify && <p>Spotify: {settings.spotify}</p>}
          </>
        ) : (
          <p className="text-dim">No hay configuración guardada.</p>
        )}
      </div>
    </div>
  )
}
