"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Opportunity } from '@/types/types'

interface OpportunityFormProps {
  eventId: string;
  opportunity?: Opportunity;
  onSubmit: (opportunity: Opportunity) => void;
  onCancel: () => void;
}

export function OpportunityForm({ eventId, opportunity, onSubmit, onCancel }: OpportunityFormProps) {
  const [formData, setFormData] = useState<Omit<Opportunity, 'id'>>({
    eventId,
    name: '',
    date: '',
    content: '',
    relatedUrl: ''
  })

  useEffect(() => {
    if (opportunity) {
      setFormData(opportunity)
    }
  }, [opportunity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: opportunity ? opportunity.id : Date.now().toString(),
      ...formData
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
        <Label htmlFor="relatedUrl">関連URL</Label>
        <Input
          id="relatedUrl"
          name="relatedUrl"
          type="url"
          value={formData.relatedUrl}
          onChange={handleChange}
        />
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

