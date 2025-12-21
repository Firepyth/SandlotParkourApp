import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import { getPage, getDirection, getSort } from '../helpers/handleQueryParams.js';
import { checkForCourse } from '../helpers/checkID.js';
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
        let sort: string | boolean = getSort(
            [
                "name",
                "created",
                "record_time",
                "fastest_player_name",
                "avg_time"
            ],
            req.query.sort as string
        );
        let direction: string = getDirection(req.query.direction as string);
        const page = getPage(req.query.page as string);
        
        const result: CourseBulk[] = await prisma.$queryRaw`
            SELECT *
            FROM (
                SELECT 
                    DISTINCT ON (course."courseId")
                    course."courseId" AS course_id, 
                    course.name,
                    created, 
                    time.time AS "record_time", 
                    time."playerId" AS "fastest_player_id", 
                    player.name AS "fastest_player_name", 
                    avg_times.avg_time
                FROM course
                JOIN time ON time."courseId" = course."courseId"
                JOIN (
                    SELECT AVG(p1.time) AS avg_time, p1."courseId"
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
            WHERE LOWER(result.name) LIKE '%' || LOWER(${req.query.search || ''}) || '%'
            ORDER BY ${sort ? Prisma.raw('result.' + sort) : Prisma.raw('result.name')} ${Prisma.raw(direction)}
            LIMIT 50
            OFFSET ${(page - 1) * 50}
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No courses found with the search term ${req.query.search}` });
        }
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
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
                c.fastest_time,
                c.fastest_deaths,
                c.fastest_player_id,
                d.average_first_time,
                d.average_first_deaths,
                player.name AS fastest_player_name
            FROM course
            JOIN (
                SElECT
                    COUNT("timeId") AS total_completions,
                    COUNT(DISTINCT("playerId")) AS unique_completions
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
        if (result.length === 0) {
            return res.status(404).json({ error: `No courses found with the ID ${req.params.course_id}` });
        }
        res.status(200).json(json(result)[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/times/:course_id', async function(req, res, next) {
    try {
        const course: boolean = await checkForCourse(req.params.course_id);
        if (course === false) {
            return res.status(404).json({ error: `No courses found with the ID ${req.params.course_id}` });
        }

        let sort: string | boolean = getSort(
            [
                "rank",
                "player_name",
                "deaths"
            ],
            req.query.sort as string
        );
        let direction: string = getDirection(req.query.direction as string);
        const page = getPage(req.query.page as string);

        const result: CourseTime[] = await prisma.$queryRaw`
            SELECT *
                FROM (
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
            ) result
            WHERE LOWER(result.player_name) LIKE '%' || LOWER(${req.query.search || ''}) || '%'
            ORDER BY ${sort ? Prisma.raw('result.' + sort) : Prisma.raw('result.rank')} ${Prisma.raw(direction)}
            LIMIT 50
            OFFSET ${(page - 1) * 50}
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No players found with the search term ${req.query.search}` });
        }
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
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
        if (result.length === 0) {
            return res.status(404).json({ error: `No courses found with the ID ${req.params.course_id}` });
        }
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

export default router;