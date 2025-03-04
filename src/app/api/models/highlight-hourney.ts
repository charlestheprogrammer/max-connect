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

const HighlightTrip =
  mongoose.models.HighlightTrip ||
  mongoose.model('HighlightTrip', highlightTripSchema)

export default HighlightTrip
