"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Participant } from '@/types/types'
import { X, Plus } from 'lucide-react'

interface ParticipantManagerProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
}

export function ParticipantManager({ participants, onParticipantsChange }: ParticipantManagerProps) {
  const [newParticipant, setNewParticipant] = useState({ name: '', discordId: '' })

  const addParticipant = () => {
    if (newParticipant.name && newParticipant.discordId) {
      const updatedParticipants = [...participants, { ...newParticipant, id: Date.now().toString() }]
      onParticipantsChange(updatedParticipants)
      setNewParticipant({ name: '', discordId: '' })
    }
  }

  const removeParticipant = (id: string) => {
    const updatedParticipants = participants.filter(p => p.id !== id)
    onParticipantsChange(updatedParticipants)
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor="participantName">名前</Label>
          <Input
            id="participantName"
            value={newParticipant.name}
            onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
            placeholder="参加者名"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="participantDiscordId">Discord ID</Label>
          <Input
            id="participantDiscordId"
            value={newParticipant.discordId}
            onChange={(e) => setNewParticipant({ ...newParticipant, discordId: e.target.value })}
            placeholder="example#1234"
          />
        </div>
        <Button onClick={addParticipant} className="mt-6">
          <Plus className="w-4 h-4 mr-2" />
          追加
        </Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <span>{participant.name} (Discord: {participant.discordId})</span>
            <Button variant="ghost" size="sm" onClick={() => removeParticipant(participant.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

