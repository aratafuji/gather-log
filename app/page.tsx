"use client"

import { useState, useEffect } from 'react'
import { EventList } from '@/components/event-list'
import { Event } from '@/types/types'
import { compareDates } from '@/utils/dateUtils'
import { PlusIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EventForm } from '@/components/event-form'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    const storedEvents = localStorage.getItem('events')
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents).sort((a, b) => compareDates(a.startDate, b.startDate)))
    }
  }, [])

  const handleEventSubmit = (newEvent: Event) => {
    let updatedEvents: Event[]
    if (editingEvent) {
      updatedEvents = events.map(event => 
        event.id === newEvent.id ? newEvent : event
      )
    } else {
      updatedEvents = [...events, newEvent]
    }
    updatedEvents.sort((a, b) => compareDates(a.startDate, b.startDate))
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    setIsDialogOpen(false)
    setEditingEvent(null)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingEvent(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEvent(null)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              新しいイベントを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'イベントを編集' : '新しいイベントを追加'}
              </DialogTitle>
            </DialogHeader>
            <EventForm
              event={editingEvent || undefined}
              onSubmit={handleEventSubmit}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
        
      </div>
      {events.length === 0 ? (
        <p className="text-center text-gray-500">イベントがありません。新しいイベントを追加してください。</p>
      ) : (
        <EventList events={events} onEditEvent={handleEditEvent} />
      )}
    </div>
  )
}

