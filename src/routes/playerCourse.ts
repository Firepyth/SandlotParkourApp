import { prisma } from '../../lib/prisma.js';
import express from 'express';
import json from '../helpers/json.js';
const router = express.Router();

interface PlayerCourse {
    leaderboard_position: number;
    fastest_time: number;
    fastest_deaths: number;
    first_time: number;
    first_deaths: number;
    avg_time: number;
    avg_deaths: number;
}

interface PlayerCourseTime {
    time_id: number;
    time: number;
    deaths: number;
    position: number;
    achieved: Date;
}

router.get('/:course_id/:player_id', async function(req, res, next) {
    try {
        const result: PlayerCourse = await prisma.$queryRaw`
            SELECT
                a.leaderboard_position,
                a.fastest_time,
                a.fastest_deaths,
                b.first_time,
                b.first_deaths,
                c.avg_time,
                c.avg_deaths,
                d.name
            FROM (
                SELECT
                    leaderboard_position,
                    fastest_time,
                    fastest_deaths
                FROM (
                    WITH fastest_time AS (
                        SELECT DISTINCT ON ("playerId")
                            "playerId",
                            "time" AS fastest_time,
                            deaths AS fastest_deaths
                        FROM time
                        WHERE "courseId" = ${req.params.course_id}
                        ORDER BY "playerId", "time" ASC
                    )
                    SELECT
                        "playerId",
                        RANK() OVER (ORDER BY fastest_time ASC) AS "leaderboard_position",
                        fastest_time,
                        fastest_deaths
                    FROM fastest_time
                    ORDER BY "leaderboard_position", fastest_time
                )
                WHERE "playerId" = ${req.params.player_id}
            ) a
            JOIN (
                SELECT
                    DISTINCT ON ("playerId")
                    time AS first_time,
                    deaths AS first_deaths
                FROM time
                WHERE 
                    "courseId" = ${req.params.course_id} AND
                    "playerId" = ${req.params.player_id}
                ORDER BY "playerId", achieved
            ) b ON 1 = 1
            JOIN (
                SELECT
                    AVG(time) AS avg_time,
                    AVG(deaths) AS avg_deaths
                FROM time
                WHERE
                    "courseId" = ${req.params.course_id} AND
                    "playerId" = ${req.params.player_id}
            ) c ON 1 = 1
            JOIN (
                SELECT
                    name
                FROM course
                WHERE "courseId" = ${req.params.course_id}
            ) d ON 1 = 1
            ;
        `;
        res.status(200).json(json(result)[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/completions/:course_id/:player_id', async function(req, res, next) {
    try {
        const result: PlayerCourseTime[] = await prisma.$queryRaw`
            SELECT "timeId" AS time_id, time, deaths, "position", "achieved"
            FROM (
                SELECT
                    *,
                    RANK() OVER (ORDER BY time) AS "position"
                FROM time
                WHERE "courseId" = ${req.params.course_id}
            )
            WHERE
                "playerId" = ${req.params.player_id}
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

export default router;