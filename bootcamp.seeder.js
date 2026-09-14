import mongoose from 'mongoose';
import fs from 'fs';
import BootcampModel from './models/Bootcamp.model.js';
import { configDotenv } from 'dotenv';
import CourseModel from './models/courses.model.js';

configDotenv({ path: './config/config.env' });
mongoose.connect(process.env.MONGODB_URI);

// chore: read json files
const bootcamps = JSON.parse(
  fs.readFileSync(`${import.meta.dirname}/_data/bootcamps.json`, 'utf-8'),
);

const courses = JSON.parse(
  fs.readFileSync(`${import.meta.dirname}/_data/courses.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await BootcampModel.create(bootcamps);
    await CourseModel.create(courses);
    console.log('data imported successfully');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await BootcampModel.deleteMany();
    await CourseModel.deleteMany();
    console.log('data destroyed');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
