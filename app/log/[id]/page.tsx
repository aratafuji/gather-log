"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EventLog } from '@/types/types'
import { CalendarIcon, MapPinIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LogDetail() {
  const { id } = useParams()
  const [log, setLog] = useState<EventLog | null>(null)

  useEffect(() => {
    const storedLogs = localStorage.getItem('eventLogs')
    if (storedLogs) {
      const logs: EventLog[] = JSON.parse(storedLogs)
      const foundLog = logs.find(log => log.id === id)
      if (foundLog) {
        setLog(foundLog)
      }
    }
  }, [id])

  if (!log) {
    return <div>ログが見つかりません。</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/">
        <Button variant="outline" className="mb-4">← 戻る</Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">{log.eventName}</h1>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5" />
          <span>{log.date}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-5 h-5" />
          <span>{log.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <UserIcon className="w-5 h-5" />
          <span>{log.personMet}</span>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">メモ</h2>
          <p className="whitespace-pre-wrap">{log.notes}</p>
        </div>
      </div>
    </div>
  )
}

