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

  // Store both the journeys and loading state for each date
  const [dateStates, setDateStates] = React.useState<Map<string, {
    journeys: AvailableJourney[][] | null,
    isLoading: boolean
  }>>(new Map())
  
  const [activeDate, setActiveDate] = React.useState<string | null>(null)

  const fetchDateData = async (date: string) => {
    setDateStates(prev => new Map(prev).set(date, { 
      journeys: null, 
      isLoading: true 
    }))

    const data = await fetchSncfData(
      searchParams.get('from'),
      searchParams.get('to'),
      new Date(date)
    ).catch(() => null)
    
    setDateStates(prev => new Map(prev).set(date, { 
      journeys: data?.journeys || [], 
      isLoading: false 
    }))

    return data
  }

  const getSearchResults = async (date: Date) => {
    setData(null)
    const formattedCurrentDate = format(date, 'y-MM-dd')
    
    // Calculate all dates to fetch upfront
    const datesToFetch = new Set<string>()
    for (let i = -3; i < 4; i++) {
      // If the date is in the past, skip it and fetch a day in the future
      if (i < 0 && addDays(new Date(date), i) < new Date()) {
        datesToFetch.add(format(addDays(date, 3 + Math.abs(i)), 'y-MM-dd'))
      } else {
        datesToFetch.add(i < 0 
          ? format(subDays(date, Math.abs(i)), 'y-MM-dd')
          : format(addDays(date, i), 'y-MM-dd'))
      }
    }

    // Initialize all dates with loading state
    const initialStates = new Map<string, { journeys: AvailableJourney[][] | null, isLoading: boolean }>()
    datesToFetch.forEach(date => {
      initialStates.set(date, { journeys: null, isLoading: true })
    })
    setDateStates(initialStates)

    // Fetch current date first
    const currentDateData = await fetchDateData(formattedCurrentDate)
    if (currentDateData) {
      setData({
        count: currentDateData.journeys.length,
        journeys: currentDateData.journeys,
      })
      setActiveDate(formattedCurrentDate)
    }

    // Fetch other dates in parallel
    const otherDates = Array.from(datesToFetch).filter(d => d !== formattedCurrentDate)
    Promise.all(
      otherDates
        .sort((a, b) => a.localeCompare(b))
        .map(day => fetchDateData(day))
    )
  }

  React.useEffect(() => {
    if (searchParams.get('fromDate')) {
      getSearchResults(new Date(searchParams.get('fromDate') as string))
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
