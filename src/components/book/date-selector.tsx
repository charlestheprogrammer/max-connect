import React from 'react'
import { AvailableJourney } from './journeys'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DateSelectorProps {
  dateStates: Map<
    string,
    {
      journeys: AvailableJourney[][] | null
      isLoading: boolean
    }
  >
  activeDate: string | null
  setActiveDate: (date: string) => void
  setData: (data: { count: number; journeys: AvailableJourney[][] }) => void
}

export default function DateSelector({
  dateStates,
  activeDate,
  setActiveDate,
  setData,
}: DateSelectorProps) {
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
    <div className="flex items-center gap-2 mb-4">
      <div
        className="flex flex-row gap-2 mb-10 overflow-x-auto no-scrollbar w-full"
        ref={scrollView}
      >
        {Array.from(dateStates.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, state]) => (
            <button
              key={date}
              onClick={() => {
                if (state.journeys) {
                  setData({
                    count: state.journeys.length,
                    journeys: state.journeys,
                  })
                  setActiveDate(date)
                }
              }}
              disabled={state.isLoading}
              aria-label={format(new Date(date), 'E dd', { locale: fr })}
              className={cn(
                'p-2 rounded-lg flex-1 capitalize min-w-[80px] md:min-w-[120px] text-center min-h-[60px] relative',
                activeDate === date ? 'bg-[#14708a] text-white' : 'bg-white',
                state.isLoading && 'opacity-70'
              )}
            >
              {state.isLoading ? (
                <div className="flex justify-center">
                  <LoadingSpinner
                    size={16}
                    color={activeDate === date ? '#fff' : '#14708a'}
                  />
                </div>
              ) : (
                <>
                  {format(new Date(date), 'E dd', { locale: fr }).replace(
                    '.',
                    ''
                  )}
                  <p className="hidden md:block">
                    <span className="font-bold">
                      {state.journeys?.length || 0}
                    </span>
                    {(state.journeys?.length || 0) > 1 ? ' options' : ' option'}
                  </p>
                </>
              )}
            </button>
          ))}
      </div>
    </div>
  )
}
