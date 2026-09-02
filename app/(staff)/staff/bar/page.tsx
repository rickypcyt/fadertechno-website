import { requireRole } from '@/lib/permissions'
import { getDictionary, defaultLocale } from '@/lib/i18n/dictionaries'
import BarRedeemClient from './BarRedeemClient'

export const dynamic = 'force-dynamic'

export default async function StaffBarPage() {
  await requireRole('STAFF')
  const dict = await getDictionary(defaultLocale)
  return <BarRedeemClient dict={dict} />
}
