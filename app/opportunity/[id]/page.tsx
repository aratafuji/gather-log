"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Opportunity, Participant, Event } from '@/types/types'
import { Button } from '@/components/ui/button'
import { fetchData } from '@/utils/dataOperations'
import { CalendarIcon, MapPinIcon, UsersIcon, LinkIcon } from 'lucide-react'

export default function OpportunityDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setIsLoading(true)
        const allOpportunities: Opportunity[] = await fetchData('opportunities')
        const allEvents: Event[] = await fetchData('events')
        const allParticipants: Participant[] = await fetchData('participants')

        const foundOpportunity = allOpportunities.find(opp => opp.id === id)
        if (foundOpportunity) {
          setOpportunity(foundOpportunity)
          const relatedEvent = allEvents.find(event => event.id === foundOpportunity.eventId)
          setEvent(relatedEvent || null)
          const opportunityParticipants = allParticipants.filter(p => p.opportunityId === foundOpportunity.id)
          setParticipants(opportunityParticipants)
        } else {
          setError('オポチュニティが見つかりません。')
        }
        setIsLoading(false)
      } catch (err) {
        console.error('オポチュニティデータの取得に失敗しました:', err)
        setError('オポチュニティデータの取得に失敗しました。もう一度お試しください。')
        setIsLoading(false)
      }
    }

    fetchOpportunityData()
  }, [id])

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!opportunity || !event) {
    return <div className="text-center text-gray-600">オポチュニティが見つかりません。</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{opportunity.name}</h1>
        <Link href={`/event/${event.id}`}>
          <Button variant="outline" className="text-gray-600 hover:text-gray-800">← イベントに戻る</Button>
        </Link>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <CalendarIcon className="w-5 h-5" />
          <span>{opportunity.date}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPinIcon className="w-5 h-5" />
          <span>{event.name} ({event.location})</span>
        </div>
        {opportunity.relatedUrl && (
          <div className="flex items-center space-x-2 text-gray-600">
            <LinkIcon className="w-5 h-5" />
            <a href={opportunity.relatedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              関連リンク
            </a>
          </div>
        )}
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">内容</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{opportunity.content}</p>
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">参加者</h2>
        {participants.length === 0 ? (
          <p className="text-gray-600">参加者はいません。</p>
        ) : (
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li key={participant.id} className="flex items-center space-x-2">
                <UsersIcon className="w-4 h-4 text-gray-600" />
                <Link href={`/participants/${participant.id}`} className="text-blue-500 hover:underline">
                  {participant.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

