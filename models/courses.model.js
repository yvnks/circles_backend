import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please enter a description'],
      maxlength: [500, 'Cannot be more than 500 characters'],
    },
    weeks: {
      type: String,
      required: [true, 'Please add the duration of the bootcamp'],
    },
    tuition: {
      type: Number,
      required: [true, 'Please add a tuition cost'],
    },
    minimumSkill: {
      type: String,
      required: [true, 'Please enter a minimum skill'],
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    scolarshipAvailable: {
      type: Boolean,
      default: false,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: 'Bootcamp',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    }, 
  },
  { timestamps: true },
);

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // aggregation returns a promise.
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    res.status(404).json({ success: false });
  }
};

CourseSchema.pre('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

export default mongoose.model('Course', CourseSchema);
