import { prisma } from '../../lib/prisma.js';
import express from 'express';
import json from '../helpers/json.js';
const router = express.Router();

interface GeneralStats {
    total_courses: number;
    total_players: number;
    total_completions: number;
}

router.get('/', async function(req, res, next) {
    try {
        const result: GeneralStats = await prisma.$queryRaw`
            SELECT a.total_courses, b.total_players, b.total_completions
            FROM (
                SELECT
                    COUNT("courseId") AS total_courses
                FROM course
            ) a
            JOIN (
                SELECT
                    COUNT(DISTINCT("playerId")) AS total_players,
                    COUNT("timeId") AS total_completions
                FROM time
            ) b
            ON 1 = 1
            ;
        `;
        res.status(200).json(json(result)[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

export default router;