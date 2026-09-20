import express from 'express';
import {
  createBootcamp,
  deleteBootcamp,
  getBootcamp,
  getBootcampInRadius,
  getBootcamps,
  updateBootcamp,
  bootcampPhotoUpload,
} from '../controllers/bootcamp.controller.js';
import courses from './courses.route.js';
import advancedresults from '../middleware/advanced-result.js';
import Bootcamp from '../models/Bootcamp.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// re-route into other resources;
router.use('/:bootcampId/courses', courses);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router
  .route('/')
  .get(advancedresults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('Publisher', 'Admin'), createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .patch(protect, authorize('Publisher', 'Admin'),   updateBootcamp)
  .delete(protect, authorize('Publisher', 'Admin'), deleteBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('Publisher', 'Admin'), bootcampPhotoUpload);

export default router;
