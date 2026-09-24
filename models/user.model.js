import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dayjs from 'dayjs';

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your first name'],
      maxlength: [60, 'Too long'],
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
      enum: ['user', 'publisher'],
      default: 'user',
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    resetPasswordToken: String,
    resetPasswordExpiration: Date,
  },
  { timestamps: true },
);

/**
 * @desc
 * hash password before saving into db.
 */
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }
  // ten is recommended according to the docs;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and has passwords.
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpiration = dayjs().add('10', 'minutes').valueOf();

  return resetToken;
};

export default mongoose.model('User', UserSchema);
