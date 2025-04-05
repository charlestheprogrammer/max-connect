import { NextResponse } from 'next/server'
import HighlightTrip from '@/app/api/models/highlight-trip'
import { connect } from '@/utils/server/mongoose'
import Journey from '@/app/api/models/journey'
import { refreshSingleTrip, setJourneys } from './utils'

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
  return NextResponse.json(trips, { status: 200 })
}
