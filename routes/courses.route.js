import express from 'express';
import {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.controller.js';
import advancedresults from '../middleware/advanced-result.js';
import Course from '../models/courses.model.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedresults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses,
  )
  .post(addCourse);
router.route('/:id').get(getCourse).patch(updateCourse).delete(deleteCourse);

export default router;
