import { connect } from '@/utils/server/mongoose'
import { NextResponse } from 'next/server'
import HighlightTrip from '../models/highlight-hourney'

export async function GET() {
  await connect()
  return NextResponse.json(
    await HighlightTrip.find({}),
    {
      status: 200,
    }
  )
}
