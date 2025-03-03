import { connect } from '@/utils/server/mongoose'
import Journey from '../models/journey'
import { NextResponse } from 'next/server'

export const maxDuration = 60;

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
    journeys.map((journey: TempJourney) => ({
      ...journey,
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
  )

  return NextResponse.json({ data: journeys.length }, { status: 200 })
}
