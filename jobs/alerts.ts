// @ts-ignore
import { connect } from './db.ts'
// @ts-ignore
import Alert from './models/alert.ts'
// @ts-ignore
import User from './models/user.ts'
// @ts-ignore
import Mailjet from 'node-mailjet'
import { canGoFromTo } from './trips.js'
import mongoose from 'mongoose'
import { TrainStation } from './models/train-station.js'

const handleAlerts = async () => {
  await connect()
  await User.init()
  const alerts: {
    user: User
    alerts: (Alert & {
      canGo?: boolean
    })[]
  }[] = await Alert.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $group: {
        _id: '$user._id',
        user: { $first: '$user' },
        alerts: { $push: '$$ROOT' },
      },
    },
  ])

  const trainStations: TrainStation[] = await TrainStation.find({}).exec()

  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY || '',
    process.env.MAILJET_SECRET_KEY || ''
  )

  const promises = []
  const messages: any[] = []
  const alertsToDelete: mongoose.Types.ObjectId[] = []

  for (const user_alerts of alerts) {
    for (const alert of user_alerts.alerts) {
      promises.push(
        canGoFromTo(alert.origine, alert.destination, alert.date).then(
          (result) => {
            alert.canGo = result.canGo

            if (result.canGo) {
              const firstStart = new Date(
                result.posibilities![0].history.at(0)!.heure_depart
              )
              const connections = result.min_depth!
              messages.push({
                From: {
                  Email: 'maxconnect_sncf@icloud.com',
                  Name: 'MAX Connect',
                },
                To: [
                  {
                    Email: user_alerts.user.email,
                    Name: user_alerts.user.name,
                  },
                ],
                TemplateID: 6944292,
                TemplateLanguage: true,
                Subject: 'Votre voyage pour {{var:tripDestination}}',
                Variables: {
                  tripDestination:
                    trainStations?.find((v) => v.iata === alert.destination)
                      ?.name || alert.destination,
                  tripDate: alert.date.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }),
                  tripTime: firstStart.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  tripConnections:
                    connections > 0
                      ? `${connections} correspondance${
                          connections > 1 ? 's' : ''
                        }`
                      : 'un trajet direct',
                  tripLink: `https://max-connect.vercel.app/book?fromDate=${
                    alert.date.toISOString().split('T')[0]
                  }&from=${alert.origine}&to=${alert.destination}`,
                },
              })
              alertsToDelete.push(alert._id)
            }
          }
        )
      )
    }
  }

  await Promise.all(promises)

  // Delete alerts with date in the past
  const now = new Date()
  await Alert.deleteMany({
    $or: [{ date: { $lt: now } }, { _id: { $in: alertsToDelete } }],
  })

  const request = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: messages,
  })
  request
    .then((result) => {
      console.log(result.body)
    })
    .catch((err) => {
      console.log(err.statusCode)
    })
}

module.exports.handle = handleAlerts
