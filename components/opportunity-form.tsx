"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Opportunity, Participant } from '@/types/types'
import { sanitizeInput, validateInput } from '@/utils/security'
import { generateUUID } from '@/utils/generateUUID'
import { X, Plus } from 'lucide-react'

interface OpportunityFormProps {
  eventId: string;
  opportunity?: Opportunity;
  existingParticipants?: Participant[];
  onSubmit: (opportunity: Opportunity, participants: Participant[]) => void;
  onCancel: () => void;
}

export function OpportunityForm({ eventId, opportunity, existingParticipants = [], onSubmit, onCancel }: OpportunityFormProps) {
  const [formData, setFormData] = useState<Omit<Opportunity, 'id'>>({
    eventId,
    name: '',
    date: '',
    content: '',
    relatedUrl: ''
  })
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipant, setNewParticipant] = useState('')

  useEffect(() => {
    if (opportunity) {
      setFormData({
        eventId: opportunity.eventId,
        name: opportunity.name,
        date: opportunity.date,
        content: opportunity.content,
        relatedUrl: opportunity.relatedUrl || ''
      })
    }
    if (existingParticipants.length > 0) {
      setParticipants(existingParticipants)
    }
  }, [opportunity, existingParticipants])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateFormData(formData)) {
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        content: sanitizeInput(formData.content),
        relatedUrl: formData.relatedUrl ? sanitizeInput(formData.relatedUrl) : ''
      }
      onSubmit({
        id: opportunity ? opportunity.id : generateUUID(),
        ...sanitizedData
      }, participants)
    } else {
      console.error('Invalid input');
    }
  }

  const validateFormData = (data: Omit<Opportunity, 'id'>): boolean => {
    return (
      validateInput(data.name) &&
      validateInput(data.date) &&
      validateInput(data.content) &&
      (data.relatedUrl === '' || validateInput(data.relatedUrl))
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addParticipant = () => {
    if (newParticipant.trim() !== '') {
      setParticipants([...participants, { id: generateUUID(), name: newParticipant.trim(), opportunityId: opportunity?.id || '' }])
      setNewParticipant('')
    }
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">オポチュニティ名</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="date">日付</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">内容</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          maxLength={500}
        />
      </div>
      <div>
        <Label htmlFor="relatedUrl">関連URL（任意）</Label>
        <Input
          id="relatedUrl"
          name="relatedUrl"
          type="url"
          value={formData.relatedUrl}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="participants">参加者</Label>
        <div className="flex space-x-2">
          <Input
            id="participants"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            placeholder="参加者名"
          />
          <Button type="button" onClick={addParticipant}>
            <Plus className="w-4 h-4 mr-2" />
            追加
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span>{participant.name}</span>
              <Button variant="ghost" size="sm" onClick={() => removeParticipant(participant.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {opportunity ? 'オポチュニティを更新' : 'オポチュニティを作成'}
        </Button>
      </div>
    </form>
  )
}

