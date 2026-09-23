import Bootcamp from '../models/Bootcamp.model.js';
import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Course from '../models/courses.model.js';
import checkOwner from '../utils/checkOwner.js';

// @desc    Get all bootcamps
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const course = await Course.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      data: course,
      length: course.length,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/**
 * GET single course.
 * GET api/v1/courses/:id
 */
export const getCourse = asyncHandler(async function (req, res, next) {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new CustomErrorHandlerAPI(`No Course found with ID: ${req.params.id}`),
    );
  }

  res.status(200).json({
    success: true,
    data: course,
    count: course.length,
  });
});

/**
 * adds a course to the db
 */
export const addCourse = asyncHandler(async function (req, res, next) {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `No bootcamp found with the id: ${req.params.bootcampId}`,
        404,
      ),
    );
  }

  checkOwner(bootcamp, req, 401, next);
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });

  // GET api/v1/bootcamps/:bootcampId/courses
});

/**
 * PATCH: api/v1/courses/:id
 */
export const updateCourse = asyncHandler(async function (req, res, next) {
  const courseId = req.params.id;

  let course = await Course.findById(courseId);

  if (!course) {
    return next(
      new CustomErrorHandlerAPI(
        `Course with ID: ${courseId} was not found`,
        404,
      ),
    );
  }

  checkOwner(course, req, 403, next);

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });

  // GET api/v1/bootcamps/:bootcampId/courses
});

export const deleteCourse = asyncHandler(async function (req, res, next) {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(
      new CustomErrorHandlerAPI(
        `No matching course found with the ID: ${courseId}`,
        404,
      ),
    );
  }

  checkOwner(course, req, 404, next);

  await Course.deleteOne({ _id: courseId });

  res.status(200).json({
    success: true,
    data: {},
  });
});
