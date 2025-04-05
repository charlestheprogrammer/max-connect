// @ts-ignore
import { connect } from './db.ts'
// @ts-ignore
import Journey from './models/journey.ts'

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

export const updateJourneys = async () => {
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
        new Date(journey.date).toLocaleString('en-US', {
          timeZone: 'Europe/Paris',
        })
      )
      heure_depart.setHours(
        parseInt(journey.heure_depart.toString().split(':')[0]),
        parseInt(
          journey.heure_depart.toString().split(':')[
        journey.heure_depart.toString().split(':').length - 1
          ]
        )
      )

      const heure_arrivee = new Date(
        new Date(journey.date).toLocaleString('en-US', {
          timeZone: 'Europe/Paris',
        })
      )
      heure_arrivee.setHours(
        parseInt(journey.heure_arrivee.toString().split(':')[0]),
        parseInt(
          journey.heure_arrivee.toString().split(':')[
        journey.heure_arrivee.toString().split(':').length - 1
          ]
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
}
