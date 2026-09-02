import { getCurrentUser } from '@/lib/auth'
import { redeemRewardAtBar } from '@/lib/loyalty'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !['STAFF', 'ADMIN'].includes(user.role)) {
    return Response.json(
      { ok: false, error: 'not_found', message: 'No autorizado' },
      { status: 401 },
    )
  }

  const { token } = (await request.json()) as { token?: string }
  if (!token) {
    return Response.json(
      { ok: false, error: 'not_found', message: 'Token requerido' },
      { status: 400 },
    )
  }

  const result = await redeemRewardAtBar(token.trim())

  if (!result.ok) {
    return Response.json(result, { status: 400 })
  }

  return Response.json(result)
}
