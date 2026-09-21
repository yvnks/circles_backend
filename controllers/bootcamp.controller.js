import Bootcamp from '../models/Bootcamp.model.js';
import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import geocoder from '../utils/app.geocoder.js';
import path from 'path';
import checkIfBootcampExists from '../utils/checkBootcamp.js';

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
export const getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
export const getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `Bootcamp not found with ID of ${req.params.id}`,
        404,
      ),
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private
export const createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // Check if user is not an admin.
  checkIfBootcampExists(bootcamp, req, 401, next);

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update specific bootcamp
// @route   PATCH /api/v1/bootcamps/:id
// @access  Public
export const updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `Bootcamp not found with ID of ${req.params.id}`,
        404,
      ),
    );
  }
  checkIfBootcampExists(bootcamp, req, 401, next);

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ enroll: true, data: bootcamp });
});

// @desc    Delete specific bootcamp
// @route   Delete /api/v1/bootcamps/:id
// @access  Private
export const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `Failed to delete bootcamp. Bootcamp not found.`,
        401,
      ),
    );
  }

  checkIfBootcampExists(bootcamp, req, 401, next);

  await bootcamp.deleteOne();
  res.status(200).json({ enroll: true, data: {} });
});

// @desc    Get bootcamps within a specific radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance measured in miles /ms
// @access  Private
export const getBootcampInRadius = asyncHandler(async (req, res, next) => {
  const radiusOfTheEarth = 3963;

  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;

  // distance / radius_of_the_earth
  const radius = distance / radiusOfTheEarth;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
  //console.log(req.params);
});

// @desc    Delete specific bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
export const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `We tried to find a bootcamp with the ID: ${req.params.id} but we ran into a challenge.\nWe are notifiying our engineers.`,
        401,
      ),
    );
  }

  checkIfBootcampExists(bootcamp, req, 401, next);

  if (!req.files) {
    return next(new CustomErrorHandlerAPI('Please upload a file', 404));
  }

  console.log(req.files);

  const file = req.files.file;

  // Checks if uploaded file is an image/jpg/png/gif
  if (!file.mimetype.startsWith('image')) {
    return next(new CustomErrorHandlerAPI('Please upload a photo', 404));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    // Stored in bytes.
    return next(
      new CustomErrorHandlerAPI(
        'Please upload a picture smaller than 1 MB.',
        400,
      ),
    );
  }

  // Creates a default name for files
  file.name = `${bootcamp.name.split(' ').join('-').toLowerCase()}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}${file.name}`, async (err) => {
    if (err) {
      return next(new CustomErrorHandlerAPI('Failed to upload photo', 500));
    }
  });

  await Bootcamp.findByIdAndUpdate(req.params.id, {
    photo: `${process.env.FILE_UPLOAD_PATH}${file.name}`,
  });

  res.status(200).json({
    sucess: true,
    data: `${process.env.FILE_UPLOAD_PATH}${file.name}`,
  });

  console.log(file.name);
});
