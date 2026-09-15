import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/user.model.js';

export const register = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
  });
});
