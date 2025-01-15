"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Opportunity, Participant, Event } from '@/types/types'
import { Button } from '@/components/ui/button'
import { fetchData, saveData, deleteData } from '@/utils/dataOperations'
import { CalendarIcon, MapPinIcon, UsersIcon, ArrowLeftIcon, PencilIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { OpportunityForm } from '@/components/opportunity-form'
import { toast } from '@/components/ui/use-toast'

export default function OpportunityDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<Opportunity & { event: Event, participants: Participant[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setIsLoading(true)
        const allOpportunities: Opportunity[] = await fetchData('opportunities')
        const allEvents: Event[] = await fetchData('events')
        const allParticipants: Participant[] = await fetchData('participants')

        const foundOpportunity = allOpportunities.find(opp => opp.id === id)

        if (foundOpportunity) {
          const event = allEvents.find(event => event.id === foundOpportunity.eventId)
          const participants = allParticipants.filter(p => p.opportunityId === foundOpportunity.id)

          setOpportunity({
            ...foundOpportunity,
            event: event!,
            participants: participants
          })
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

  const handleOpportunitySubmit = async (updatedOpportunity: Opportunity, updatedParticipants: Participant[]) => {
    try {
      await saveData('opportunities', [updatedOpportunity])

      // 既存の参加者を削除
      const existingParticipants = opportunity?.participants || []
      for (const participant of existingParticipants) {
        await deleteData('participants', participant.id)
      }

      // 新しい参加者を保存
      for (const participant of updatedParticipants) {
        participant.opportunityId = updatedOpportunity.id
        await saveData('participants', [participant])
      }

      setOpportunity({
        ...updatedOpportunity,
        event: opportunity!.event,
        participants: updatedParticipants
      })

      setIsDialogOpen(false)
      toast({
        title: "成功",
        description: "オポチュニティが正常に更新されました。",
      })
    } catch (err) {
      console.error('オポチュニティの更新に失敗しました:', err)
      toast({
        title: "エラー",
        description: "オポチュニティの更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!opportunity) {
    return <div className="text-center text-gray-600">オポチュニティが見つかりません。</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{opportunity.name}</h1>
        <div className="flex items-center space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PencilIcon className="w-4 h-4 mr-2" />
                編集
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>オポチュニティを編集</DialogTitle>
              </DialogHeader>
              <OpportunityForm
                eventId={opportunity.eventId}
                opportunity={opportunity}
                existingParticipants={opportunity.participants}
                onSubmit={handleOpportunitySubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Link href={`/event/${opportunity.eventId}`}>
            <Button variant="outline" className="text-gray-600 hover:text-gray-800">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              イベントに戻る
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          <Link href={`/event/${opportunity.event.id}`} className="hover:text-blue-600">
            {opportunity.event.name}
          </Link>
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
          <span className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {opportunity.date}
          </span>
          <span className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {opportunity.event.location}
          </span>
        </div>
        <p className="text-gray-700 mt-4">{opportunity.content}</p>
        {opportunity.relatedUrl && (
          <p className="mt-2">
            <a href={opportunity.relatedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              関連リンク
            </a>
          </p>
        )}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            参加者
          </h3>
          <ul className="mt-2 space-y-1">
            {opportunity.participants.map((participant) => (
              <li key={participant.id}>
                <Link href={`/participants/${encodeURIComponent(participant.name)}`} className="text-blue-600 hover:underline">
                  {participant.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

