import dotenv from 'dotenv'
import mongoose from 'mongoose'
import dns from 'dns'

dns.setDefaultResultOrder('ipv4first')
dotenv.config()

console.log(process.env.MONGODB_URI)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌', err)
    process.exit(1)
  })