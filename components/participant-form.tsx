"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Participant } from '@/types/types'
import { generateUUID } from '@/utils/generateUUID'

interface ParticipantFormProps {
  opportunityId: string;
  participant?: Participant;
  onSubmit: (participant: Participant) => void;
  onCancel: () => void;
}

export function ParticipantForm({ opportunityId, participant, onSubmit, onCancel }: ParticipantFormProps) {
  const [formData, setFormData] = useState<Omit<Participant, 'id'>>({
    name: '',
    opportunityId
  })

  useEffect(() => {
    if (participant) {
      setFormData(participant)
    }
  }, [participant])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: participant ? participant.id : generateUUID(),
      ...formData
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {participant ? '参加者を更新' : '参加者を追加'}
        </Button>
      </div>
    </form>
  )
}

