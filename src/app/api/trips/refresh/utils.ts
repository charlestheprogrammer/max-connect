import { mongo } from 'mongoose'
import { canGoFromTo } from '@/app/api/journeys/utils'
import HighlightTrip from '@/app/api/models/highlight-trip'
import Journey from '@/app/api/models/journey'

let journeys: Journey[] = []

export const setJourneys = (newJourneys: Journey[]) => {
  journeys = newJourneys
}

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

export function refreshSingleTrip(
  from: string,
  to: string,
  fromAtMidnight: Date,
  fromDate: Date,
  toDate: Date
) {
  return new Promise<mongo.ObjectId | null>((resolve) => {
    canGoFromTo(from, to, fromDate, fromAtMidnight, fetchFromTrainStation).then(
      (result_from) => {
        if (result_from.canGo) {
          canGoFromTo(to, from, toDate, toDate, fetchFromTrainStation).then(
            async (result_to) => {
              if (result_to.canGo) {
                const highlightTripData = {
                  origine: from,
                  destination: to,
                  from: fromDate,
                  to: toDate,
                  origine_iata:
                    result_from.posibilities![0].history[0].origine_iata,
                  destination_iata:
                    result_from.posibilities!.at(-1)!.destination_iata,
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
                } as HighlightTrip

                const existingTrip = await HighlightTrip.findOne({
                  origine: from,
                  destination: to,
                  from: fromDate,
                  to: toDate,
                })

                let tripId: mongo.ObjectId | null = null

                if (existingTrip) {
                  tripId = (
                    await HighlightTrip.findByIdAndUpdate(
                      existingTrip._id,
                      highlightTripData
                    ).exec()
                  )._id
                } else {
                  tripId = (await HighlightTrip.insertOne(highlightTripData))
                    ._id
                }
                resolve(tripId)
              } else {
                resolve(null)
              }
            }
          )
        } else {
          resolve(null)
        }
      }
    )
  })
}
