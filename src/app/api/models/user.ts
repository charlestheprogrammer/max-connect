import mongoose from 'mongoose'

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },
  preferences: {
    favoriteOrigine: { type: String },
    weekendStartingDay: { type: Number },
    weekendEndingDay: { type: Number },
  },
})

type User = {
  _id?: string
  name: string
  email: {
    type: string
    required: true
    unique: true
  }
  profilePicture?: string
  preferences?: {
    favoriteOrigine?: string
    weekendStartingDay?: number
    weekendEndingDay?: number
  }
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export { User }
