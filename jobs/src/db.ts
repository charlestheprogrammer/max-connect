import mongoose from 'mongoose'

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  return mongoose.connect(process.env.MONGODB_URI!, {
    dbName: process.env.MONGODB_DB,
  })
}
