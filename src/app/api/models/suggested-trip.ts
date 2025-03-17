import { AvailableJourney } from '@/components/book/journeys'
import mongoose from 'mongoose'

// Schema for a single journey segment
const journeySegmentSchema = new mongoose.Schema({
  origine: { type: String, required: true },
  destination: { type: String, required: true },
  train_no: { type: String, required: true },
  origine_iata: { type: String, required: true },
  destination_iata: { type: String, required: true },
  heure_depart: { type: Date, required: true },
  heure_arrivee: { type: Date, required: true },
})

// Main trip schema matching exactly the response structure
const tripSchema = new mongoose.Schema(
  {
    canGo: { type: Boolean, required: true },
    route_from: [[journeySegmentSchema]], // Array of arrays for multiple possible routes
    route_to: [[journeySegmentSchema]], // Array of arrays for multiple possible routes
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Create indexes for better query performance
tripSchema.index({ createdAt: -1 })

const SuggestedTrip =
  mongoose.models.SuggestedTrip || mongoose.model('SuggestedTrip', tripSchema)

export type SuggestedTrip = {
  canGo: boolean
  route_from: AvailableJourney[][]
  route_to: AvailableJourney[][]
  from: string
  to: string
  _id?: string
}

export default SuggestedTrip
