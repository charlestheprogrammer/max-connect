import { mongo } from 'mongoose'

type AvailableJourney = {
  train_no: string
  origine: string
  destination: string
  destination_iata: string
  origine_iata: string
  date: Date
  heure_depart: Date
  heure_arrivee: Date
  od_happy_card: string
  _id: mongo.ObjectId
}

import Journey from '../models/journey'

const fetchFromTrainStation = async (
  iata: string,
  date: Date,
  start = new Date()
) => {
  return (
    Journey.find({
      $or: [{ origine_iata: iata }, { origine: iata }],
      date: {
        $gte: new Date(date),
        $lt: new Date(date).setHours(23, 59, 59, 999),
      },
      heure_depart: {
        $gte: start,
      },
    })
      .select(
        'train_no origine destination destination_iata origine_iata date heure_depart heure_arrivee _id'
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .lean() as Promise<any[]>
  )
}

const destinationsFrom = async (
  date: Date,
  start: Date,
  iata: string,
  fetcher = fetchFromTrainStation,
  depth = 0,
  seen = new Map(),
  history: AvailableJourney[] = []
) => {
  if (history.length > 3) {
    return []
  }

  seen.set(iata, history.length - 1)

  const data = (await fetcher(iata, date, start)) as AvailableJourney[]
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

function onlyUnique(
  value: {
    destination_iata: string
    heure_arrivee: Date
    depth: number
    history: AvailableJourney[]
  },
  index: number,
  array: {
    destination_iata: string
    heure_arrivee: Date
    depth: number
    history: AvailableJourney[]
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

export const canGoFromTo = async (
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
