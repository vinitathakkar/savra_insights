const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    activityType: {
      type: String,
      enum: ['lesson', 'quiz', 'assessment'],
      required: true
    },
    subject: String,
    class: String,
    createdAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

/* Hidden Twist Handling */
activitySchema.index(
  { teacherId: 1, activityType: 1, subject: 1, class: 1, createdAt: 1 },
  { unique: true }
)

module.exports = mongoose.model('Activity', activitySchema)