'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { addDays, format, subDays } from 'date-fns'
import Journey from './journey'
import DateSelector from './date-selector'
import { LoadingSpinner } from '../ui/loading-spinner'
import TrainStation from '@/app/api/models/train-station'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type AvailableJourney = {
  train_no: string
  origine: string
  destination: string
  destination_iata: string
  origine_iata: string
  date: Date
  heure_depart: Date
  heure_arrivee: Date
}

const parseLocalResults = (data: {
  canGo: boolean
  min_depth: number
  posibilities?: {
    destination_iata: string
    heure_arrivee: string
    depth: number
    history: AvailableJourney[]
  }[]
}) => {
  return data.posibilities?.map((record) => record.history) || []
}

const fetchSncfData = async (
  from: string | null,
  to: string | null,
  date: Date
) => {
  if (!from || !to) {
    return { count: 0, journeys: [] }
  }

  const localRes = await fetch(
    `/api/journeys?from=${from}&to=${to}&date=${format(date, 'y-MM-dd')}`
  )
  const localData = (await localRes.json()) as {
    canGo: boolean
    min_depth: number
    posibilities: {
      destination_iata: string
      heure_arrivee: string
      depth: number
      history: AvailableJourney[]
    }[]
  }

  return {
    count: localData.posibilities?.length || 0,
    journeys: parseLocalResults(localData),
  }
}

export default function Journeys({
  trainStations,
}: {
  trainStations: TrainStation[]
}) {
  const [data, setData] = React.useState<{
    count: number
    journeys: AvailableJourney[][]
  } | null>(null)
  const searchParams = useSearchParams()

  const [dateStates, setDateStates] = React.useState<
    Map<
      string,
      {
        journeys: AvailableJourney[][] | null
        isLoading: boolean
      }
    >
  >(new Map())

  const [canLoadPrevious, setCanLoadPrevious] = React.useState(true)
  const [canLoadNext, setCanLoadNext] = React.useState(true)

  const [activeDate, setActiveDate] = React.useState<string | null>(null)

  const fetchDateData = async (date: string) => {
    setDateStates((prev) =>
      new Map(prev).set(date, {
        journeys: null,
        isLoading: true,
      })
    )

    const outbound = searchParams.get('outbound') === 'true'

    const data = await fetchSncfData(
      outbound ? searchParams.get('to') : searchParams.get('from'),
      outbound ? searchParams.get('from') : searchParams.get('to'),
      new Date(date)
    ).catch(() => null)

    setDateStates((prev) =>
      new Map(prev).set(date, {
        journeys: data?.journeys || [],
        isLoading: false,
      })
    )

    return data
  }

  const getSearchResults = async (date: Date) => {
    setData(null)
    const formattedCurrentDate = format(date, 'y-MM-dd')

    const datesToFetch = new Set<string>()
    for (let i = -3; i < 4; i++) {
      if (i < 0 && addDays(new Date(date), i) < new Date()) {
        datesToFetch.add(format(addDays(date, 3 + Math.abs(i)), 'y-MM-dd'))
      } else if (
        i > 0 &&
        addDays(new Date(date), i) > addDays(new Date(), 31)
      ) {
        datesToFetch.add(format(subDays(date, 3 + i), 'y-MM-dd'))
      } else {
        datesToFetch.add(
          i < 0
            ? format(subDays(date, Math.abs(i)), 'y-MM-dd')
            : format(addDays(date, i), 'y-MM-dd')
        )
      }
    }

    const initialStates = new Map<
      string,
      { journeys: AvailableJourney[][] | null; isLoading: boolean }
    >()
    datesToFetch.forEach((date) => {
      initialStates.set(date, { journeys: null, isLoading: true })
    })
    setDateStates(initialStates)

    const currentDateData = await fetchDateData(formattedCurrentDate)
    if (currentDateData) {
      setData({
        count: currentDateData.journeys.length,
        journeys: currentDateData.journeys,
      })
      setActiveDate(formattedCurrentDate)
    }

    const otherDates = Array.from(datesToFetch).filter(
      (d) => d !== formattedCurrentDate
    )
    Promise.all(
      otherDates
        .sort((a, b) => a.localeCompare(b))
        .map((day) => fetchDateData(day))
    )
  }

  React.useEffect(() => {
    setCanLoadPrevious(true)
    setCanLoadNext(true)
  }, [searchParams])

  const loadMoreDays = async (direction: 'previous' | 'next') => {
    const currentDates = Array.from(dateStates.keys())
    const referenceDate =
      direction === 'previous'
        ? subDays(
            new Date(
              Math.min(...currentDates.map((d) => new Date(d).getTime()))
            ),
            1
          )
        : addDays(
            new Date(
              Math.max(...currentDates.map((d) => new Date(d).getTime()))
            ),
            1
          )

    const diffInDaysBetweenNowAndReferenceDate =
      Math.ceil(
        (referenceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ) + 1

    const diffInDaysBetween31DaysAndReferenceDate = Math.ceil(
      (addDays(new Date(), 31).getTime() - referenceDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const maxDatesToFetch =
      direction === 'previous'
        ? diffInDaysBetweenNowAndReferenceDate > 3
          ? 3
          : Math.max(diffInDaysBetweenNowAndReferenceDate, 0)
        : diffInDaysBetween31DaysAndReferenceDate > 3
        ? 3
        : Math.max(diffInDaysBetween31DaysAndReferenceDate, 0)

    const canFetchMore = maxDatesToFetch === 3

    if (direction === 'previous') {
      setCanLoadPrevious(canFetchMore)
    }
    if (direction === 'next') {
      setCanLoadNext(canFetchMore)
    }

    const newDates = []
    for (let i = 0; i < maxDatesToFetch; i++) {
      const newDate =
        direction === 'previous'
          ? subDays(referenceDate, i)
          : addDays(referenceDate, i)
      newDates.push(format(newDate, 'y-MM-dd'))
    }

    const datesToWait = []

    for (const date of newDates) {
      if (!dateStates.has(date)) {
        datesToWait.push(fetchDateData(date))
      }
    }

    const results = await Promise.all(datesToWait)

    setActiveDate(newDates.at(-1)!)
    setData({
      count: results[results.length - 1]?.count || 0,
      journeys: results[results.length - 1]?.journeys || [],
    })
  }

  React.useEffect(() => {
    if (searchParams.get('fromDate') && !searchParams.get('outbound')) {
      getSearchResults(new Date(searchParams.get('fromDate') as string))
    } else if (searchParams.get('toDate') && searchParams.get('outbound')) {
      getSearchResults(new Date(searchParams.get('toDate') as string))
    }
  }, [searchParams])

  return (
    <div>
      {dateStates.size > 0 && (
        <DateSelector
          dateStates={dateStates}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
          setData={setData}
        />
      )}
      <div className="flex justify-between my-4">
        <Button
          onClick={() => loadMoreDays('previous')}
          className="bg-white text-black hover:bg-[#14708a] hover:text-white"
          size="icon"
          disabled={!canLoadPrevious}
        >
          <ChevronLeft />
        </Button>
        <Button
          onClick={() => loadMoreDays('next')}
          className="bg-white text-black hover:bg-[#14708a] hover:text-white"
          size="icon"
          disabled={!canLoadNext}
        >
          <ChevronRight />
        </Button>
      </div>
      {data ? (
        <div className="flex flex-col gap-2">
          {data.journeys?.map((journey, index) => (
            <Journey
              key={
                journey
                  .map(
                    (journey) =>
                      `${journey.train_no}${journey.origine_iata}${journey.destination_iata}`
                  )
                  .join('') +
                journey[0].date +
                index
              }
              journey={journey}
              data={trainStations}
            />
          ))}
          {data.journeys.length === 0 && (
            <p className="text-center text-muted-foreground">
              Aucun train disponible
            </p>
          )}
        </div>
      ) : (
        <p className="flex justify-center w-full">
          <LoadingSpinner size={100} color="#14708a" />
        </p>
      )}
    </div>
  )
}
