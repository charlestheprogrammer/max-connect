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
}

import { NextRequest, NextResponse } from 'next/server'
import Journey from '../models/journey'
import { connect } from '@/utils/server/mongoose'

const fetchFromTrainStation = async (
  iata: string,
  date: Date,
  start = new Date()
) => {
  return Journey.find({
    origine_iata: iata,
    date: {
      $gte: new Date(date),
      $lt: new Date(date).setDate(new Date(date).getDate() + 1),
    },
    heure_depart: {
      $gte: start,
    },
  })
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

  const data = await fetcher(iata, date, start)
  const results = data
    .filter((record) => record?.destination_iata)
    .map((record) => {
      return {
        destination_iata: record.destination_iata,
        heure_arrivee: record.heure_arrivee,
        depth: history.length,
        history: [...history, record],
      }
    })

  if (depth < 3) {
    for (const record of results) {
      if (
        !seen.has(record.destination_iata) ||
        depth + 1 < seen.get(record.destination_iata)
      ) {
        results.push(
          ...(await destinationsFrom(
            date,
            record.heure_arrivee,
            record.destination_iata,
            fetcher,
            history.length,
            seen,
            record.history
          ))
        )
      }
    }
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
  return array.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
}

const canGoFromTo = async (
  from: string,
  to: string,
  date: Date,
  start = new Date()
) => {
  const destinations = await destinationsFrom(date, start, from)

  const results = destinations
    .filter((destination) => destination.destination_iata === to)
    .filter(onlyUnique)
    .sort((a, b) => {
      if (a.depth === b.depth) {
        return (
          a.history[0].heure_depart.getTime() -
          b.history[0].heure_depart.getTime()
        )
      }
      return a.depth - b.depth
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

async function handler(req: NextRequest) {
  const url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`)
  await connect()

  const { from, to, date } = {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    date: url.searchParams.get('date'),
  }
  if (
    typeof date !== 'string' ||
    typeof from !== 'string' ||
    typeof to !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Invalid query' },
      {
        status: 400,
      }
    )
  }

  const result = await canGoFromTo(from, to, new Date(date))
  return NextResponse.json(result, {
    status: 200,
  })
}

export { handler as GET }
