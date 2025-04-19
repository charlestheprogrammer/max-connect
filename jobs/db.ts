import mongoose from 'mongoose'

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  // @ts-ignore
  return mongoose.connect(process.env.MONGODB_URI!, {
    // @ts-ignore
    dbName: process.env.MONGODB_DB,
  })
}
