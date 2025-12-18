import { prisma } from '../../lib/prisma.js';
import express from 'express';
import json from '../helpers/json.js';
const router = express.Router();

interface PlayerBulk {
    player_id: string;
    completed_courses: number;
    avg_position: number;
    record_count: number;
}

interface Player {
    player_id: string;
    completed_courses: number;
    total_completions: number;
    total_records: number;
}

interface PlayerTime {
    name: string;
    course_id: number;
    fastest_time: number | null;
    deaths: number | null;
    leaderboard_position: number | null;
    time_id: number | null;
}

router.get('/', async function(req, res, next) {
    try {
        const result: PlayerBulk[] = await prisma.$queryRaw`
            SELECT a."playerId" AS player_id, COUNT(a."courseId") AS "completed_courses", b."avg_position", COALESCE(c."record_count", '0') AS "record_count"
            FROM (
                SELECT
                    DISTINCT ON ("playerId", "courseId")
                    *
                FROM time
                ORDER BY "playerId", "courseId"
            ) a
            JOIN (
                WITH best_positions AS (WITH best_times AS (
                        SELECT DISTINCT ON ("courseId", "playerId")
                            "courseId",
                            "playerId",
                            "time" AS "best_time"
                        FROM time
                        ORDER BY "courseId", "playerId", "time" ASC
                    )
                    SELECT
                        "courseId",
                        "playerId",
                        "best_time",
                        RANK() OVER (PARTITION BY "courseId" ORDER BY "best_time" ASC) AS "leaderboard_position"
                    FROM best_times
                    ORDER BY "courseId", "leaderboard_position", "best_time"
                )
                SELECT
                    AVG("leaderboard_position") as "avg_position",
                    "playerId"
                FROM best_positions
                GROUP BY "playerId"
                ORDER BY "avg_position"
            ) b ON a."playerId" = b."playerId"
            LEFT JOIN (
                SELECT
                    COUNT("fastest_player") AS record_count, "fastest_player"
                FROM (
                    SELECT
                        DISTINCT ON ("courseId")
                        "playerId" AS "fastest_player"
                    FROM time
                    ORDER BY "courseId", time
                )
                GROUP BY "fastest_player"
            ) c ON a."playerId" = c."fastest_player"
            GROUP BY a."playerId", b."avg_position", c."record_count"
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/:player_id', async function(req, res, next) {
    try {
        const result: Player[] = await prisma.$queryRaw`
            SELECT
                a."playerId" AS player_id,
                a.completed_courses,
                a.total_completions,
                b.total_records
            FROM (
                SELECT
                    "playerId",
                    COUNT(DISTINCT("courseId")) AS completed_courses,
                    COUNT("timeId") AS total_completions
                FROM time
                WHERE "playerId" = ${req.params.player_id}
                GROUP BY "playerId"
            ) a
            JOIN (
                SELECT
                    COUNT("playerId") AS total_records
                FROM (
                    SELECT
                        DISTINCT ON ("courseId")
                        "playerId"
                    FROM time
                    ORDER BY "courseId", time
                )
                WHERE "playerId" = ${req.params.player_id}
            ) b ON 1 = 1
            ;
        `;
        res.status(200).json(json(result)[0]);
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/completions/all/:player_id', async function(req, res, next) {
    try {
        const result: PlayerTime[] = await prisma.$queryRaw`
            (SELECT
                DISTINCT ON (time."courseId")
                course.name, time."courseId" AS course_id, time AS "fastest_time", deaths, b."leaderboard_position", time."timeId" AS time_id
            FROM time
            JOIN course ON course."courseId" = time."courseId"
            JOIN (
                WITH best_times AS (
                    SELECT DISTINCT ON ("courseId", "playerId")
                        "courseId",
                        "playerId",
                        "time" AS "best_time"
                    FROM time
                    ORDER BY "courseId", "playerId", "time" ASC
                )
                SELECT
                    "courseId",
                    "playerId",
                    RANK() OVER (PARTITION BY "courseId" ORDER BY "best_time" ASC) AS "leaderboard_position"
                FROM best_times
                ORDER BY "courseId", "leaderboard_position", "best_time"
            ) b ON time."courseId" = b."courseId" AND time."playerId" = b."playerId"
            WHERE time."playerId" = ${req.params.player_id}
            ORDER BY time."courseId", time)
            UNION
            (SELECT
                course.name, course."courseId", NULL, NULL, NULL, NULL
            FROM (
                SELECT
                    DISTINCT ON ("courseId")
                    *
                FROM time
                WHERE time."playerId" = ${req.params.player_id}
            ) a
            RIGHT JOIN course ON a."courseId" = course."courseId"
            WHERE "playerId" IS NULL)
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/completions/finished/:player_id', async function(req, res, next) {
    try {
        const result: PlayerTime[] = await prisma.$queryRaw`
            SELECT
                DISTINCT ON (time."courseId")
                course.name, time."courseId" AS course_id, time AS "fastest_time", deaths, b."leaderboard_position", time."timeId" AS time_id
            FROM time
            JOIN course ON course."courseId" = time."courseId"
            JOIN (
                WITH best_times AS (
                    SELECT DISTINCT ON ("courseId", "playerId")
                        "courseId",
                        "playerId",
                        "time" AS "best_time"
                    FROM time
                    ORDER BY "courseId", "playerId", "time" ASC
                )
                SELECT
                    "courseId",
                    "playerId",
                    RANK() OVER (PARTITION BY "courseId" ORDER BY "best_time" ASC) AS "leaderboard_position"
                FROM best_times
                ORDER BY "courseId", "leaderboard_position", "best_time"
            ) b ON time."courseId" = b."courseId" AND time."playerId" = b."playerId"
            WHERE time."playerId" = ${req.params.player_id}
            ORDER BY time."courseId", time
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

router.get('/completions/unfinished/:player_id', async function(req, res, next) {
    try {
        const result: PlayerTime[] = await prisma.$queryRaw`
            SELECT
                course.name, course."courseId" AS course_id, NULL AS fastest_time, NULL AS deaths, NULL AS leaderboard_position, NULL AS time_id
            FROM (
                SELECT
                    DISTINCT ON ("courseId")
                    *
                FROM time
                WHERE time."playerId" = ${req.params.player_id}
            ) a
            RIGHT JOIN course ON a."courseId" = course."courseId"
            WHERE "playerId" IS NULL
            ;
        `;
        res.status(200).json(json(result));
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

export default router;