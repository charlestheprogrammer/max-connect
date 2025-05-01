import { auth } from '@/auth'
import { connect } from '@/utils/server/mongoose'
import { NextResponse } from 'next/server'
import Alert from '../models/alert'

export async function GET() {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'You must be logged in.' },
      { status: 401 }
    )
  }

  await connect()

  const alerts = await Alert.find({ user: session.user._id })
    .sort({ date: 1 })
    .exec()

  return NextResponse.json(alerts, {
    status: 200,
  })
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'You must be logged in.' },
      { status: 401 }
    )
  }

  const { origine, destination, date } = await request.json()
  await connect()

  const alert = await Alert.create({
    origine,
    destination,
    date,
    user: session.user._id,
  })

  return NextResponse.json(alert, {
    status: 201,
  })
}

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'You must be logged in.' },
      { status: 401 }
    )
  }

  const { id } = await request.json()
  await connect()

  const alert = await Alert.findOneAndDelete({
    _id: id,
    user: session.user._id,
  })

  if (!alert) {
    return NextResponse.json({ message: 'Alert not found.' }, { status: 404 })
  }

  return NextResponse.json(alert, {
    status: 200,
  })
}
