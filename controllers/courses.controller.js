import Bootcamp from '../models/Bootcamp.model.js';
import CustomErrorHandlerAPI from '../helpers/customErrorHandlerAPI.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Course from '../models/courses.model.js';

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

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new CustomErrorHandlerAPI(
        `We tried to find a bootcamp with the ID: ${req.params.bootcampId}
         but an unforseen error occured. We are notifying our engineers.`,
        404,
      ),
    );
  }
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
      new CustomErrorHandlerAPI(`Course with ID: ${courseId} not found`, 404),
    );
  }

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

  let course = Course.findById(courseId);

  if (!course) {
    return next(
      new CustomErrorHandlerAPI(
        `No matching course found with the ID: ${courseId}`,
        404,
      ),
    );
  }
  course = await Course.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
