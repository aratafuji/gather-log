"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [currentPage, setCurrentPageState] = useState(1)
  const opportunityListRef = useRef<HTMLDivElement>(null)

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
      console.log('Saving opportunity:', newOpportunity);
      const savedOpportunity = await saveData('opportunities', [newOpportunity]);
      console.log('Saved opportunity:', savedOpportunity);

      if (!savedOpportunity || savedOpportunity.length === 0) {
        throw new Error('オポチュニティの保存に失敗しました');
      }

      const updatedOpportunity = savedOpportunity[0];
      
      // 既存の参加者を取得
      const existingParticipants = participants.filter(p => p.opportunityId === updatedOpportunity.id);
      
      // 新しい参加者リストを作成
      const updatedParticipants = newParticipants.map(participant => ({
        ...participant,
        id: existingParticipants.find(p => p.name === participant.name)?.id || participant.id,
        opportunityId: updatedOpportunity.id
      }));

      console.log('Saving participants:', updatedParticipants);
      // 参加者データを更新
      const savedParticipants = await saveData('participants', updatedParticipants);
      console.log('Saved participants:', savedParticipants);

      if (!savedParticipants || savedParticipants.length === 0) {
        throw new Error('参加者の保存に失敗しました');
      }

      setOpportunities(prev => {
        const updatedOpportunities = editingOpportunity
          ? prev.map(opp => opp.id === updatedOpportunity.id ? updatedOpportunity : opp)
          : [...prev, updatedOpportunity];
        return updatedOpportunities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });

      setParticipants(prev => {
        const filteredParticipants = prev.filter(p => p.opportunityId !== updatedOpportunity.id);
        return [...filteredParticipants, ...savedParticipants];
      });

      setIsDialogOpen(false);
      setEditingOpportunity(null);
      toast({
        title: "成功",
        description: "オポチュニティが正常に保存されました。",
      });
    } catch (err) {
      console.error('オポチュニティの保存に失敗しました:', err);
      setError('オポチュニティの保存に失敗しました。もう一度お試しください。');
      toast({
        title: "エラー",
        description: err instanceof Error ? err.message : "オポチュニティの保存に失敗しました。",
        variant: "destructive",
      });
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

  const setCurrentPage = (page: number) => {
    setCurrentPageState(page)
    opportunityListRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const PaginationComponent = () => (
    <Pagination>
      <PaginationContent>
        <PaginationPrevious 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
      </PaginationContent>
    </Pagination>
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
    <div className="space-y-6" ref={opportunityListRef}>
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
              eventId={event?.id || ''} 
              opportunity={editingOpportunity || undefined}
              existingParticipants={participants.filter(p => p.opportunityId === editingOpportunity?.id)}
              onSubmit={handleOpportunitySubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {opportunities.length > 0 && <PaginationComponent />}

      <div className="space-y-4">
        {paginatedOpportunities.map((opp) => (
          <div key={opp.id} className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/opportunity/${opp.id}`} className="text-xl font-semibold text-gray-800 hover:text-gray-600">
                {opp.name}
              </Link>
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
                    <Link href={`/participants/${participant.id}`} className="text-blue-500 hover:underline">
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
            {opp.relatedUrl && (
              <div>
                <a href={opp.relatedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  関連リンク
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {opportunities.length > 0 && <PaginationComponent />}
    </div>
  )
}

