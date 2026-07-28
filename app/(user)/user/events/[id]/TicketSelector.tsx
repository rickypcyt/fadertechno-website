import SharedTicketSelector from '@/app/components/TicketSelector'

type TicketType = {
  id: string
  name: string
  price: string
  stock: number
}

type Props = {
  ticketTypes: TicketType[]
  eventId: string
}

export default function TicketSelector({ ticketTypes, eventId }: Props) {
  return <SharedTicketSelector ticketTypes={ticketTypes} eventId={eventId} />
}
