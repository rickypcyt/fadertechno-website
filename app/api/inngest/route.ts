import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { fulfillOrderFunction } from '@/lib/payments/fulfillment'

export const maxDuration = 300

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [fulfillOrderFunction],
})
