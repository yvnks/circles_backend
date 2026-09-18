import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

/**
 * @param
 * hash password before saving into db.
 */
UserSchema.pre('save', async function () {
  // ten is recommended according to the docs;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 *
 * @returns {JwtSignedToken}
 */
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
