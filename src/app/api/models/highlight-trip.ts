import { AvailableJourney } from '@/components/book/journeys'
import mongoose from 'mongoose'

const highlightTripSchema = new mongoose.Schema({
  origine: String,
  destination: String,
  from: Date,
  to: Date,
  destination_iata: { type: String, index: true },
  origine_iata: { type: String, index: true },
  results_to: [
    [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journey',
      },
    ],
  ],
  results_from: [
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
  results_to: mongoose.Types.ObjectId[][] | AvailableJourney[][]
  results_from: mongoose.Types.ObjectId[][] | AvailableJourney[][]

  toObject?: () => HighlightTrip
}

const HighlightTrip =
  mongoose.models.HighlightTrip ||
  mongoose.model('HighlightTrip', highlightTripSchema)

export default HighlightTrip
