import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  origine: { type: String, index: true },
  destination: { type: String, index: true },
  date: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

type Alert = {
  _id: mongoose.Types.ObjectId
  origine: string
  destination: string
  date: Date
  user: mongoose.Types.ObjectId
}

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema)

export default Alert
