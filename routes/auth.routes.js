import express from 'express';
import User from '../models/user.model.js';
import { register } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);

export default router;
