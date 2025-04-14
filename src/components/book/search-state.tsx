'use client'

import { formatTripDate, cn } from '@/lib/utils'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import TrainStation from '@/app/api/models/train-station'
import SearchBarButton from '@/components/search/search-bar-button'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { fr } from 'date-fns/locale'

export default function SearchState({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [from, setFrom] = React.useState(
    trainStations.find((d) => d.iata === searchParams.get('from'))?.name ||
      searchParams.get('from') ||
      ''
  )
  const [fromStation, setFromStation] = React.useState<TrainStation | null>(
    null
  )

  const [to, setTo] = React.useState(
    trainStations.find((d) => d.iata === searchParams.get('to'))?.name ||
      searchParams.get('to') ||
      ''
  )
  const [toStation, setToStation] = React.useState<TrainStation | null>(null)

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(searchParams.get('fromDate') as string),
    to: searchParams.get('toDate')
      ? new Date(searchParams.get('toDate') as string)
      : undefined,
  })

  const formatToFr = React.useCallback((date: Date) => {
    return format(date, 'y-MM-dd', {
      locale: fr,
    })
  }, [])

  React.useEffect(() => {
    // Update the search params when the from date changes
    if (date?.from) {
      const newParams = new URLSearchParams(window.location.search)
      newParams.set('fromDate', formatToFr(date.from))
      newParams.delete('outbound')
      router.push(`/book?${newParams.toString()}`)
    } else {
      const newParams = new URLSearchParams(window.location.search)
      newParams.delete('fromDate')
      router.push(`/book?${newParams.toString()}`)
    }
  }, [date?.from, router])

  React.useEffect(() => {
    // Update the search params when the to date changes
    if (date?.to) {
      const newParams = new URLSearchParams(window.location.search)
      newParams.set('toDate', formatToFr(date.to))
      router.push(`/book?${newParams.toString()}`)
    } else {
      const newParams = new URLSearchParams(window.location.search)
      newParams.delete('toDate')
      router.push(`/book?${newParams.toString()}`)
    }
  }, [date?.to, router])

  React.useEffect(() => {
    // Update the search params when the from station changes
    if (fromStation) {
      const newParams = new URLSearchParams(window.location.search)
      newParams.set('from', fromStation.iata)
      newParams.delete('outbound')
      router.push(`/book?${newParams.toString()}`)
    }
  }, [fromStation, router])

  React.useEffect(() => {
    // Update the search params when the to station changes
    if (toStation) {
      const newParams = new URLSearchParams(window.location.search)
      newParams.set('to', toStation.iata)
      newParams.delete('outbound')
      router.push(`/book?${newParams.toString()}`)
    }
  }, [toStation, router])

  return (
    <div className="flex flex-col justify-between w-full md:h-12 gap-4 md:flex-row">
      <div className="bg-[#242B35] md:h-full flex-[5_1_auto] rounded-lg flex md:flex-row md:gap-2 md:h-12 flex-col h-[6rem] relative">
        <SearchBarButton
          value={from}
          setValue={setFrom}
          setTrainStation={setFromStation}
          type="Départ"
          id="from"
          trainStations={trainStations}
          inline
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="md:relative flex items-center justify-center md:h-12 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 md:rotate-0 md:translate-y-0 md:top-0">
                <div className="bg-[#0C131F] w-[2px] absolute left-1/2 h-12 -translate-x-1/2 hidden md:block"></div>
                <div
                  className="md:w-9 md:h-9 h-12 w-12 rounded-full bg-[#0C131F] relative flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    const toDate = searchParams.get('toDate')
                      ? `&toDate=${searchParams.get('toDate')}`
                      : ''
                    const beforeTo = to
                    setTo(from)
                    setFrom(beforeTo)
                    router.push(
                      `/book?from=${searchParams.get(
                        'to'
                      )}&to=${searchParams.get(
                        'from'
                      )}&fromDate=${searchParams.get('fromDate')}${toDate}`
                    )
                  }}
                >
                  <ArrowLeftRight color="#fff" size={18} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Échanger les destinations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="md:hidden w-full h-[2px] bg-[#0C131F]"></div>
        <SearchBarButton
          value={to}
          setValue={setTo}
          setTrainStation={setToStation}
          type="Arrivée"
          id="to"
          trainStations={trainStations}
          inline
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <div className="bg-[#242B35] md:h-full flex-[3_1_auto] rounded-lg flex flex-row gap-2 h-12 max-w-[500px]">
            <Button
              id="date-from"
              variant={'ghost'}
              className={cn(
                'flex-1 md:w-[180px] justify-start text-center font-normal h-full p-2 hover:bg-[#242B35]',
                !searchParams.get('fromDate') && 'text-muted-foreground'
              )}
            >
              {!searchParams.get('fromDate') && (
                <>
                  <Plus size={20} color="#666666" />
                  Ajouter un aller
                </>
              )}
              {searchParams.get('fromDate') && (
                <div className="flex items-center px-3 gap-1 flex-1 justify-center md:justify-start text-base">
                  <span className="text-muted-foreground md:block hidden">
                    Aller :
                  </span>
                  <span className="text-white">
                    {formatTripDate(
                      new Date(searchParams.get('fromDate') as string),
                      false
                    )}
                  </span>
                </div>
              )}
            </Button>
            <div className="w-[2px] bg-[#0C131F] h-full"></div>
            <Button
              id="date-to"
              variant={'ghost'}
              className={cn(
                'flex-1 md:w-[180px] justify-start text-center font-normal h-full p-2 hover:bg-[#242B35]',
                !date?.to && 'text-muted-foreground'
              )}
            >
              {!searchParams.get('toDate') && (
                <>
                  <Plus size={20} color="#666666" />
                  Ajouter un retour
                </>
              )}
              {searchParams.get('toDate') && (
                <div className="flex items-center px-3 gap-1 flex-1 justify-center md:justify-start text-base">
                  <span className="text-muted-foreground md:block hidden">
                    Retour :
                  </span>
                  <span className="text-white">
                    {formatTripDate(
                      new Date(searchParams.get('toDate') as string),
                      false
                    )}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            toDate={addDays(new Date(), 31)}
            mode="range"
            defaultMonth={new Date(searchParams.get('fromDate') || '')}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            fromDate={new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
