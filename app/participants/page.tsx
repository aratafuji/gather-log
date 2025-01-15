"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Participant } from '@/types/types'
import { fetchData } from '@/utils/dataOperations'
import { Button } from '@/components/ui/button'

export default function ParticipantList() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true)
        const allParticipants: Participant[] = await fetchData('participants')
        
        // nameで集約し、重複を除去する
        const aggregatedParticipants = Object.values(
          allParticipants.reduce((acc, participant) => {
            if (!acc[participant.name]) {
              acc[participant.name] = {
                ...participant,
                count: 1
              }
            } else {
              acc[participant.name].count++
            }
            return acc
          }, {} as Record<string, Participant & { count: number }>)
        )

        // 名前でソートする
        const sortedParticipants = aggregatedParticipants.sort((a, b) => 
          a.name.localeCompare(b.name)
        )

        setParticipants(sortedParticipants)
        setIsLoading(false)
      } catch (err) {
        console.error('参加者データの取得に失敗しました:', err)
        setError('参加者データの取得に失敗しました。もう一度お試しください。')
        setIsLoading(false)
      }
    }

    fetchParticipants()
  }, [])

  if (isLoading) {
    return <div className="text-center">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">参加者一覧</h1>
        <Link href="/">
          <Button variant="outline" className="text-gray-600 hover:text-gray-800">← ホームに戻る</Button>
        </Link>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-6">
        {participants.length === 0 ? (
          <p className="text-center text-gray-500">参加者がいません。</p>
        ) : (
          participants.map((participant) => (
            <Link key={participant.id} href={`/participants/${encodeURIComponent(participant.name)}`}>
              <div className="py-2 hover:bg-gray-100 cursor-pointer">
                <h2 className="text-lg font-semibold text-gray-800">
                  {participant.name} 
                  <span className="ml-2 text-sm text-gray-500">
                    ({participant.count}回参加)
                  </span>
                </h2>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

