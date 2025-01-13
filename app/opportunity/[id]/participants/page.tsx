"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Opportunity, Participant } from '@/types/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ParticipantForm } from '@/components/participant-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PencilIcon } from 'lucide-react'

export default function ParticipantList() {
  const { id } = useParams()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    const storedOpportunities = localStorage.getItem('opportunities')
    const storedParticipants = localStorage.getItem('participants')
    if (storedOpportunities) {
      const opportunities: Opportunity[] = JSON.parse(storedOpportunities)
      const foundOpportunity = opportunities.find(opp => opp.id === id)
      if (foundOpportunity) {
        setOpportunity(foundOpportunity)
      }
    }
    if (storedParticipants) {
      const allParticipants: Participant[] = JSON.parse(storedParticipants)
      const opportunityParticipants = allParticipants.filter(p => p.opportunityId === id)
      setParticipants(opportunityParticipants)
    }
  }, [id])

  const handleParticipantSubmit = (newParticipant: Participant) => {
    let updatedParticipants: Participant[]
    if (editingParticipant) {
      updatedParticipants = participants.map(p => 
        p.id === newParticipant.id ? newParticipant : p
      )
    } else {
      updatedParticipants = [...participants, newParticipant]
    }
    setParticipants(updatedParticipants)
    const allParticipants = JSON.parse(localStorage.getItem('participants') || '[]')
    const updatedAllParticipants = editingParticipant
      ? allParticipants.map(p => p.id === newParticipant.id ? newParticipant : p)
      : [...allParticipants, newParticipant]
    localStorage.setItem('participants', JSON.stringify(updatedAllParticipants))
    setIsDialogOpen(false)
    setEditingParticipant(null)
  }

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingParticipant(null)
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
                <p className="text-sm text-gray-600">Discord: {participant.discordId || 'Not provided'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleEditParticipant(participant)}>
                <PencilIcon className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

