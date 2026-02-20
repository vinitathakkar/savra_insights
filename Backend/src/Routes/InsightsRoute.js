const express = require('express')
const router = express.Router()
const insightsController = require('../Controller/InsightsController.js')
const Teacher = require('../Model/Teacher')

router.get('/stats', insightsController.getStats)
router.get('/overview', insightsController.getOverview)
router.get('/weekly', insightsController.getWeeklyTrend)
router.get('/ai-summary', insightsController.getAISummary)
router.get('/teacher/:id', insightsController.getTeacherDetail)
router.get('/filters', insightsController.getFilters)

// ── Seed route
router.get('/seed', async (req, res) => {
  const Teacher = require('../Model/Teacher')
  const Activity = require('../Model/Activity')

  try {
    await Teacher.deleteMany()
    await Activity.deleteMany()

    // Map activity_type labels from dataset → our enum
    const typeMap = {
      'lesson plan': 'lesson',
      'quiz': 'quiz',
      'assessment': 'assessment',
      'question paper': 'assessment'
    }

    const teacherDefs = [
      { tid: 'T001', name: 'Anita Sharma', subjects: ['Mathematics'], grades: ['7', '8'] },
      { tid: 'T002', name: 'Rahul Verma', subjects: ['Science'], grades: ['8', '9'] },
      { tid: 'T003', name: 'Pooja Mehta', subjects: ['English'], grades: ['6', '7'] },
      { tid: 'T004', name: 'Vikas Nair', subjects: ['Social Studies'], grades: ['9', '10'] },
      { tid: 'T005', name: 'Neha Kapoor', subjects: ['Mathematics'], grades: ['9', '10'] }
    ]

    const teachers = await Teacher.insertMany(
      teacherDefs.map(t => ({ name: t.name, subjects: t.subjects, grades: t.grades }))
    )

    // Map tid → ObjectId
    const tidMap = {}
    teacherDefs.forEach((def, i) => { tidMap[def.tid] = teachers[i]._id })

    const raw = [
      { tid: 'T004', type: 'Quiz', subject: 'Social Studies', grade: '10', at: '2026-02-12T19:07:41' },
      { tid: 'T003', type: 'Question Paper', subject: 'English', grade: '7', at: '2026-02-13T15:31:51' },
      { tid: 'T004', type: 'Lesson Plan', subject: 'Social Studies', grade: '10', at: '2026-02-11T19:15:55' },
      { tid: 'T001', type: 'Lesson Plan', subject: 'Mathematics', grade: '7', at: '2026-02-17T20:35:33' },
      { tid: 'T004', type: 'Question Paper', subject: 'Social Studies', grade: '9', at: '2026-02-15T16:51:32' },
      { tid: 'T003', type: 'Quiz', subject: 'English', grade: '6', at: '2026-02-14T15:22:29' },
      { tid: 'T005', type: 'Quiz', subject: 'Mathematics', grade: '10', at: '2026-02-12T12:26:22' },
      { tid: 'T002', type: 'Quiz', subject: 'Science', grade: '9', at: '2026-02-17T09:21:32' },
      { tid: 'T002', type: 'Question Paper', subject: 'Science', grade: '9', at: '2026-02-12T11:38:24' },
      { tid: 'T003', type: 'Question Paper', subject: 'English', grade: '6', at: '2026-02-17T19:07:47' },
      { tid: 'T005', type: 'Lesson Plan', subject: 'Mathematics', grade: '10', at: '2026-02-11T17:53:57' },
      { tid: 'T001', type: 'Question Paper', subject: 'Mathematics', grade: '8', at: '2026-02-16T11:26:52' },
      { tid: 'T003', type: 'Lesson Plan', subject: 'English', grade: '7', at: '2026-02-16T15:41:50' },
      { tid: 'T005', type: 'Question Paper', subject: 'Mathematics', grade: '10', at: '2026-02-11T17:54:16' },
      { tid: 'T001', type: 'Lesson Plan', subject: 'Mathematics', grade: '8', at: '2026-02-17T19:19:56' },
      { tid: 'T004', type: 'Quiz', subject: 'Social Studies', grade: '9', at: '2026-02-16T19:12:33' },
      { tid: 'T001', type: 'Question Paper', subject: 'Mathematics', grade: '8', at: '2026-02-13T09:16:06' },
      { tid: 'T003', type: 'Quiz', subject: 'English', grade: '6', at: '2026-02-15T11:36:03' },
      { tid: 'T004', type: 'Lesson Plan', subject: 'Social Studies', grade: '9', at: '2026-02-11T13:06:29' },
      { tid: 'T005', type: 'Quiz', subject: 'Mathematics', grade: '10', at: '2026-02-15T13:31:42' },
      { tid: 'T001', type: 'Question Paper', subject: 'Mathematics', grade: '8', at: '2026-02-16T11:44:31' },
      { tid: 'T001', type: 'Lesson Plan', subject: 'Mathematics', grade: '8', at: '2026-02-18T18:45:43' },
      { tid: 'T005', type: 'Question Paper', subject: 'Mathematics', grade: '10', at: '2026-02-12T19:19:44' },
      { tid: 'T002', type: 'Quiz', subject: 'Science', grade: '8', at: '2026-02-14T13:57:07' },
      { tid: 'T002', type: 'Question Paper', subject: 'Science', grade: '8', at: '2026-02-12T18:01:59' },
      { tid: 'T001', type: 'Question Paper', subject: 'Mathematics', grade: '7', at: '2026-02-14T10:36:09' },
      { tid: 'T001', type: 'Lesson Plan', subject: 'Mathematics', grade: '8', at: '2026-02-18T16:32:47' },
      { tid: 'T004', type: 'Quiz', subject: 'Social Studies', grade: '10', at: '2026-02-15T15:59:00' },
      { tid: 'T002', type: 'Lesson Plan', subject: 'Science', grade: '8', at: '2026-02-15T13:31:36' },
      { tid: 'T004', type: 'Lesson Plan', subject: 'Social Studies', grade: '9', at: '2026-02-15T16:32:23' },
      { tid: 'T003', type: 'Question Paper', subject: 'English', grade: '6', at: '2026-02-18T09:12:05' },
      { tid: 'T005', type: 'Lesson Plan', subject: 'Mathematics', grade: '9', at: '2026-02-18T16:26:04' },
      { tid: 'T005', type: 'Lesson Plan', subject: 'Mathematics', grade: '9', at: '2026-02-16T17:14:47' },
      { tid: 'T003', type: 'Question Paper', subject: 'English', grade: '6', at: '2026-02-12T17:47:58' },
      { tid: 'T005', type: 'Quiz', subject: 'Mathematics', grade: '10', at: '2026-02-18T14:05:20' },
      { tid: 'T002', type: 'Quiz', subject: 'Science', grade: '8', at: '2026-02-14T09:54:01' },
      { tid: 'T002', type: 'Lesson Plan', subject: 'Science', grade: '9', at: '2026-02-12T18:27:09' },
      { tid: 'T001', type: 'Quiz', subject: 'Mathematics', grade: '8', at: '2026-02-14T15:43:38' },
      { tid: 'T002', type: 'Lesson Plan', subject: 'Science', grade: '8', at: '2026-02-18T15:48:08' },
      { tid: 'T002', type: 'Lesson Plan', subject: 'Science', grade: '9', at: '2026-02-16T13:31:34' },
      { tid: 'T003', type: 'Lesson Plan', subject: 'English', grade: '6', at: '2026-02-14T19:49:54' },
      { tid: 'T005', type: 'Quiz', subject: 'Mathematics', grade: '10', at: '2026-02-14T11:55:18' },
      { tid: 'T003', type: 'Lesson Plan', subject: 'English', grade: '6', at: '2026-02-16T15:33:27' },
      { tid: 'T005', type: 'Lesson Plan', subject: 'Mathematics', grade: '9', at: '2026-02-18T11:51:37' }
    ]

    // Deduplicate by unique key before inserting (handles duplicate entries gracefully)
    const seen = new Set()
    const activities = []
    for (const r of raw) {
      const activityType = typeMap[r.type.toLowerCase()]
      if (!activityType) continue
      const key = `${r.tid}|${activityType}|${r.subject}|${r.grade}|${r.at}`
      if (seen.has(key)) continue
      seen.add(key)
      activities.push({
        teacherId: tidMap[r.tid],
        activityType,
        subject: r.subject,
        class: r.grade,
        createdAt: new Date(r.at)
      })
    }

    await Activity.insertMany(activities, { ordered: false })

    res.json({ message: `Seeded ${teachers.length} teachers and ${activities.length} activities` })
  } catch (error) {
    console.error(error)
    // Handle duplicate key errors gracefully
    if (error.code === 11000 || error.writeErrors) {
      return res.json({ message: 'Seeded with some duplicates skipped gracefully' })
    }
    res.status(500).json({ message: 'Seeding failed', error: error.message })
  }
})

module.exports = router
