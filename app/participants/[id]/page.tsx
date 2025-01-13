"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Participant, Opportunity, Event } from '@/types/types'
import { Button } from '@/components/ui/button'

export default function ParticipantDetail() {
  const { id } = useParams()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [opportunities, setOpportunities] = useState<(Opportunity & { event: Event })[]>([])

  useEffect(() => {
    const storedParticipants = localStorage.getItem('participants')
    const storedOpportunities = localStorage.getItem('opportunities')
    const storedEvents = localStorage.getItem('events')

    if (storedParticipants && storedOpportunities && storedEvents) {
      const allParticipants: Participant[] = JSON.parse(storedParticipants)
      const allOpportunities: Opportunity[] = JSON.parse(storedOpportunities)
      const allEvents: Event[] = JSON.parse(storedEvents)

      const foundParticipant = allParticipants.find(p => p.id === id)
      if (foundParticipant) {
        setParticipant(foundParticipant)

        const participantOpportunities = allOpportunities
          .filter(opp => opp.id === foundParticipant.opportunityId)
          .map(opp => ({
            ...opp,
            event: allEvents.find(event => event.id === opp.eventId)!
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setOpportunities(participantOpportunities)
      }
    }
  }, [id])

  if (!participant) {
    return <div className="text-center text-gray-600">参加者が見つかりません。</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{participant.name}</h1>
        <Link href="/participants">
          <Button variant="outline" className="text-gray-600 hover:text-gray-800">← 参加者一覧に戻る</Button>
        </Link>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">参加オポチュニティ</h2>
        {opportunities.map((opp) => (
          <div key={opp.id} className="mb-4 pb-4 border-b last:border-b-0">
            <h3 className="text-xl font-semibold text-gray-800">{opp.event.name}</h3>
            <p className="text-gray-600">{opp.date}</p>
            <p className="text-gray-700">{opp.name}</p>
            <p className="text-gray-600">{opp.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

