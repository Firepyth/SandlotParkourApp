import { prisma } from '../lib/prisma.js';
import logger from 'morgan';
import "dotenv/config";
import express from 'express';
import apiRouter from './routes/index.js';
import schedule from 'node-schedule';
import cors from 'cors';
import { updatePlayers, insertPlayers } from './helpers/managePlayers.js';
const app = express();

app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true
  }
));
app.use(logger('dev'));
app.use(express.json());

app.use('/api', apiRouter);

try {
  const currentPlayers: {playerId: string}[] = await prisma.$queryRaw`SELECT DISTINCT("playerId") FROM time`;
  const existingPlayers: {playerId: string, name: string}[] = await prisma.$queryRaw`SELECT * FROM player`;
  if (currentPlayers.length !== existingPlayers.length) {
    console.log("Loading new players into the database.");
    await insertPlayers();
  } else {
    console.log("Player count up to date.");
  }
} catch (e) {
  console.log("Failed to fetch records from database.");
}

schedule.scheduleJob('0 0 3 * * *', async () => {
  await updatePlayers();
  insertPlayers();
});

export default app;