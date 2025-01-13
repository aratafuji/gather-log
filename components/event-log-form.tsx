"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EventLog } from '@/types/types'

interface EventLogFormProps {
  onSubmit: (log: EventLog) => void
}

export function EventLogForm({ onSubmit }: EventLogFormProps) {
  const [formData, setFormData] = useState<Omit<EventLog, 'id'>>({
    eventName: '',
    date: '',
    location: '',
    personMet: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: Date.now().toString(),
      ...formData
    })
    setFormData({
      eventName: '',
      date: '',
      location: '',
      personMet: '',
      notes: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="eventName">イベント名</Label>
        <Input
          id="eventName"
          name="eventName"
          value={formData.eventName}
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
        <Label htmlFor="location">場所</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="personMet">会った人</Label>
        <Input
          id="personMet"
          name="personMet"
          value={formData.personMet}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="notes">メモ</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>
      <Button type="submit">ログを保存</Button>
    </form>
  )
}

