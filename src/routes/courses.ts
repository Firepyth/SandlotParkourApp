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
                "course_name",
                "course_created",
                "fastest_time",
                "fastest_player_name",
                "avg_time"
            ],
            req.query.sort as string
        );
        let direction: string = getDirection(req.query.direction as string);
        const page = getPage(req.query.page as string);
        
        const result: CourseBulk[] = await prisma.$queryRaw`
            SELECT
                MIN(matched_courses) AS matched_courses,
                JSON_AGG (
                    JSON_BUILD_OBJECT (
                        'course_id', course_id,
                        'course_name', course_name,
                        'course_created', course_created,
                        'fastest_time', fastest_time,
                        'fastest_player_id', fastest_player_id,
                        'fastest_player_name', fastest_player_name,
                        'avg_time', avg_time
                    )
                ) AS courses
            FROM (
                SELECT 
                    *,
                    COUNT(course_id) OVER () AS matched_courses
                FROM (
                    SELECT 
                        DISTINCT ON (course."courseId")
                        course."courseId" AS course_id,
                        course.name AS course_name,
                        created AS course_created,
                        time.time AS fastest_time,
                        time."playerId" AS fastest_player_id,
                        player.name AS fastest_player_name,
                        avg_times.avg_time
                    FROM course
                    LEFT JOIN time ON time."courseId" = course."courseId"
                    LEFT JOIN (
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
                    LEFT JOIN player ON time."playerId" = player."playerId"
                    ORDER BY course."courseId", time
                ) result
                WHERE LOWER(result.course_name) LIKE '%' || LOWER(${req.query.search || ''}) || '%'
                ORDER BY ${sort ? Prisma.raw(`result.${sort} ${direction}, result.course_name ASC`) : Prisma.raw(`result.course_name ${direction}`)}
                LIMIT 50
                OFFSET ${(page - 1) * 50}
            )
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No courses found with the search term ${req.query.search}` });
        }
        res.status(200).json(json(result[0]));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/:course_id', async function(req, res, next) {
    try {
        const result: Course[] = await prisma.$queryRaw`
            SELECT
                course.name AS course_name,
                course.created AS course_created,
                b.total_completions,
                b.unique_completions,
                c.fastest_time,
                c.fastest_deaths,
                c.fastest_player_id,
                d.avg_first_time,
                d.avg_first_deaths,
                player.name AS fastest_player_name,
                e.records
            FROM course
            LEFT JOIN (
                SElECT
                    COUNT("timeId") AS total_completions,
                    COUNT(DISTINCT("playerId")) AS unique_completions
                FROM time
                WHERE "courseId" = ${req.params.course_id}
                GROUP BY "courseId"
            ) b ON 1 = 1
            LEFT JOIN (
                SELECT
                    DISTINCT ON ("courseId")
                    time AS fastest_time,
                    deaths AS fastest_deaths,
                    "playerId" AS fastest_player_id
                FROM time
                WHERE "courseId" = ${req.params.course_id}
                ORDER BY "courseId", time
            ) c ON 1 = 1
            LEFT JOIN (
                SELECT
                    AVG(time) AS avg_first_time,
                    AVG(deaths) AS avg_first_deaths
                FROM (
                    SELECT
                        DISTINCT ON ("playerId")
                        time, deaths
                    FROM time
                    WHERE "courseId" = ${req.params.course_id}
                    ORDER BY "playerId", achieved
                )
            ) d ON 1 = 1
            LEFT JOIN (
                SELECT
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'time', time,
                            'time_achieved', time_achieved,
                            'player_id', player_id,
                            'player_name', player_name,
                            'deaths', deaths
                        )
                    ) AS records
                FROM (
                    SELECT
                        DISTINCT ON (MIN(time) OVER (ORDER BY achieved))
                        MIN(time) OVER (ORDER BY achieved) AS time,
                        achieved AS time_achieved, 
                        time."playerId" AS player_id,
                        player.name AS player_name,
                        deaths
                    FROM time
                    JOIN player ON player."playerId" = time."playerId"
                    WHERE "courseId" = ${req.params.course_id}
                    ORDER BY MIN(time) OVER (ORDER BY achieved) DESC, achieved
                )
            ) e ON 1 = 1
            LEFT JOIN player ON player."playerId" = c.fastest_player_id
            WHERE course."courseId" = ${req.params.course_id}
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

router.get('/completions/:course_id', async function(req, res, next) {
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
            SELECT
                matched_completions,
                JSON_AGG (
                    JSON_BUILD_OBJECT (
                        'rank', rank,
                        'player_id', player_id,
                        'player_name', player_name,
                        'time', time,
                        'deaths', deaths,
                        'time_id', time_id
                    )
                ) AS completions
            FROM (
                SELECT
                    COUNT(player_id) OVER () AS matched_completions,
                    *
                FROM (
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
                            RANK() OVER (ORDER BY "time") AS rank,
                            completions."playerId" AS player_id,
                            player.name AS player_name,
                            time,
                            deaths,
                            "timeId" AS time_id
                        FROM completions
                        JOIN player ON player."playerId" = completions."playerId"
                    ) result
                    WHERE LOWER(result.player_name) LIKE '%' || LOWER(${req.query.search || ''}) || '%'
                    ORDER BY ${sort ? Prisma.raw(`result.${sort} ${direction}, result.rank ASC`) : Prisma.raw(`result.rank ${direction}`)}
                    LIMIT 50
                    OFFSET ${(page - 1) * 50}
                )
            )
            GROUP BY matched_completions
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No players found with the search term ${req.query.search}` });
        }
        res.status(200).json(json(result[0]));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

export default router;