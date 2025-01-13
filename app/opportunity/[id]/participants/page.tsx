"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Opportunity, Participant } from '@/types/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ParticipantForm } from '@/components/participant-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PencilIcon, TrashIcon } from 'lucide-react'
import { fetchData, saveData, deleteData } from '@/utils/dataOperations'
import { toast } from '@/components/ui/use-toast'

export default function ParticipantList() {
  const { id } = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        setIsLoading(true)
        const opportunities = await fetchData('opportunities')
        const foundOpportunity = opportunities.find((opp: Opportunity) => opp.id === id)
        if (foundOpportunity) {
          setOpportunity(foundOpportunity)
        }
        setIsLoading(false)
      } catch (err) {
        console.error('オポチュニティデータの取得に失敗しました:', err)
        setError('オポチュニティデータの取得に失敗しました。もう一度お試しください。')
        setIsLoading(false)
      }
    }

    const fetchParticipantsData = async () => {
      try {
        const allParticipants = await fetchData('participants')
        const opportunityParticipants = allParticipants.filter((p: Participant) => p.opportunityId === id)
        setParticipants(opportunityParticipants)
      } catch (err) {
        console.error('参加者データの取得に失敗しました:', err)
        setError('参加者データの取得に失敗しました。もう一度お試しください。')
      }
    }

    fetchOpportunityData()
    fetchParticipantsData()
  }, [id])

  const handleParticipantSubmit = async (newParticipant: Participant) => {
    try {
      await saveData('participants', [newParticipant])
      let updatedParticipants: Participant[]
      if (editingParticipant) {
        updatedParticipants = participants.map(p => 
          p.id === newParticipant.id ? newParticipant : p
        )
      } else {
        updatedParticipants = [...participants, newParticipant]
      }
      setParticipants(updatedParticipants)
      setIsDialogOpen(false)
      setEditingParticipant(null)
      toast({
        title: "成功",
        description: "参加者が正常に保存されました。",
      })
    } catch (err) {
      console.error('参加者の保存に失敗しました:', err)
      setError('参加者の保存に失敗しました。もう一度お試しください。')
      toast({
        title: "エラー",
        description: "参加者の保存に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setIsDialogOpen(true)
  }

  const handleDeleteParticipant = async (participantId: string) => {
    try {
      await deleteData('participants', participantId)
      setParticipants(participants.filter(p => p.id !== participantId))
      toast({
        title: "成功",
        description: "参加者が正常に削除されました。",
      })
    } catch (err) {
      console.error('参加者の削除に失敗しました:', err)
      setError('参加者の削除に失敗しました。もう一度お試しください。')
      toast({
        title: "エラー",
        description: "参加者の削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingParticipant(null)
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
        <h1 className="text-3xl font-bold text-gray-800">{opportunity.name} - 参加者一覧</h1>
        <Link href={`/event/${opportunity.eventId}`}>
          <Button variant="outline" className="text-gray-600 hover:text-gray-800">← イベントに戻る</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">参加者</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingParticipant(null)}>
              参加者を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingParticipant ? '参加者を編集' : '新しい参加者を追加'}
              </DialogTitle>
            </DialogHeader>
            <ParticipantForm 
              opportunityId={opportunity.id}
              participant={editingParticipant || undefined}
              onSubmit={handleParticipantSubmit}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {participants.map((participant) => (
          <div key={participant.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{participant.name}</h4>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditParticipant(participant)}>
                  <PencilIcon className="w-4 h-4 text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteParticipant(participant.id)}>
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

