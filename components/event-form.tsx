"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Event } from '@/types/types'
import { sanitizeInput, validateInput } from '@/utils/security'
import { generateUUID } from '@/utils/generateUUID'

interface EventFormProps {
  event?: Event;
  onSubmit: (event: Event) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    url: ''
  })

  useEffect(() => {
    if (event) {
      setFormData(event)
    }
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.values(formData).every(value => validateInput(value))) {
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, sanitizeInput(value)])
      );
      onSubmit({
        id: event ? event.id : generateUUID(),
        ...sanitizedData
      })
    } else {
      console.error('Invalid input');
    }
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
        <Label htmlFor="name">イベント名</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="startDate">開始日</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="endDate">終了日</Label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">開催場所</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="url">イベントURL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {event ? 'イベントを更新' : 'イベントを作成'}
        </Button>
      </div>
    </form>
  )
}

