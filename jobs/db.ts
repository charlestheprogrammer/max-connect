import mongoose from 'mongoose'

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return
  }

  // @ts-ignore
  return mongoose.connect(Deno.env.get("MONGODB_URI")!, {
    // @ts-ignore
    dbName: Deno.env.get("MONGODB_DB"),
  })
}
