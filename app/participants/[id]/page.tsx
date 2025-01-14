"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Participant, Opportunity, Event } from '@/types/types'
import { Button } from '@/components/ui/button'
import { fetchData } from '@/utils/dataOperations'
import { CalendarIcon, MapPinIcon, LinkIcon } from 'lucide-react'

export default function ParticipantDetail() {
  const { id } = useParams()
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
        console.log('Decoded id:', id)

        const foundParticipant = allParticipants.find(p => p.id === id);
        if (foundParticipant) {
          const participantsWithSameName = allParticipants.filter(p => p.name === foundParticipant.name);
          setParticipants(participantsWithSameName);

          const participantOpportunities = allOpportunities
            .filter(opp => participantsWithSameName.some(p => p.opportunityId === opp.id))
            .map(opp => ({
              ...opp,
              event: allEvents.find(event => event.id === opp.eventId)!
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          console.log('Participant Opportunities:', participantOpportunities);
          setOpportunities(participantOpportunities);
        } else {
          setError('参加者が見つかりません。');
        }
        setIsLoading(false)
      } catch (err) {
        console.error('参加者データの取得に失敗しました:', err)
        setError('参加者データの取得に失敗しました。もう一度お試しください。')
        setIsLoading(false)
      }
    }

    fetchParticipantData()
  }, [id])

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (participants.length === 0) {
    return <div className="text-center text-gray-600">参加者が見つかりません。</div>
  }

  const participant = participants[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{participant.name}</h1>
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
              <Link href={`/opportunity/${opp.id}`} className="text-xl font-semibold text-gray-800 hover:text-blue-600">
                {opp.name}
              </Link>
              <div className="flex items-center space-x-2 text-gray-600 mt-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{opp.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 mt-1">
                <MapPinIcon className="w-4 h-4" />
                <Link href={`/event/${opp.event.id}`} className="hover:text-blue-600">
                  {opp.event.name}
                </Link>
                <span>({opp.event.location})</span>
              </div>
              <p className="text-gray-700 mt-2">{opp.content}</p>
              {opp.relatedUrl && (
                <div className="mt-2">
                  <a href={opp.relatedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    関連リンク
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

