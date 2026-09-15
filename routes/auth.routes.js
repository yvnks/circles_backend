import express from 'express';
import User from '../models/user.model.js';
import { login, register } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;
