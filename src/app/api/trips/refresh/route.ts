import { NextResponse } from 'next/server'
import HighlightTrip from '../../models/highlight-hourney'
import { connect } from '@/utils/server/mongoose'
import { mongo } from 'mongoose'
import { canGoFromTo } from '../../journeys/utils'
import Journey from '../../models/journey'

export const maxDuration = 60

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

const parisStations = ['PARIS (intramuros)']

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
      (journey.origine_iata === iata || journey.origine === iata) &&
      journey.date >= date &&
      journey.date < dateJustBeforeMidnight &&
      journey.heure_depart >= start
  )
  return res
}

const getNextWeekendRange = () => {
  const today = new Date()
  const day = today.getDay()
  let diff = 5 - day
  if (diff < 0) {
    diff += 7
  }

  const nextFriday = new Date(today)
  nextFriday.setDate(today.getDate() + diff)
  nextFriday.setHours(0, 0, 0, 0)
  const nextSunday = new Date(nextFriday)
  nextSunday.setDate(nextFriday.getDate() + 2)
  nextSunday.setHours(23, 59, 59, 999)
  return { from: nextFriday, to: nextSunday }
}

export async function GET() {
  await connect()
  const trips = []
  journeys.push(...(await Journey.find({})))
  const { from, to } = getNextWeekendRange()
  const fromAtMidnight = new Date(from)
  fromAtMidnight.setHours(0, 0)
  for (const destination of interestingDestinations) {
    for (const parisStation of parisStations) {
      trips.push(
        new Promise<mongo.ObjectId | null>((resolve) => {
          canGoFromTo(
            parisStation,
            destination,
            from,
            fromAtMidnight,
            fetchFromTrainStation
          ).then((result_from) => {
            if (result_from.canGo) {
              canGoFromTo(
                destination,
                parisStation,
                to,
                to,
                fetchFromTrainStation
              ).then(async (result_to) => {
                if (result_to.canGo) {
                  const highlightTripData = {
                    origine: parisStation,
                    destination,
                    from,
                    to,
                    origine_iata:
                      result_from.posibilities![0].history[0].origine_iata,
                    destination_iata: destination,
                    results_to:
                      result_to.posibilities?.map((record) =>
                        record.history.map(
                          (journey) => new mongo.ObjectId(journey._id)
                        )
                      ) || [],
                    results_from:
                      result_from.posibilities?.map((record) =>
                        record.history.map(
                          (journey) => new mongo.ObjectId(journey._id)
                        )
                      ) || [],
                  }

                  const existingTrip = await HighlightTrip.findOne({
                    origine: parisStation,
                    destination,
                    from,
                    to,
                  })

                  let tripId: mongo.ObjectId | null = null

                  if (existingTrip) {
                    tripId = (await HighlightTrip.findByIdAndUpdate(
                      existingTrip._id,
                      highlightTripData
                    ).exec())._id
                  } else {
                    await HighlightTrip.insertOne(highlightTripData)
                  }
                  resolve(tripId)
                } else {
                  resolve(null)
                }
              })
            } else {
              resolve(null)
            }
          })
        })
      )
    }
  }
  const results = await Promise.all(trips)
  await HighlightTrip.deleteMany({
    _id: { $nin: results.filter((result) => result !== null) },
  })
  return NextResponse.json(trips, { status: 200 })
}
