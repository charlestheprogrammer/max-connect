import { NextResponse } from 'next/server'
import HighlightTrip from '../../models/highlight-hourney'
import { connect } from '@/utils/server/mongoose'
import { mongo } from 'mongoose'
import { canGoFromTo } from '../../journeys/utils'

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

export async function GET() {
  await connect()
  const trips = []
  for (const destination of interestingDestinations) {
    for (const parisStation of parisStations) {
      trips.push(
        new Promise((resolve) => {
          canGoFromTo(parisStation, destination, new Date()).then((result) => {
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
