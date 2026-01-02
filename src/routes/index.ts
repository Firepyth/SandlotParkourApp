import express from 'express';
const router = express.Router();

import playersRouter from './players.js';
import coursesRouter from './courses.js';
import playerCourseRouter from './playerCourse.js';

router.use('/players', playersRouter);
router.use('/courses', coursesRouter);
router.use('/playercourse', playerCourseRouter);

export default router;