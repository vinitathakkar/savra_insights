const insightsService = require('../Services/InsightsService')

exports.getOverview = async (req, res) => {
  try {
    const { period = 'week', grade, subject } = req.query
    const data = await insightsService.fetchOverview(period, grade, subject)
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getStats = async (req, res) => {
  try {
    const { period = 'week', grade, subject } = req.query
    const data = await insightsService.fetchStats(period, grade, subject)
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getWeeklyTrend = async (req, res) => {
  try {
    const { grade, subject } = req.query
    const data = await insightsService.fetchWeeklyTrend(grade, subject)
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getFilters = async (req, res) => {
  try {
    const data = await insightsService.fetchFilters()
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getTeacherDetail = async (req, res) => {
  try {
    const { period = 'week' } = req.query
    const data = await insightsService.fetchTeacherDetail(req.params.id, period)
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.getAISummary = async (req, res) => {
  try {
    const data = await insightsService.fetchAISummary()
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}