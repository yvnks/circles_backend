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
import { protect, authorize } from '../middleware/auth.middleware.js';

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
  .post(protect, authorize('Publisher', 'Admin'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .patch(protect, authorize('Publisher', 'Admin'), updateCourse)
  .delete(protect, authorize('Publisher', 'Admin'), deleteCourse);

export default router;
