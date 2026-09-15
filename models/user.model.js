import mongoose from 'mongoose';

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please enter your first name'],
      maxlength: [15, 'Too long'],
    },

    lastName: {
      type: String,
      required: [true, 'Please enter your last name'],
      maxlength: [50, 'Name is too long'],
    },

    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email',
      ],
      required: [true, 'Please add an email'],
      unique: [true, 'An existing account exists with the current email'],
    },

    role: {
      type: String,
      enum: ['User', 'Publisher'],
      default: 'User',
    },

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    resetPasswordToken: String,
    resetPasswordExpiration: Date,
  },
  { timestamps: true },
);

export default mongoose.model('User', UserSchema);
