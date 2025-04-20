import { auth } from '@/auth'
import { connect } from '@/utils/server/mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { User } from '../../models/user'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  const body = await req.json()

  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'You must be logged in.' },
      { status: 401 }
    )
  }

  await connect()

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      preferences: {
        favoriteOrigine: body.favoriteOrigin,
        weekendStartingDay: body.weekendStart,
        weekendEndingDay: body.weekendEnd,
      },
    }
  ).exec()

  return NextResponse.json(user, {
    status: 200,
  })
}
