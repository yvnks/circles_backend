import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/user.model.js';
import dayjs from 'dayjs';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
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

  sendTokenResponse(user, 200, res);
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
/**
 * @desc Forgot password
 * @route POST api/v1/auth/forgotPassword
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new CustomErrorHandlerAPI(
        `No user found with email: ${req.body.email}`,
        404,
      ),
    );
  }

  // Get reset token.
  const resetToken = user.getResetPasswordToken();

  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}/`;
  const message = `Hello, you are receiving this email because you requested for a new password on your devCamper account. Please make a put request to: \n\n${resetURL}
`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Password reset email sent' });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiration = undefined;

    await user.save({ validateBeforeSave: false });
    console.log(error);
    return next(
      new CustomErrorHandlerAPI('Failed to send password reset email', 500),
    );
  }
});

/**
 * @desc reset password url
 * @route PUT /api/v1/resetpassword/:resettoken
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // set new password;
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return next(CustomErrorHandlerAPI(`Invalid token`, 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiration = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: dayjs().add(process.env.JWT_COOKIE_EXPIRE, 'day').toDate(),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
