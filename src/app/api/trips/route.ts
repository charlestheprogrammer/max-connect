import { connect } from '@/utils/server/mongoose'
import { NextResponse } from 'next/server'
import HighlightTrip from '@/app/api/models/highlight-trip'

export async function GET() {
  await connect()
  return NextResponse.json(
    await HighlightTrip.find({}),
    {
      status: 200,
    }
  )
}
