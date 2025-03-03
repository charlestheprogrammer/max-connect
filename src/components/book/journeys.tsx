'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { addDays, format, subDays } from 'date-fns'
import Journey from './journey'
import DateSelector from './date-selector'
import { LoadingSpinner } from '../ui/loading-spinner'

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

export default function Journeys() {
  const [data, setData] = React.useState<{
    count: number
    journeys: AvailableJourney[][]
  } | null>(null)
  const searchParams = useSearchParams()

  const [journeysByDate, setJourneysByDate] = React.useState<
    Map<string, AvailableJourney[][]>
  >(new Map())

  const getSearchResults = async (date: Date) => {
    setData(null)
    const datesToResults = new Map<string, AvailableJourney[][]>()
    const daysToFetch = []
    // Fetch previous 3 days and next 3 days
    for (let i = -3; i < 4; i++) {
      // If the date is in the past, skip it and fetch a day in the future
      if (i < 0 && addDays(new Date(date), i) < new Date()) {
        daysToFetch.push(format(addDays(date, 3 + Math.abs(i)), 'y-MM-dd'))
        continue
      }
      if (i < 0) {
        console.log(date, subDays(date, Math.abs(i)))
        daysToFetch.push(format(subDays(date, Math.abs(i)), 'y-MM-dd'))
      } else {
        daysToFetch.push(format(addDays(date, i), 'y-MM-dd'))
      }
    }
    for (const day of daysToFetch.sort((a, b) => a.localeCompare(b))) {
      const data = await fetchSncfData(
        searchParams.get('from'),
        searchParams.get('to'),
        new Date(day)
      ).catch(() => null)
      if (data) {
        datesToResults.set(day, data.journeys)
      }
    }
    setJourneysByDate(datesToResults)
    setData({
      count: datesToResults.get(format(date, 'y-MM-dd'))?.length || 0,
      journeys: datesToResults.get(format(date, 'y-MM-dd')) || [],
    })
    setActiveDate(format(new Date(date), 'y-MM-dd'))
  }

  React.useEffect(() => {
    if (searchParams.get('fromDate')) {
      getSearchResults(new Date(searchParams.get('fromDate') as string))
    }
  }, [searchParams])

  const [activeDate, setActiveDate] = React.useState<string | null>(null)

  return (
    <div>
      {journeysByDate.size > 0 && (
        <DateSelector
          journeysByDate={journeysByDate}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
          setData={setData}
        />
      )}
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
