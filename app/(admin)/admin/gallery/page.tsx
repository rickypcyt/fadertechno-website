import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/permissions'

export default async function AdminGalleryPage() {
  await requireRole('ADMIN')

  const galleries = await prisma.galleryImage.findMany({
    include: { event: true, mediaAsset: true },
    orderBy: { event: { startDate: 'desc' } },
  })

  return (
    <div className="admin-page">
      <h1>Galería</h1>
      <div className="admin-list">
        {galleries.length === 0 ? (
          <p className="text-dim">No hay imágenes en la galería.</p>
        ) : (
          galleries.map((img: typeof galleries[0]) => (
            <div key={img.id} className="admin-list-item">
              <div>
                <div><strong>{img.event.title}</strong></div>
                <div className="text-dim" style={{ fontSize: '0.85rem' }}>
                  {img.mediaAsset.url}
                </div>
                <div className="text-dim" style={{ fontSize: '0.8rem' }}>
                  {img.featured ? 'Destacada' : 'Normal'}
                </div>
              </div>
              <span className="admin-badge">{img.featured ? '★' : '—'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
