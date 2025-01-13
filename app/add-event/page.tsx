"use client"

import { useState } from 'react'
import { EventForm } from '@/components/event-form'
import { Event } from '@/types/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AddEvent() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(() => {
    if (typeof window !== 'undefined') {
      const storedEvents = localStorage.getItem('events')
      return storedEvents ? JSON.parse(storedEvents) : []
    }
    return []
  })

  const handleSubmit = (newEvent: Event) => {
    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    router.push('/')
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/">
        <Button variant="outline" className="mb-4">← 戻る</Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">新しいイベントを追加</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  )
}

