import SharedSuccessPoller from '@/app/components/SuccessPoller'

type Ticket = {
  id: string
  code: string
  ticketType: { name: string }
}

type Props = {
  orderId: string
  initialIsPaid: boolean
  initialTickets: Ticket[]
  eventTitle: string
  eventDate: string
  ticketCount: number
  totalCents: number
  pointsEarned: number
}

export default function SuccessPoller(props: Props) {
  return <SharedSuccessPoller {...props} />
}
