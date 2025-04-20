import { auth } from '@/auth'
import { connect } from '@/utils/server/mongoose'
import { NextResponse } from 'next/server'
import { User } from '../models/user'

export async function GET() {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'You must be logged in.' },
      { status: 401 }
    )
  }

  await connect()

  const user = await User.findOne({ email: session.user.email }).exec()

  return NextResponse.json(user, {
    status: 200,
  })
}
