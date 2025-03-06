import { connect } from '@/utils/server/mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { canGoFromTo } from './utils'

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
