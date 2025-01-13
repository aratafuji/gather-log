"use client"

import { useState, useEffect } from 'react'
import { EventList } from '@/components/event-list'
import { Event } from '@/types/types'
import { compareDates } from '@/utils/dateUtils'
import { PlusIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EventForm } from '@/components/event-form'
import { fetchData, saveData } from '@/utils/dataOperations'
import { toast } from '@/components/ui/use-toast'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        const data = await fetchData('events')
        setEvents(data.sort((a: Event, b: Event) => compareDates(a.startDate, b.startDate)))
        setIsLoading(false)
      } catch (err) {
        console.error('イベントデータの取得に失敗しました:', err)
        setError('イベントデータの取得に失敗しました。もう一度お試しください。')
        setIsLoading(false)
        toast({
          title: "エラー",
          description: "イベントデータの取得に失敗しました。",
          variant: "destructive",
        })
      }
    }
    loadEvents()
  }, [])

  const handleEventSubmit = async (newEvent: Event) => {
    try {
      const savedEvent = await saveData('events', [newEvent])
      if (!savedEvent || savedEvent.length === 0) {
        throw new Error('保存されたイベントデータが空です')
      }
      let updatedEvents: Event[]
      if (editingEvent) {
        updatedEvents = events.map(event => 
          event.id === newEvent.id ? savedEvent[0] : event
        )
      } else {
        updatedEvents = [...events, savedEvent[0]]
      }
      updatedEvents.sort((a, b) => compareDates(a.startDate, b.startDate))
      setEvents(updatedEvents)
      setIsDialogOpen(false)
      setEditingEvent(null)
      toast({
        title: "成功",
        description: "イベントが正常に保存されました。",
      })
    } catch (err) {
      console.error('イベントの保存に失敗しました:', err)
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err)
      setError(`イベントの保存に失敗しました: ${errorMessage}`)
      toast({
        title: "エラー",
        description: `イベントの保存に失敗しました: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingEvent(null)
  }

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4" onClick={() => setEditingEvent(null)}>
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
        {events.length === 0 ? (
          <p className="text-center text-gray-500">イベントがありません。新しいイベントを追加してください。</p>
        ) : (
          <EventList events={events} onEditEvent={handleEditEvent} />
        )}
      </div>
    </div>
  )
}

