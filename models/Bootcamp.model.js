import mongoose from 'mongoose';
import slugify from 'slugify';
import geocoder from '../utils/app.geocoder.js';

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a bootcamp name.'],
      unique: true,
      trim: true,
      maxlength: [50, 'Cannot be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Tell us about the bootcamp'],
      trim: true,
      maxlength: [500, 'Cannot be more than 500 characters'],
    },

    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please enter a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [15, 'Cannot be more than 15 Characters'],
    },
    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please enter a valid address'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'rating must be atleast 1'],
      max: [10, 'rating must not be more than 10'],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: 'no-photo.jpeg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// mongoose middleware to create a slug from name.
BootcampSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

BootcampSchema.pre('save', async function () {
  const loc = await geocoder.geocode(this.address);

  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // reject address from DB
  this.address = undefined;
});

// Create Virtual on schema
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

BootcampSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    console.log(`Courses being removed from DB: ${this._id}`);

    await this.model('Course').deleteMany({
      bootcamp: this._id,
    });
  },
);

export default mongoose.model('Bootcamp', BootcampSchema);
