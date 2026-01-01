import { prisma } from '../../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';
import { getPage, getDirection, getSort } from '../helpers/handleQueryParams.js';
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

router.get('/:player_id/:course_id', async function(req, res, next) {
    try {
        const result: PlayerCourse[] = await prisma.$queryRaw`
            SELECT
                a.leaderboard_position,
                a.fastest_time,
                a.fastest_deaths,
                b.first_time,
                b.first_deaths,
                c.avg_time,
                c.avg_deaths,
                c.total_completions,
                d.name AS course_name,
                player."playerId" AS player_id,
                player.name AS player_name,
                e.personal_bests
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
                    AVG(deaths) AS avg_deaths,
                    COUNT("playerId") AS total_completions
                FROM time
                WHERE
                    "courseId" = ${req.params.course_id} AND
                    "playerId" = ${req.params.player_id}
            ) c ON 1 = 1
            JOIN (
                SELECT
                    name,
                    "courseId"
                FROM course
                WHERE "courseId" = ${req.params.course_id}
            ) d ON 1 = 1
            JOIN (
                SELECT
                    JSON_AGG (
                        JSON_BUILD_OBJECT (
                            'time', time,
                            'wrong_time', wrong_time,
                            achieved, achieved
                        )
                    ) AS personal_bests
                FROM (
                    SELECT
                        DISTINCT ON (MIN(time) OVER (ORDER BY achieved))
                        MIN(time) OVER (ORDER BY achieved) AS time,
                        time AS wrong_time,
                        achieved
                    FROM time
                    WHERE 
                        "courseId" = 25 AND
                        "playerId" = '2678f0bfa3c348bcaf7017f2f54d4305'
                    ORDER BY MIN(time) OVER (ORDER BY achieved) DESC, achieved
                )
            ) e ON 1 = 1
            JOIN player ON player."playerId" = ${req.params.player_id}
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No player with the ID ${req.params.player_id} has completed course ${req.params.course_id}` });
        }
        res.status(200).json(json(result)[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/completions/:player_id/:course_id', async function(req, res, next) {
    try {
        let sort: string | boolean = getSort(
            [
                "time",
                "deaths",
                "leaderboard_position",
                "time_achieved"
            ],
            req.query.sort as string
        );
        let direction: string = getDirection(req.query.direction as string);
        const page = getPage(req.query.page as string);

        const result: PlayerCourseTime[] = await prisma.$queryRaw`
            SELECT *
            FROM (
                SELECT
                    "timeId" AS time_id,
                    time,
                    deaths,
                    "position" AS leaderboard_position,
                    achieved AS time_achieved
                FROM (
                    SELECT
                        *,
                        RANK() OVER (ORDER BY time) AS "position"
                    FROM time
                    WHERE "courseId" = ${req.params.course_id}
                )
                WHERE
                    "playerId" = ${req.params.player_id}
            ) result
            ORDER BY ${sort ? Prisma.raw(`result.${req.query.sort} ${direction}, result.leaderboard_position`) : Prisma.raw(`result.leaderboard_position ${direction}`)}
            LIMIT 50
            OFFSET ${(page - 1) * 50}
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No player with the ID ${req.params.player_id} has completed course ${req.params.course_id}` });
        }
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/search', async function(req, res, next) {
    try {
        const result: PlayerCourseTime[] = await prisma.$queryRaw`
            (
                SELECT
                    "courseId" AS course_id,
                    name AS course_name,
                    NULL AS player_id,
                    NULL AS player_name
                FROM course
                WHERE LOWER(name) LIKE LOWER('%' || ${req.query.search || ''} || '%')
                ORDER BY course_name
                LIMIT 3
            )
            UNION
            (
                SELECT
                    NULL,
                    NULL,
                    "playerId",
                    name
                FROM player
                WHERE LOWER(name) LIKE LOWER('%' || ${req.query.search || ''} || '%')
                ORDER BY name
                LIMIT 3
            )
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No players or courses match the search term ${req.query.search}` });
        }
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

router.get('/recent', async function(req, res, next) {
    try {
        const result: PlayerCourseTime[] = await prisma.$queryRaw`
            (
                SELECT
                    "courseId" AS course_id,
                    name AS course_name,
                    created AS course_created,
                    NULL AS completed_courses,
                    NULL AS player_id,
                    NULL AS player_name
                FROM course
                ORDER BY created DESC
                LIMIT 5
            )
            UNION
            (
                SELECT
                    NULL,
                    NULL,
                    NULL,
                    COUNT(DISTINCT("courseId")) AS completed_courses,
                    time."playerId" AS player_id,
                    player.name AS player_name
                FROM time
                JOIN player ON player."playerId" = time."playerId"
                GROUP BY time."playerId", player.name
                ORDER BY completed_courses DESC
                LIMIT 5
            )
            ORDER BY completed_courses DESC, course_created DESC
            ;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: `No courses or players found.` });
        }
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});



export default router;