import logger from 'morgan';
import "dotenv/config";
import express from 'express';
import apiRouter from './routes/index.js';
const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/api', apiRouter);

export default app;

// async function main() {
//   // Create a new user with a post
  // const result = await prisma.$queryRaw`
  //   SELECT *
  //   FROM (
  //       SELECT 
  //           DISTINCT ON (course."courseId")
  //           course."courseId", name, created, time.time AS "record_time", time."playerId" AS "fastest_player", avg_times.avg_time, avg_times.avg_deaths
  //       FROM course
  //       JOIN time ON time."courseId" = course."courseId"
  //       JOIN (
  //           SELECT AVG(p1.time) AS avg_time, AVG(p1.deaths) AS avg_deaths, p1."courseId"
  //           FROM (
  //               SELECT p1.* 
  //               FROM time p1
  //               JOIN (
  //                   SELECT min(achieved) "runDate", CONCAT("courseId", "playerId") "courseId" FROM time GROUP BY CONCAT("courseId", "playerId")
  //               ) AS p2 
  //               ON p1.achieved = p2."runDate"
  //               AND CONCAT(p1."courseId", p1."playerId") = p2."courseId"
  //               ORDER BY "courseId"
  //           ) AS p1
  //           GROUP BY p1."courseId"
  //       ) AS avg_times ON course."courseId" = avg_times."courseId"
  //       ORDER BY course."courseId", time
  //   ) result
  //   ORDER BY result.name 
  //   ;
  // `;
//   console.log('Created user:', result);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })