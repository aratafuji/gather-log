"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Participant } from '@/types/types'

export default function ParticipantList() {
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    const storedParticipants = localStorage.getItem('participants')
    if (storedParticipants) {
      const allParticipants: Participant[] = JSON.parse(storedParticipants)
      const uniqueParticipants = allParticipants.reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name)
        if (!x) {
          return acc.concat([current])
        } else {
          return acc
        }
      }, [])
      setParticipants(uniqueParticipants.sort((a, b) => a.name.localeCompare(b.name)))
    }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">参加者一覧</h1>
      <div className="bg-white shadow-sm rounded-lg p-6">
        {participants.map((participant) => (
          <Link key={participant.id} href={`/participants/${participant.id}`}>
            <div className="py-2 hover:bg-gray-100 cursor-pointer">
              <h2 className="text-lg font-semibold text-gray-800">{participant.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

