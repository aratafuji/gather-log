"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Event, Opportunity, Participant } from '@/types/types'
import { CalendarIcon, MapPinIcon, PlusIcon, PencilIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OpportunityForm } from '@/components/opportunity-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fetchData, saveData, deleteData } from '@/utils/dataOperations'
import { toast } from '@/components/ui/use-toast'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 10

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchEventData = useCallback(async () => {
    try {
      setIsLoading(true)
      const events = await fetchData('events')
      const foundEvent = events.find((event: Event) => event.id === id)
      if (foundEvent) {
        setEvent(foundEvent)
      }
      setIsLoading(false)
    } catch (err) {
      console.error('イベントデータの取得に失敗しました:', err)
      setError('イベントデータの取得に失敗しました。もう一度お試しください。')
      setIsLoading(false)
    }
  }, [id])

  const fetchOpportunitiesData = useCallback(async () => {
    try {
      const allOpportunities = await fetchData('opportunities')
      const allParticipants = await fetchData('participants')
      const eventOpportunities = allOpportunities
        .filter((opp: Opportunity) => opp.eventId === id)
        .sort((a: Opportunity, b: Opportunity) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setOpportunities(eventOpportunities)
      setParticipants(allParticipants)
    } catch (err) {
      console.error('オポチュニティデータの取得に失敗しました:', err)
      setError('オポチュニティデータの取得に失敗しました。もう一度お試しください。')
    }
  }, [id])

  useEffect(() => {
    fetchEventData()
    fetchOpportunitiesData()
  }, [fetchEventData, fetchOpportunitiesData])

  const handleOpportunitySubmit = async (newOpportunity: Opportunity, newParticipants: Participant[]) => {
    try {
      await saveData('opportunities', [newOpportunity])
    
      // 既存の参加者を削除
      const existingParticipants = participants.filter(p => p.opportunityId === newOpportunity.id)
      for (const participant of existingParticipants) {
        await deleteData('participants', participant.id)
      }

      // 新しい参加者を保存
      for (const participant of newParticipants) {
        participant.opportunityId = newOpportunity.id
        await saveData('participants', [participant])
      }

      setOpportunities(prev => {
        const updatedOpportunities = editingOpportunity
          ? prev.map(opp => opp.id === newOpportunity.id ? newOpportunity : opp)
          : [...prev, newOpportunity]
        return updatedOpportunities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      })

      setParticipants(prev => {
        const filteredParticipants = prev.filter(p => p.opportunityId !== newOpportunity.id)
        return [...filteredParticipants, ...newParticipants]
      })

      setIsDialogOpen(false)
      setEditingOpportunity(null)
      toast({
        title: "成功",
        description: "オポチュニティが正常に保存されました。",
      })
    } catch (err) {
      console.error('オポチュニティの保存に失敗しました:', err)
      setError('オポチュニティの保存に失敗しました。もう一度お試しください。')
      toast({
        title: "エラー",
        description: "オポチュニティの保存に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingOpportunity(null)
  }

  const totalPages = Math.ceil(opportunities.length / ITEMS_PER_PAGE)
  const paginatedOpportunities = opportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingOpportunity(null)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              オポチュニティを追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOpportunity ? 'オポチュニティを編集' : '新しいオポチュニティを追加'}
              </DialogTitle>
            </DialogHeader>
            <OpportunityForm 
              eventId={event.id} 
              opportunity={editingOpportunity || undefined}
              existingParticipants={participants.filter(p => p.opportunityId === editingOpportunity?.id)}
              onSubmit={handleOpportunitySubmit}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {paginatedOpportunities.map((opp) => (
          <div key={opp.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-2">
              {opp.relatedUrl ? (
                <Link href={`/opportunity/${opp.id}`} className="text-xl font-semibold text-gray-800 hover:text-gray-600">
                  {opp.name}
                  {opp.relatedUrl && (
                    <a
                      href={opp.relatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      (関連リンク)
                    </a>
                  )}
                </Link>
              ) : (
                <Link href={`/opportunity/${opp.id}`} className="text-xl font-semibold text-gray-800 hover:text-gray-600">
                  {opp.name}
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleEditOpportunity(opp)}>
                <PencilIcon className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{opp.date}</p>
            <p className="mb-2 text-gray-700 whitespace-pre-wrap">{opp.content}</p>
            <div className="mb-2">
              <h5 className="text-sm font-semibold text-gray-700">参加者:</h5>
              <p className="text-sm text-gray-600">
                {participants.filter(p => p.opportunityId === opp.id).map((participant, index) => (
                  <span key={participant.id}>
                    {index > 0 && ', '}
                    <Link href={`/participants/${encodeURIComponent(participant.name)}`} className="text-blue-500 hover:underline">
                      {participant.name}
                    </Link>
                  </span>
                ))}
              </p>
              <Link href={`/opportunity/${opp.id}/participants`} className="inline-flex items-center text-gray-600 hover:text-gray-800">
                <UsersIcon className="w-4 h-4" />
                <span className="sr-only">参加者を管理</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationPrevious 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationLink
              key={page}
              onClick={() => setCurrentPage(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          ))}
          <PaginationNext
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          />
        </PaginationContent>
      </Pagination>
    </div>
  )
}

