require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/Config/db')

connectDB()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})