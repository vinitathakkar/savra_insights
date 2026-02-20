const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
    })
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('DB Connection Failed:', error.message)
    setTimeout(connectDB, 5000) 
  }
}

module.exports = connectDB
