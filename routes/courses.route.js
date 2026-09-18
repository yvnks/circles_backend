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
import { protect } from '../middleware/auth.middleware.js';

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
  .post(protect, addCourse);
router
  .route('/:id')
  .get(getCourse)
  .patch(protect, updateCourse)
  .delete(protect, deleteCourse);

export default router;
