import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'faderclub' })

export type FulfillOrderEvent = {
  name: 'order/fulfill'
  data: { orderId: string }
}

export type ReconcileOrderEvent = {
  name: 'order/reconcile'
  data: { orderId: string }
}
