const mongoose = require('mongoose')

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    subjects: [{ type: String }],
    grades: [{ type: String }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Teacher', teacherSchema)