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
  _id: mongoose.Types.ObjectId
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
