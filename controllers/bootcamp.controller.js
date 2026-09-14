import Bootcamp from '../models/Bootcamp.model.js';
import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import geocoder from '../utils/app.geocoder.js';
import path from 'path';

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
export const getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(lt|lte|gt|gte|in)\b/g,
    (match) => `$${match}`,
  );

  query = Bootcamp.find(JSON.parse(queryStr)).populate({
    path: 'courses',
    select: 'name description',
  });

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  query = query.skip(startIndex).limit(limit);

  const bootcamp = await query;

  res.status(200).json({
    success: true,
    count: bootcamp.length,
    pagination,
    data: bootcamp,
  });
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
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update specific bootcamp
// @route   PATCH /api/v1/bootcamps/:id
// @access  Public
export const updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `Bootcamp not found with ID of ${req.params.id}`,
        404,
      ),
    );
  }

  res.status(200).json({ enroll: true, data: bootcamp });
});

// @desc    Delete specific bootcamp
// @route   Delete /api/v1/bootcamps/:id
// @access  Private
export const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }

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
      `We tried to find a bootcamp with the ID: ${req.params.id} but we ran into a challenge.\nWe are notifiying our engineers.`,
    );
  }

  if (!req.files) {
    return next('Please upload a file', 404);
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
