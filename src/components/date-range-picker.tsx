'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn, formatTripDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { addDays } from 'date-fns'

export function DatePickerWithRange({
  className,
  onChangeDate,
}: {
  className?: string
  onChangeDate: (date: DateRange | undefined) => void
}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  })

  React.useEffect(() => {
    onChangeDate(date)
  }, [date, onChangeDate])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex flex-row items-center justify-center md:h-full flex-1 w-full',
            className
          )}
        >
          <Button
            id="date-from"
            variant={'ghost'}
            className={cn(
              'flex-1 md:w-[180px] justify-start text-center font-normal h-full p-2',
              !date?.from && 'text-muted-foreground'
            )}
          >
            {!date?.from && (
              <>
                <Plus size={20} color="#666666" />
                Ajouter un aller
              </>
            )}
            {date?.from && (
              <div className="flex flex-col items-start">
                <span className="text-muted-foreground">Aller</span>
                <span className="text-sm">{formatTripDate(date.from)}</span>
              </div>
            )}
          </Button>
          <Button
            id="date-to"
            variant={'ghost'}
            className={cn(
              'flex-1 md:w-[180px] justify-start text-center font-normal h-full p-2',
              !date?.to && 'text-muted-foreground'
            )}
          >
            {!date?.to && (
              <div className="flex flex-row items-center gap-2 h-full">
                <Plus size={20} color="#666666" />
                Ajouter un retour
              </div>
            )}
            {date?.to && (
              <div className="flex flex-col items-start">
                <span className="text-muted-foreground">Retour</span>
                <span className="text-sm">{formatTripDate(date.to)}</span>
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
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
          fromDate={new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
