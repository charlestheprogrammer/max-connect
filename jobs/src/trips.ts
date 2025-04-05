import { mongo } from 'mongoose'
import { connect } from './db'
import HighlightTrip from './models/highlight-trip'
import Journey from './models/journey'

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

function onlyUnique(
  value: {
    destination_iata: string
    heure_arrivee: Date
    depth: number
    history: Journey[]
  },
  index: number,
  array: {
    destination_iata: string
    heure_arrivee: Date
    depth: number
    history: Journey[]
  }[]
) {
  const trainsMapping = value.history.map((t) => t.train_no)
  const indexInArray = array.findIndex((t) => {
    const trainsMapping2 = t.history.map((t) => t.train_no)
    return JSON.stringify(trainsMapping) === JSON.stringify(trainsMapping2)
  })
  if (indexInArray !== -1 && indexInArray < index) {
    return false
  }
  // Check if destination is reached before the last journey in the history
  const lastJourney = value.history[value.history.length - 1]
  const destinationReachedEarlier = value.history.some((journey, idx) => {
    return (
      idx < value.history.length - 1 &&
      (journey.destination_iata === lastJourney.destination_iata ||
        journey.destination === lastJourney.destination)
    )
  })
  if (destinationReachedEarlier) {
    return false
  }
  return true
}

const destinationsFrom = async (
  date: Date,
  start: Date,
  iata: string,
  fetcher = fetchFromTrainStation,
  depth = 0,
  seen = new Map(),
  history: Journey[] = []
) => {
  if (history.length > 3) {
    return []
  }

  seen.set(iata, history.length - 1)

  const data = (await fetcher(iata, date, start)) as Journey[]
  const results = data
    .filter((record) => record?.destination_iata)
    .map((record) => {
      return {
        destination_iata: record.destination_iata,
        destination: record.destination,
        heure_arrivee: record.heure_arrivee,
        depth: history.length,
        history: [...history, record],
      }
    })

  if (depth < 3) {
    const recursivePromises = results.map(async (record) => {
      if (
        !seen.has(record.destination) ||
        depth + 1 < seen.get(record.destination)
      ) {
        return destinationsFrom(
          date,
          record.heure_arrivee,
          record.destination,
          fetcher,
          history.length,
          seen,
          record.history
        )
      }
      return []
    })

    // Process recursive calls in parallel
    const recursiveResults = await Promise.all(recursivePromises)
    results.push(...recursiveResults.flat())
  }

  return results
}

const canGoFromTo = async (
  from: string,
  to: string,
  date: Date,
  start = new Date(),
  fetcher = fetchFromTrainStation
) => {
  const destinations = await destinationsFrom(date, start, from, fetcher)

  const results = destinations
    .filter(
      (destination) =>
        destination.destination_iata === to || destination.destination === to
    )
    .filter(onlyUnique)
    .sort((a, b) => {
      // First compare number of connections
      const depthDiff = a.depth - b.depth
      if (depthDiff !== 0) return depthDiff

      // Then compare departure times
      const aDepartTime = a.history[0].heure_depart.getTime()
      const bDepartTime = b.history[0].heure_depart.getTime()
      const departDiff = aDepartTime - bDepartTime
      if (departDiff !== 0) return departDiff

      // If departure times are equal, prioritize shorter journeys
      const aDuration =
        a.history[a.history.length - 1].heure_arrivee.getTime() - aDepartTime
      const bDuration =
        b.history[b.history.length - 1].heure_arrivee.getTime() - bDepartTime
      return aDuration - bDuration
    })
  if (results.length > 0) {
    return {
      canGo: true,
      min_depth: results[0].history.length - 1,
      posibilities: results,
    }
  }
  return {
    canGo: false,
  }
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

export const refreshTrips = async () => {
  await connect()
  const trips = []
  setJourneys(await Journey.find({}))
  const { from, to } = getNextWeekendRange()
  const fromAtMidnight = new Date(from)
  fromAtMidnight.setHours(0, 0)
  for (const destination of interestingDestinations) {
    for (const parisStation of parisStations) {
      trips.push(
        refreshSingleTrip(parisStation, destination, fromAtMidnight, from, to)
      )
    }
  }
  const results = await Promise.all(trips)
  await HighlightTrip.deleteMany({
    _id: { $nin: results.filter((result) => result !== null) },
  })
}

let journeys: Journey[] = []

const setJourneys = (newJourneys: Journey[]) => {
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

function refreshSingleTrip(
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
