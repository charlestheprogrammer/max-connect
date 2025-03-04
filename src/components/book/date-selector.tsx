import React from 'react'
import { AvailableJourney } from './journeys'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function DateSelector({
  journeysByDate,
  activeDate,
  setActiveDate,
  setData,
}: {
  journeysByDate: Map<string, AvailableJourney[][]>
  activeDate: string | null
  setActiveDate: (date: string) => void
  setData: (data: { count: number; journeys: AvailableJourney[][] }) => void
}) {
  const scrollView = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollView.current && activeDate) {
      const activeDateElement = scrollView.current.querySelector(
        `[aria-label="${format(new Date(activeDate), 'E dd', {
          locale: fr,
        })}"]`
      )
      if (activeDateElement) {
        activeDateElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
      }
    }
  }, [activeDate])

  return (
    <div
      className="flex flex-row gap-2 mb-10 overflow-x-auto no-scrollbar"
      ref={scrollView}
    >
      {Array.from(journeysByDate.keys())
        .sort()
        .map((date) => (
          <button
            key={date}
            onClick={() => {
              setData({
                count: journeysByDate.get(date)?.length || 0,
                journeys: journeysByDate.get(date) || [],
              })
              setActiveDate(date)
            }}
            aria-label={format(new Date(date), 'E dd', { locale: fr })}
            className={cn(
              'p-2 rounded-lg flex-1 capitalize min-w-[80px] text-center min-h-[60px]',
              activeDate === date ? 'bg-[#14708a] text-white' : 'bg-white'
            )}
          >
            {format(new Date(date), 'E dd', { locale: fr }).replace('.', '')}
            {
              <p className="hidden md:block">
                <span className="font-bold">
                  {journeysByDate.get(date)?.length || 0}
                </span>
                {(journeysByDate.get(date)?.length || 0) > 1
                  ? ' options'
                  : ' option'}
              </p>
            }
          </button>
        ))}
    </div>
  )
}
