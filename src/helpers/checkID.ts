import { prisma } from '../../lib/prisma.js';

export const checkForPlayer = async (player_id: string): Promise<boolean> => {
    const player: {playerId: string}[] = await prisma.$queryRaw`
        SELECT DISTINCT("playerId")
        FROM time
        WHERE "playerId" = ${player_id}
        ;
    `;
    if (player.length === 0) {
        return false;
    }
    return true;
}

export const checkForCourse = async (course_id: string): Promise<boolean> => {
    const course: {courseId: string}[] = await prisma.$queryRaw`
        SELECT "courseId"
        FROM course
        WHERE "courseId" = ${course_id}
    `;

    if (course.length === 0) {
        return false;
    }
    return true;
}