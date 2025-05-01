import mongoose from 'mongoose'

// TrainStation schema
const trainStationSchema = new mongoose.Schema({
  iata: { type: String, required: true, unique: true },
  name: { type: String, required: true },
})

type TrainStation = {
  _id?: string
  iata: string
  name: string
}

const TrainStation =
  mongoose.models.TrainStation ||
  mongoose.model('TrainStation', trainStationSchema)

export { TrainStation }
