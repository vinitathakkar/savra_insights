const express = require('express')
const cors = require('cors')
const insightsRoutes = require('./Routes/InsightsRoute')
const teacherRoutes = require('./Routes/TeacherRoute')
const activityRoutes = require('./Routes/ActivitiRoute')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/insights', insightsRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/activities', activityRoutes)

module.exports = app