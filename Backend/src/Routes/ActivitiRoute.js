const express = require('express')
const router = express.Router()
const Activity = require('../Model/Activity')

router.post('/', async (req, res) => {
  try {
    const { teacherId, activityType, subject, className, createdAt } = req.body

    const activity = await Activity.create({
      teacherId,
      activityType,
      subject,
      class: className,
      createdAt
    })

    res.status(201).json(activity)
  } catch (error) {
    console.error(error)

    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate activity detected" })
    }

    res.status(500).json({ message: 'Failed to create activity' })
  }
})

module.exports = router