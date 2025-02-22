'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type AvailableJourney = {
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

const fetchSncfData = async (from: string | null, to: string | null) => {
  if (!from || !to) {
    return { count: 0, journeys: [] }
  }
  const res = await fetch(
    `https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/records?select=train_no%2Corigine%2Cdestination%2Cdestination_iata%2Corigine_iata%2C%20date%2Cheure_depart%2Cheure_arrivee&where=od_happy_card%3D%27OUI%27%20AND%20origine_iata%3D%27${from}%27%20AND%20destination_iata%3D%27${to}%27&order_by=date%20asc%2C%20heure_depart%20asc&limit=10&offset=0&timezone=UTC&include_links=false&include_app_metas=false`
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

  React.useEffect(() => {
    fetchSncfData(searchParams.get('from'), searchParams.get('to')).then(
      (data) => setData(data)
    )
  }, [searchParams])

  return (
    <div>
      <h1>Available journeys</h1>
      {data ? (
        <ul>
          {data.journeys?.map((journey) => (
            <li key={journey.date + journey.train_no}>
              <h2>{journey.train_no}</h2>
              <p>
                {journey.origine} ({journey.origine_iata}) -{' '}
                {journey.destination} ({journey.destination_iata})
              </p>
              <p>
                {journey.date.toISOString().split('T')[0]}{' '}
                {format(journey.heure_depart, 'HH:mm', {
                  locale: fr,
                })}{' '}
                -{' '}
                {format(journey.heure_arrivee, 'HH:mm', {
                  locale: fr,
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
