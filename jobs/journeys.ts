import mongoose from 'mongoose'

const journeySchema = new mongoose.Schema({
  train_no: String,
  origine: { type: String, index: true },
  destination: { type: String, index: true },
  destination_iata: { type: String, index: true },
  origine_iata: { type: String, index: true },
  date: Date,
  heure_depart: Date,
  heure_arrivee: Date,
})

type Journey = {
  train_no: string
  origine: string
  destination: string
  destination_iata: string
  origine_iata: string
  date: Date
  heure_depart: Date
  heure_arrivee: Date
}

const Journey =
  mongoose.models.Journey || mongoose.model('Journey', journeySchema)

export default Journey

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  return mongoose.connect(process.env.MONGODB_URI!, {
    dbName: process.env.MONGODB_DB,
  })
}

export const maxDuration = 60

type TempJourney = {
  train_no: string
  origine: string
  destination: string
  destination_iata: string
  origine_iata: string
  date: Date
  heure_depart: string
  heure_arrivee: string
  od_happy_card: string
}

Deno.cron('Update journeys', '0 5 * * *', async () => {
  await connect()

  const journeysResponse = await fetch(
    'https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/tgvmax/exports/json?lang=fr&timezone=Europe%2FBerlin'
  )

  const journeys = (await journeysResponse.json()).filter(
    (journey: TempJourney) => journey.od_happy_card === 'OUI'
  )

  await Journey.deleteMany({})

  await Journey.insertMany(
    journeys.map((journey: TempJourney) => {
      const heure_depart = new Date(
        new Date(journey.date).setHours(
          parseInt(journey.heure_depart.toString().split(':')[0]),
          parseInt(
            journey.heure_depart.toString().split(':')[
              journey.heure_depart.toString().split(':').length - 1
            ]
          )
        )
      )

      const heure_arrivee = new Date(
        new Date(journey.date).setHours(
          parseInt(journey.heure_arrivee.toString().split(':')[0]),
          parseInt(
            journey.heure_arrivee.toString().split(':')[
              journey.heure_arrivee.toString().split(':').length - 1
            ]
          )
        )
      )

      if (heure_depart > heure_arrivee) {
        heure_arrivee.setDate(heure_arrivee.getDate() + 1)
      }

      return {
        ...journey,
        heure_depart: heure_depart,
        heure_arrivee: heure_arrivee,
      }
    })
  )
})
