"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Event, Opportunity, Participant } from '@/types/types'
import { CalendarIcon, MapPinIcon, PlusIcon, PencilIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OpportunityForm } from '@/components/opportunity-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)

  const fetchData = useCallback(() => {
    const storedEvents = localStorage.getItem('events')
    const storedOpportunities = localStorage.getItem('opportunities')
    const storedParticipants = localStorage.getItem('participants')
    if (storedEvents) {
      const events: Event[] = JSON.parse(storedEvents)
      const foundEvent = events.find(event => event.id === id)
      if (foundEvent) {
        setEvent(foundEvent)
      }
    }
    if (storedOpportunities && storedParticipants) {
      const allOpportunities: Opportunity[] = JSON.parse(storedOpportunities)
      const allParticipants: Participant[] = JSON.parse(storedParticipants)
      const eventOpportunities = allOpportunities.filter(opp => opp.eventId === id)
      const opportunitiesWithParticipants = eventOpportunities.map(opp => ({
        ...opp,
        participants: allParticipants.filter(p => p.opportunityId === opp.id)
      }))
      setOpportunities(opportunitiesWithParticipants)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpportunitySubmit = (newOpportunity: Opportunity) => {
    let updatedOpportunities: Opportunity[]
    if (editingOpportunity) {
      updatedOpportunities = opportunities.map(opp => 
        opp.id === newOpportunity.id ? newOpportunity : opp
      )
    } else {
      updatedOpportunities = [...opportunities, newOpportunity]
    }
    setOpportunities(updatedOpportunities)
    const allOpportunities = JSON.parse(localStorage.getItem('opportunities') || '[]')
    const updatedAllOpportunities = editingOpportunity
      ? allOpportunities.map(opp => opp.id === newOpportunity.id ? newOpportunity : opp)
      : [...allOpportunities, newOpportunity]
    localStorage.setItem('opportunities', JSON.stringify(updatedAllOpportunities))
    setIsDialogOpen(false)
    setEditingOpportunity(null)
  }

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingOpportunity(null)
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'opportunities' || e.key === 'participants') {
        fetchData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchData])

  if (!event) {
    return <div className="text-center text-gray-600">イベントが見つかりません。</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
            {event.name}
          </a>
        </h1>
        <Link href="/">
          <Button variant="outline" className="text-gray-600 hover:text-gray-800">← 戻る</Button>
        </Link>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <CalendarIcon className="w-5 h-5" />
          <span>{event.startDate} - {event.endDate}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPinIcon className="w-5 h-5" />
          <span>{event.location}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">オポチュニティ</h2>
        <div className="space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingOpportunity(null)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                オポチュニティを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingOpportunity ? 'オポチュニティを編集' : '新しいオポチュニティを追加'}
                </DialogTitle>
              </DialogHeader>
              <OpportunityForm 
                eventId={event.id} 
                opportunity={editingOpportunity || undefined}
                onSubmit={handleOpportunitySubmit}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-2">
              {opp.relatedUrl ? (
                <a 
                  href={opp.relatedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xl font-semibold text-gray-800 hover:text-gray-600"
                  aria-label={`${opp.name} - 外部リンクが開きます`}
                >
                  {opp.name}
                </a>
              ) : (
                <h4 className="text-xl font-semibold text-gray-800">{opp.name}</h4>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleEditOpportunity(opp)}>
                <PencilIcon className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{opp.date}</p>
            <p className="mb-2 text-gray-700">{opp.content}</p>
            <div className="mb-2">
              <h5 className="text-sm font-semibold text-gray-700">参加者:</h5>
              <p className="text-sm text-gray-600">
                {opp.participants && opp.participants.map((participant, index) => (
                  <span key={participant.id}>
                    {index > 0 && ', '}
                    {participant.discordId ? (
                      <a
                        href={`https://discordapp.com/users/${participant.discordId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {participant.name}
                      </a>
                    ) : (
                      participant.name
                    )}
                  </span>
                ))}
              </p>
            </div>
            <div className="flex justify-end">
              <Link href={`/opportunity/${opp.id}/participants`}>
                <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                  参加者一覧
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

