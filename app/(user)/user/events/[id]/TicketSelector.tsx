import SharedTicketSelector from '@/app/components/TicketSelector'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type TicketType = {
  id: string
  name: string
  price: string
  stock: number
}

type Props = {
  ticketTypes: TicketType[]
  eventId: string
  dict: Dictionary
}

export default function TicketSelector({ ticketTypes, eventId, dict }: Props) {
  return <SharedTicketSelector ticketTypes={ticketTypes} eventId={eventId} dict={dict} />
}
