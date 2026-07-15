import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminArtistsPage() {
  await requireRole('ADMIN')

  const artists = await prisma.artist.findMany({
    include: { events: { include: { event: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="admin-page">
      <h1>Artistas</h1>
      <div className="admin-list">
        {artists.length === 0 ? (
          <p className="text-dim">No hay artistas creados.</p>
        ) : (
          artists.map((artist: typeof artists[0]) => (
            <div key={artist.id} className="admin-list-item">
              <div>
                <div><strong>{artist.name}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {artist.events.length} eventos · {artist.resident ? 'Residente' : 'Invitado'}
                </div>
                {artist.instagram && (
                  <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                    IG: {artist.instagram}
                  </div>
                )}
              </div>
              <span className="admin-badge">{artist.resident ? 'Residente' : 'Invitado'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
