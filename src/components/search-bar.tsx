'use client'

import React from 'react'
import { DatePickerWithRange } from './date-range-picker'
import { DateRange } from 'react-day-picker'
import SearchBarButton from './search/search-bar-button'
import { Search } from 'lucide-react'
import { Button } from './ui/button'
import TrainStation from '@/api/models/train-station'

export function SearchBar({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  })

  const onSubmit = () => {
    console.log({
      from,
      to,
      date,
    })
  }

  return (
    <div className="flex flex-row items-center justify-center bg-white p-3 rounded-lg shadow-lg">
      <SearchBarButton
        value={from}
        setValue={setFrom}
        type="Départ"
        id="from"
        trainStations={trainStations}
      />
      <SearchBarButton
        value={to}
        setValue={setTo}
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
        className="ml-3 bg-[#8DE8FE] border-none hover:bg-[#3FC8E9]"
        onClick={onSubmit}
      >
        <Search />
      </Button>
    </div>
  )
}
