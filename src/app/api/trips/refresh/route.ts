import { NextResponse } from 'next/server'
import HighlightTrip from '../../models/highlight-hourney'
import { connect } from '@/utils/server/mongoose'
import { mongo } from 'mongoose'
import { canGoFromTo } from '../../journeys/utils'
import Journey from '../../models/journey'

const interestingDestinations = [
  'FRNIC',
  'FRLRH',
  'FRMSC',
  'FRBOJ',
  'FRXYT',
  'FRLLE',
  'FRRNS',
  'FRNTE',
  'FRADE',
  'LULUX',
  'FRAEG',
  'FRXGF',
]

const parisStations = ['FRPST', 'FRPNO', 'FRPLY', 'FRPMO']

const journeys: Journey[] = []

const fetchFromTrainStation = async (
  iata: string,
  date: Date,
  start = new Date()
) => {
  const dateJustBeforeMidnight = new Date(date)
  dateJustBeforeMidnight.setDate(date.getDate() + 1)

  const res = journeys.filter(
    (journey) =>
      journey.origine_iata === iata &&
      journey.date >= date &&
      journey.date < dateJustBeforeMidnight &&
      journey.heure_depart >= start
  )
  return res
}

export async function GET() {
  await connect()
  const trips = []
  journeys.push(...(await Journey.find({})))
  const todayAtMidnight = new Date()
  todayAtMidnight.setHours(0, 0)
  for (const destination of interestingDestinations) {
    for (const parisStation of parisStations) {
      trips.push(
        new Promise((resolve) => {
          canGoFromTo(
            parisStation,
            destination,
            new Date(),
            todayAtMidnight,
            fetchFromTrainStation
          ).then((result) => {
            if (result.canGo) {
              HighlightTrip.insertOne({
                origine: result.posibilities![0].history[0].origine,
                destination:
                  result.posibilities![0].history[
                    result.posibilities![0].history.length - 1
                  ].destination,
                from: new Date(),
                to: new Date().setDate(new Date().getDate() + 1),
                origine_iata: parisStation,
                destination_iata: destination,
                trips:
                  result.posibilities?.map((record) =>
                    record.history.map(
                      (journey) => new mongo.ObjectId(journey._id)
                    )
                  ) || [],
              }).then(() => {
                resolve(true)
              })
            } else {
              resolve(false)
            }
          })
        })
      )
    }
  }
  await Promise.all(trips)
  return NextResponse.json(trips, { status: 200 })
}
