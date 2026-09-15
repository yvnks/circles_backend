import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/user.model.js';

export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  const token = user.getSignedJwtToken();
  res.status(200).json({
    success: true,
    token,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new CustomErrorHandlerAPI('Please enter a valid email and password', 401),
    );
  }

  // Check if user exists.
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new CustomErrorHandlerAPI('User not found', 401));
  }

  const isTrue = await user.matchPassword(password);

  if (!isTrue) {
    return next(new CustomErrorHandlerAPI('Invalid password', 401));
  }

  const token = user.getSignedJwtToken();
  res.status(200).json({
    success: true,
    token,
  });
});
