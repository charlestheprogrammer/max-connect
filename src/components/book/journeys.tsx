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

const loadAvailableJourneys = (data: AvailableJourney[]) => {
  return data?.map((journey: AvailableJourney) => ({
    train_no: journey.train_no,
    origine: journey.origine,
    destination: journey.destination,
    destination_iata: journey.destination_iata,
    origine_iata: journey.origine_iata,
    date: new Date(journey.date),
    heure_depart: new Date(
      new Date(journey.date).setHours(
        parseInt(journey.heure_depart.toString().split(':')[0]),
        parseInt(
          journey.heure_depart.toString().split(':')[
            journey.heure_depart.toString().split(':').length - 1
          ]
        )
      )
    ),
    heure_arrivee: new Date(
      new Date(journey.date).setHours(
        parseInt(journey.heure_arrivee.toString().split(':')[0]),
        parseInt(
          journey.heure_arrivee.toString().split(':')[
            journey.heure_arrivee.toString().split(':').length - 1
          ]
        )
      )
    ),
  }))
}

type JourneysData = {
  total_count: number
  results: AvailableJourney[]
}

const fetchSncfData = async (
  from: string | null,
  to: string | null,
  date: Date
) => {
  if (!from || !to) {
    return { count: 0, journeys: [] }
  }
  const res = await fetch(
    `https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records?select=train_no%2Corigine%2Cdestination%2Cdestination_iata%2Corigine_iata%2C%20date%2Cheure_depart%2Cheure_arrivee&where=od_happy_card%3D%27OUI%27%20AND%20origine_iata%3D%27${from}%27%20AND%20destination_iata%3D%27${to}%27%20AND%20date%3Ddate%27${format(
      date,
      'y-MM-dd'
    )}%27&order_by=date%20asc%2C%20heure_depart%20asc&limit=10&offset=0&timezone=UTC&include_links=false&include_app_metas=false`
  )
  const data = await res.json()
  const { total_count: count, results: journeys }: JourneysData = data
  return { count, journeys: loadAvailableJourneys(journeys) }
}

export default function Journeys() {
  const [data, setData] = React.useState<{
    count: number
    journeys: AvailableJourney[]
  } | null>(null)
  const searchParams = useSearchParams()

  const [journeysByDate, setJourneysByDate] = React.useState<
    Map<string, AvailableJourney[]>
  >(new Map())

  const getSearchResults = async (date: Date) => {
    setData(null)
    const datesToResults = new Map<string, AvailableJourney[]>()
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
          {data.journeys?.map((journey) => (
            <Journey key={journey.train_no + journey.date} journey={journey} />
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
