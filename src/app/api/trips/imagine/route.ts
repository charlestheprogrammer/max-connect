import { TripAgent } from '@/agents/trip-agent'
import { NextRequest, NextResponse } from 'next/server'
import SuggestedTrip from '../../models/suggested-trip'
import { connect } from '@/utils/server/mongoose'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  await connect()
  const body = await req.json()
  const tripAgent = new TripAgent()
  const suggestions = await tripAgent.suggestTrips(
    body.from,
    new Date(body.from_date),
    new Date(body.to_date),
    body.custom_request
  )
  if (!suggestions) {
    return NextResponse.json([], {
      status: 200,
    })
  }

  return NextResponse.json(
    await SuggestedTrip.insertMany(
      suggestions.filter((suggestion) => suggestion.canGo)
    ),
    {
      status: 200,
    }
  )
}
