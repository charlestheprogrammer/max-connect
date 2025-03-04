'use client'

import React from 'react'
import { DatePickerWithRange } from './date-range-picker'
import { DateRange } from 'react-day-picker'
import SearchBarButton from './search/search-bar-button'
import { Search } from 'lucide-react'
import { Button } from './ui/button'
import TrainStation from '@/app/api/models/train-station'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useSearchContext } from '@/context/search'

export function SearchBar({
  trainStations,
  className,
}: {
  trainStations: TrainStation[]
  className?: string
}) {
  const [from, setFrom] = React.useState('')
  const [fromStation, setFromStation] = React.useState<TrainStation | null>(null)
  const [to, setTo] = React.useState('')
  const [toStation, setToStation] = React.useState<TrainStation | null>(null)
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  })

  const { setSearch } = useSearchContext()

  const formatToFr = React.useCallback((date: Date) => {
    return format(date, 'y-MM-dd', {
      locale: fr,
    })
  }, [])

  const router = useRouter()

  const onSubmit = () => {
    if (!fromStation || !toStation || !date?.from) {
      console.log('missing fields')
      return
    }

    setSearch(
      fromStation.iata,
      toStation.iata,
      date.from,
      date.to
    )

    const toDate = date?.to ? `&toDate=${formatToFr(date.to)}` : ''

    router.push(
      `book?from=${fromStation.iata}&to=${toStation.iata}&fromDate=${formatToFr(date.from)}${toDate}`
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between bg-white p-3 gap-2 rounded-lg shadow-lg md:flex-row md:p-4 max-w-[1000px] w-11/12',
        className
      )}
    >
      <SearchBarButton
        value={from}
        setValue={setFrom}
        setTrainStation={setFromStation}
        type="Départ"
        id="from"
        trainStations={trainStations}
      />
      <SearchBarButton
        value={to}
        setValue={setTo}
        setTrainStation={setToStation}
        type="Arrivée"
        id="to"
        trainStations={trainStations}
      />
      <DatePickerWithRange
        onChangeDate={(date) => {
          setDate(date)
        }}
      />
      <Button
        variant="outline"
        size="icon"
        className="md:ml-3 bg-[#14708a] border-none hover:bg-[#006179] w-full md:h-12 md:w-12 mt-2 md:mt-0"
        onClick={onSubmit}
      >
        <Search color='#fff' />
      </Button>
    </div>
  )
}
