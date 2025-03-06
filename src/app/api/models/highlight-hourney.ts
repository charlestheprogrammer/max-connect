import { AvailableJourney } from '@/components/book/journeys'
import mongoose from 'mongoose'

const highlightTripSchema = new mongoose.Schema({
  origine: String,
  destination: String,
  from: Date,
  to: Date,
  destination_iata: { type: String, index: true },
  origine_iata: { type: String, index: true },
  trips: [
    [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journey',
      },
    ],
  ],
})

type HighlightTrip = {
  origine: string
  destination: string
  from: Date
  to: Date
  destination_iata: string
  origine_iata: string
  trips: mongoose.Types.ObjectId[][] | AvailableJourney[][]

  toObject?: () => HighlightTrip
}

const HighlightTrip =
  mongoose.models.HighlightTrip ||
  mongoose.model('HighlightTrip', highlightTripSchema)

export default HighlightTrip
