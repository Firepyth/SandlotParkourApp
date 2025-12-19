import { prisma } from '../../lib/prisma.js';
import express from 'express';
import json from '../helpers/json.js';
const router = express.Router();

interface CourseBulk {
    course_id: number;
    name: string;
    created: Date;
    record_time: number;
    fastest_player: string;
    avg_time: number;
    avg_deaths: number;
}

interface Course {
    name: string;
    created: Date;
    total_completions: number;
    unique_completions: number;
    average_time: number;
    fastest_time: number;
    fastest_deaths: number;
    fastest_player: number;
}

interface CourseTime {
    rank: number;
    player_id: string;
    time: number;
    deaths: number;
    time_id: number;
}

interface Record {
    achieved: Date;
    time: number;
    player_id: string;
    deaths: number;
}

router.get('/', async function(req, res, next) {
    try {
        const result: CourseBulk[] = await prisma.$queryRaw`
            SELECT *
            FROM (
                SELECT 
                    DISTINCT ON (course."courseId")
                    course."courseId" AS course_id, 
                    course.name, created, 
                    time.time AS "record_time", 
                    time."playerId" AS "fastest_player_id", 
                    player.name AS "fastest_player_name", 
                    avg_times.avg_time, 
                    avg_times.avg_deaths
                FROM course
                JOIN time ON time."courseId" = course."courseId"
                JOIN (
                    SELECT AVG(p1.time) AS avg_time, AVG(p1.deaths) AS avg_deaths, p1."courseId"
                    FROM (
                        SELECT p1.* 
                        FROM time p1
                        JOIN (
                            SELECT min(achieved) "runDate", CONCAT("courseId", "playerId") "courseId" FROM time GROUP BY CONCAT("courseId", "playerId")
                        ) AS p2 
                        ON p1.achieved = p2."runDate"
                        AND CONCAT(p1."courseId", p1."playerId") = p2."courseId"
                        ORDER BY "courseId"
                    ) AS p1
                    GROUP BY p1."courseId"
                ) AS avg_times ON course."courseId" = avg_times."courseId"
                JOIN player ON time."playerId" = player."playerId"
                ORDER BY course."courseId", time
            ) result
            ORDER BY result.name 
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/:course_id', async function(req, res, next) {
    try {
        const result: Course[] = await prisma.$queryRaw`
            SELECT
                course.name,
                course.created,
                b.total_completions,
                b.unique_completions,
                b.average_time,
                c.fastest_time,
                c.fastest_deaths,
                c.fastest_player_id,
                player.name AS fastest_player_name
            FROM course
            JOIN (
                SElECT
                    COUNT("timeId") AS total_completions,
                    COUNT(DISTINCT("playerId")) AS unique_completions,
                    AVG(time) AS average_time
                FROM time
                WHERE "courseId" = ${req.params.course_id}
                GROUP BY "courseId"
            ) b ON 1 = 1
            JOIN (
                SELECT
                    DISTINCT ON ("courseId")
                    time AS fastest_time,
                    deaths AS fastest_deaths,
                    "playerId" AS fastest_player_id
                FROM time
                WHERE "courseId" = ${req.params.course_id}
                ORDER BY "courseId", time
            ) c ON 1 = 1
            JOIN (
                SELECT
                    AVG(time) AS average_first_time,
                    AVG(deaths) AS average_first_deaths
                FROM (
                    SELECT
                        DISTINCT ON ("playerId")
                        time, deaths
                    FROM time
                    WHERE "courseId" = ${req.params.course_id}
                    ORDER BY "playerId", achieved
                )
            ) d ON 1 = 1
            JOIN player ON player."playerId" = c.fastest_player_id
            WHERE course."courseId" = ${req.params.course_id}
            ;
        `;
        res.status(200).json(json(result)[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/times/:course_id', async function(req, res, next) {
    try {
        const result: CourseTime[] = await prisma.$queryRaw`
            WITH completions AS (
                SELECT
                    DISTINCT ON ("playerId")
                    "timeId", 
                    "playerId", 
                    "time", 
                    "deaths"
                FROM time
                WHERE "courseId" = ${req.params.course_id}
                ORDER BY "playerId", "time"
            )
            SELECT
                RANK() OVER (ORDER BY "time"),
                completions."playerId" AS player_id,
                player.name AS player_name,
                "time",
                "deaths",
                "timeId" AS time_id
            FROM completions
            JOIN player ON player."playerId" = completions."playerId"
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/records/:course_id', async function(req, res, next) {
    try {
        const result: Record[] = await prisma.$queryRaw`
            SELECT
                DISTINCT ON (MIN(time) OVER (ORDER BY achieved))
                MIN(time) OVER (ORDER BY achieved) AS time,
                achieved, 
                time."playerId" AS player_id,
                player.name AS player_name,
                deaths
            FROM time
            JOIN player ON player."playerId" = time."playerId"
            WHERE "courseId" = ${req.params.course_id}
            ORDER BY MIN(time) OVER (ORDER BY achieved) DESC
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

export default router;