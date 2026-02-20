const express = require('express')
const router = express.Router()
const Teacher = require('../Model/Teacher')

router.post('/', async (req, res) => {
  try {
    const { name, subjects, grades } = req.body

    const teacher = await Teacher.create({ name, subjects: subjects || [], grades: grades || [] })

    res.status(201).json(teacher)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create teacher' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { name, subjects, grades } = req.body
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, subjects, grades },
      { new: true }
    )
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' })
    res.json(teacher)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update teacher' })
  }
})

module.exports = router