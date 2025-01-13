"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Participant, Opportunity, Event } from '@/types/types'
import { Button } from '@/components/ui/button'
import { fetchData } from '@/utils/dataOperations'

export default function ParticipantDetail() {
  const { name } = useParams()
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [opportunities, setOpportunities] = useState<(Opportunity & { event: Event })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        setIsLoading(true)
        const allParticipants: Participant[] = await fetchData('participants')
        const allOpportunities: Opportunity[] = await fetchData('opportunities')
        const allEvents: Event[] = await fetchData('events')

        console.log('All Participants:', allParticipants)
        console.log('Decoded name:', decodeURIComponent(name as string))

        const foundParticipants = allParticipants.filter(p => 
          p.name === decodeURIComponent(name as string)
        )
        console.log('Found Participants:', foundParticipants)

        if (foundParticipants.length > 0) {
          setParticipants(foundParticipants)

          const participantOpportunities = allOpportunities
            .filter(opp => foundParticipants.some(p => p.opportunityId === opp.id))
            .map(opp => ({
              ...opp,
              event: allEvents.find(event => event.id === opp.eventId)!
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          console.log('Participant Opportunities:', participantOpportunities)
          setOpportunities(participantOpportunities)
        } else {
          setError('参加者が見つかりません。')
        }
        setIsLoading(false)
      } catch (err) {
        console.error('参加者データの取得に失敗しました:', err)
        setError('参加者データの取得に失敗しました。もう一度お試しください。')
        setIsLoading(false)
      }
    }

    fetchParticipantData()
  }, [name])

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (participants.length === 0) {
    return <div className="text-center text-gray-600">参加者が見つかりません。</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{decodeURIComponent(name as string)}</h1>
        <Link href="/participants">
          <Button variant="outline" className="text-gray-600 hover:text-gray-800">← 参加者一覧に戻る</Button>
        </Link>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">参加オポチュニティ ({opportunities.length}件)</h2>
        {opportunities.length === 0 ? (
          <p className="text-gray-600">参加したオポチュニティはありません。</p>
        ) : (
          opportunities.map((opp) => (
            <div key={opp.id} className="mb-4 pb-4 border-b last:border-b-0">
              <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 cursor-pointer" onClick={() => router.push(`/event/${opp.event.id}`)}>
                {opp.event.name}
              </h3>
              <p className="text-gray-600">{opp.date}</p>
              <p className="text-gray-700">{opp.name}</p>
              <p className="text-gray-600">{opp.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

