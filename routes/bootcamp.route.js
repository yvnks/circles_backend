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

const router = express.Router();

// re-route into other resources;
router.use('/:bootcampId/courses', courses);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/').get(getBootcamps).post(createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .patch(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);

export default router;
