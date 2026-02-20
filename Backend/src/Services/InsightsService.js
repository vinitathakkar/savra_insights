const Activity = require('../Model/Activity')
const Teacher = require('../Model/Teacher')

// ── Overview: total lessons/quizzes/assessments per teacher ──────────────────
exports.fetchOverview = async (period = 'week', grade, subject) => {
  const dateFilter = buildDateFilter(period)
  const extraFilter = {}
  if (grade) extraFilter.class = grade
  if (subject) extraFilter.subject = subject

  const aggregation = await Activity.aggregate([
    { $match: { ...dateFilter, ...extraFilter } },
    {
      $group: {
        _id: { teacherId: '$teacherId', activityType: '$activityType' },
        count: { $sum: 1 }
      }
    }
  ])

  const teachers = await Teacher.find().lean()

  const formatted = teachers.map(teacher => {
    const teacherData = aggregation.filter(
      a => a._id.teacherId.toString() === teacher._id.toString()
    )
    return {
      teacherId: teacher._id,
      teacherName: teacher.name,
      subjects: teacher.subjects || [],
      grades: teacher.grades || [],
      lessons: teacherData.find(t => t._id.activityType === 'lesson')?.count || 0,
      quizzes: teacherData.find(t => t._id.activityType === 'quiz')?.count || 0,
      assessments: teacherData.find(t => t._id.activityType === 'assessment')?.count || 0
    }
  })

  return formatted
}

// ── Weekly activity trend (daily counts for last 7 days) ─────────────────────
exports.fetchWeeklyTrend = async (grade, subject) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  const extraFilter = {}
  if (grade) extraFilter.class = grade
  if (subject) extraFilter.subject = subject

  const result = await Activity.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, ...extraFilter } },
    {
      $group: {
        _id: {
          day: { $dayOfWeek: '$createdAt' },
          type: '$activityType'
        },
        count: { $sum: 1 }
      }
    }
  ])

  // Build a map: dayIndex(0-6 Mon-Sun) -> { lesson, quiz, assessment }
  const map = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    map[d.getDay()] = { day: days[d.getDay()], lesson: 0, quiz: 0, assessment: 0 }
  }

  result.forEach(r => {
    // MongoDB $dayOfWeek: 1=Sun,2=Mon,...,7=Sat => convert to JS 0=Sun
    const jsDay = r._id.day - 1
    if (map[jsDay]) map[jsDay][r._id.type] = r.count
  })

  return Object.values(map)
}

// ── Per-teacher detail ────────────────────────────────────────────────────────
exports.fetchTeacherDetail = async (teacherId, period = 'week') => {
  const dateFilter = buildDateFilter(period)
  const match = { teacherId: require('mongoose').Types.ObjectId.createFromHexString(teacherId), ...dateFilter }

  const teacher = await Teacher.findById(teacherId).lean()
  if (!teacher) throw new Error('Teacher not found')

  // Summary counts
  const summary = await Activity.aggregate([
    { $match: match },
    { $group: { _id: '$activityType', count: { $sum: 1 } } }
  ])

  // Class-wise breakdown
  const classBreakdown = await Activity.aggregate([
    { $match: { teacherId: require('mongoose').Types.ObjectId.createFromHexString(teacherId) } },
    {
      $group: {
        _id: '$class',
        totalActivities: { $sum: 1 },
        avgScore: { $avg: { $ifNull: ['$score', 0] } }
      }
    },
    { $sort: { _id: 1 } }
  ])

  // Recent activities (last 5)
  const recent = await Activity.find({ teacherId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  const lessons = summary.find(s => s._id === 'lesson')?.count || 0
  const quizzes = summary.find(s => s._id === 'quiz')?.count || 0
  const assessments = summary.find(s => s._id === 'assessment')?.count || 0
  const total = lessons + quizzes + assessments

  return {
    teacherId: teacher._id,
    teacherName: teacher.name,
    subjects: teacher.subjects || [],
    grades: teacher.grades || [],
    lessons,
    quizzes,
    assessments,
    lowEngagement: total === 0,
    classBreakdown: classBreakdown.map(c => ({
      class: `Class ${c._id}`,
      avgScore: parseFloat(c.avgScore.toFixed(1)),
      completion: c.totalActivities
    })),
    recentActivities: recent.map(r => ({
      type: r.activityType,
      subject: r.subject,
      class: r.class,
      createdAt: r.createdAt
    }))
  }
}

// ── AI Pulse Summary ──────────────────────────────────────────────────────────
exports.fetchAISummary = async () => {
  const teachers = await Teacher.find().lean()

  const agg = await Activity.aggregate([
    {
      $group: {
        _id: '$teacherId',
        total: { $sum: 1 },
        subjects: { $addToSet: '$subject' },
        classes: { $addToSet: '$class' }
      }
    },
    { $sort: { total: -1 } }
  ])

  const classAgg = await Activity.aggregate([
    { $group: { _id: '$class', students: { $sum: 1 } } },
    { $sort: { students: -1 } }
  ])

  const teacherMap = {}
  teachers.forEach(t => { teacherMap[t._id.toString()] = t.name })

  const insights = []

  if (agg.length > 0) {
    const top = agg[0]
    const name = teacherMap[top._id.toString()] || 'Unknown'
    insights.push({
      type: 'workload',
      message: `${name} has the highest workload with ${top.total} activities across ${top.subjects.length} subjects`
    })
  }

  if (classAgg.length > 0) {
    const topClass = classAgg[0]
    insights.push({
      type: 'enrollment',
      message: `Class ${topClass._id} has the most activity with ${topClass.students} records`
    })
  }

  const lowAgg = agg.filter(a => a.total <= 2)
  lowAgg.forEach(a => {
    const name = teacherMap[a._id.toString()] || 'Unknown'
    insights.push({
      type: 'warning',
      message: `${name} has only ${a.total} activit${a.total === 1 ? 'y' : 'ies'} — consider reviewing engagement`
    })
  })

  return insights
}

// ── Stats for header cards ────────────────────────────────────────────────────
exports.fetchStats = async (period = 'week', grade, subject) => {
  const dateFilter = buildDateFilter(period)
  const extraFilter = {}
  if (grade) extraFilter.class = grade
  if (subject) extraFilter.subject = subject

  const [teacherCount, activityCounts] = await Promise.all([
    Teacher.countDocuments(),
    Activity.aggregate([
      { $match: { ...dateFilter, ...extraFilter } },
      { $group: { _id: '$activityType', count: { $sum: 1 } } }
    ])
  ])

  return {
    activeTeachers: teacherCount,
    lessons: activityCounts.find(a => a._id === 'lesson')?.count || 0,
    quizzes: activityCounts.find(a => a._id === 'quiz')?.count || 0,
    assessments: activityCounts.find(a => a._id === 'assessment')?.count || 0,
    period
  }
}

// ── Available filters (distinct grades + subjects) ────────────────────────────
exports.fetchFilters = async () => {
  const [grades, subjects] = await Promise.all([
    Activity.distinct('class'),
    Activity.distinct('subject')
  ])
  return {
    grades: grades.sort((a, b) => Number(a) - Number(b)),
    subjects: subjects.sort()
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
function buildDateFilter(period) {
  const now = new Date()
  const start = new Date(now)
  if (period === 'week') start.setDate(start.getDate() - 7)
  if (period === 'month') start.setMonth(start.getMonth() - 1)
  if (period === 'year') start.setFullYear(start.getFullYear() - 1)
  return period === 'all' ? {} : { createdAt: { $gte: start } }
}