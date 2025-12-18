import express from 'express';
const router = express.Router();

import playersRouter from './players.js';
import coursesRouter from './courses.js';
import generalRouter from './generalStats.js';

router.use('/players', playersRouter);
router.use('/courses', coursesRouter);
router.use('/generalstats', generalRouter);

export default router;