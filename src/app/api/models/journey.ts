import mongoose from 'mongoose'

const journeySchema = new mongoose.Schema({
  train_no: String,
  origine: String,
  destination: String,
  destination_iata: { type: String, index: true },
  origine_iata: { type: String, index: true },
  date: Date,
  heure_depart: Date,
  heure_arrivee: Date,
})

const Journey =
  mongoose.models.Journey || mongoose.model('Journey', journeySchema)

export default Journey
