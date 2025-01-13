import { EventLog } from '@/types/types'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, UserIcon } from 'lucide-react'

interface EventLogListProps {
  logs: EventLog[]
}

export function EventLogList({ logs }: EventLogListProps) {
  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Link key={log.id} href={`/log/${log.id}`} className="block">
          <div className="border rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <h3 className="text-lg font-semibold mb-2">{log.eventName}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {log.date}
              </span>
              <span className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {log.location}
              </span>
              <span className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                {log.personMet}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

