const express = require('express')
const cors = require('cors')
const insightsRoutes = require('./Routes/InsightsRoute')
const teacherRoutes = require('./Routes/TeacherRoute')
const activityRoutes = require('./Routes/ActivitiRoute')

const app = express()

app.use(cors())
app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Savra Teacher Insights API',
    status: 'Running',
    endpoints: {
      insights: '/api/insights',
      teachers: '/api/teachers',
      activities: '/api/activities'
    }
  })
})

app.use('/api/insights', insightsRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/activities', activityRoutes)

module.exports = app