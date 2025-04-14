import { connect } from '@/utils/server/mongoose'
import Journey from '../models/journey'
import { NextResponse } from 'next/server'

export const maxDuration = 60

type TempJourney = {
  train_no: string
  origine: string
  destination: string
  destination_iata: string
  origine_iata: string
  date: Date
  heure_depart: string
  heure_arrivee: string
  od_happy_card: string
}

function computeInternalId(journey: TempJourney) {
  const date = new Date(journey.date)

  return `${journey.origine_iata}-${
    journey.destination_iata
  }-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${
    journey.train_no
  }-${journey.heure_depart}`
}

export async function GET() {
  await connect()

  const journeysResponse = await fetch(
    'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/exports/json?lang=fr&timezone=Europe%2FBerlin'
  )

  const journeys = (await journeysResponse.json()).filter(
    (journey: TempJourney) => journey.od_happy_card === 'OUI'
  )

  await Journey.deleteMany({})

  await Journey.insertMany(
    journeys.map((journey: TempJourney) => {
      const internal_id = computeInternalId(journey)

      const heure_depart = new Date(
        new Date(journey.date).setHours(
          parseInt(journey.heure_depart.toString().split(':')[0]),
          parseInt(
            journey.heure_depart.toString().split(':')[
              journey.heure_depart.toString().split(':').length - 1
            ]
          )
        )
      )

      const heure_arrivee = new Date(
        new Date(journey.date).setHours(
          parseInt(journey.heure_arrivee.toString().split(':')[0]),
          parseInt(
            journey.heure_arrivee.toString().split(':')[
              journey.heure_arrivee.toString().split(':').length - 1
            ]
          )
        )
      )

      if (heure_depart > heure_arrivee) {
        heure_arrivee.setDate(heure_arrivee.getDate() + 1)
      }

      return {
        ...journey,
        heure_depart: heure_depart,
        heure_arrivee: heure_arrivee,
        internal_id,
      }
    })
  )

  return NextResponse.json({ data: journeys.length }, { status: 200 })
}
