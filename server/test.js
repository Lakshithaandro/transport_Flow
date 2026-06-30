import dotenv from 'dotenv'
import mongoose from 'mongoose'
import dns from 'dns'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dns.setDefaultResultOrder('ipv4first')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

console.log('Testing MongoDB connection...')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌', err)
    process.exit(1)
  })