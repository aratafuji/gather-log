import { Event } from '@/types/types'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, PencilIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface EventListProps {
  events: Event[]
  onEditEvent: (event: Event) => void
}

export function EventList({ events, onEditEvent }: EventListProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <a 
              href={event.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xl font-semibold text-gray-800 hover:text-gray-600"
              aria-label={`${event.name} - 外部リンクが開きます`}
            >
              {event.name}
            </a>
            <Button variant="ghost" size="sm" onClick={() => onEditEvent(event)}>
              <PencilIcon className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {event.startDate} - {event.endDate}
            </span>
            <span className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {event.location}
            </span>
          </div>
          <div className="flex justify-end">
            <Link href={`/event/${event.id}`}>
              <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
                オポチュニティ一覧
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

