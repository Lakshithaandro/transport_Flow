import mongoose from 'mongoose'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')

export async function connectDb() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required')
  }

  mongoose.set('strictQuery', true)
  console.log('Connecting to MongoDB...', process.env.MONGODB_URI)
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')
}