import { prisma } from '../../lib/prisma.js';

interface ExistingPlayer {
    uuid: string;
    name: string;
}

interface Player {
    uuid: string;
}

const getName = async (uuid: string): Promise<string> => {
    let name: string = '';
    if (uuid.substring(0, 16) === '0000000000000000') {
        try {
            const xuid = parseInt(uuid, 16)
            const res = await fetch(`https://playerdb.co/api/player/xbox/${xuid}`, {
                headers: {
                    "user-agent": "w0487205@nscc.ca"
                }
            });
            const json = await res.json();
            name = json.data.player ? json.data.player.username : '';
            if (name === '') {
                console.log('Fetch error. Using fallback API.');
                const xuid = parseInt(uuid, 16)
                const res = await fetch(`https://api.geysermc.org/v2/xbox/gamertag/${xuid}`);
                const json = await res.json();
                name = json.gamertag ? json.gamertag : '';
            }
            if (name === '') {
                console.log('Duplicate fetch error. Using fallback API.');
                const bedrockUuid: string = `${uuid.slice(0, 7)}-${uuid.slice(7,11)}-${uuid.slice(11,15)}-${uuid.slice(15,20)}-${uuid.slice(20)}`;
                const res = await fetch(`https://mcprofile.io/api/v1/bedrock/fuid/${bedrockUuid}`);
                if (res.ok === true) {
                    const json = await res.json();
                    name = json.gamertag ? json.gamertag : '';
                }
            }
        } catch (e) {
            console.log('Fetch error: ', e);
        }
    }
    else {
        try {
            const res = await fetch(`https://playerdb.co/api/player/minecraft/${uuid}`, {
                headers: {
                    "user-agent": "w0487205@nscc.ca"
                }
            });
            const json = await res.json();
            name = json.data ? json.data.player.username : '';
        } catch (e) {
            console.log('Fetch error: ', e);
        }
    }
    return name;
}

export const insertPlayers = async () => {
    const players: Player[] = await prisma.$queryRaw`
        SELECT
            DISTINCT("playerId") AS uuid
        FROM time
        WHERE "playerId" NOT IN (SELECT "playerId" AS uuid FROM player)
    `;

    let playersToInsert: string[] = [];

    for (let i: number = 0; i < players.length; i++) {
        const player = players[i];

        let name: string = await getName(player.uuid);

        if (name === '') {
            console.log(`Error: Name is undefined due to a fetch error. Skipping player ${i + 1}/${players.length}.`);
        }
        else {
            console.log(`Inserting: ${i + 1}/${players.length}. Name: ${name}`);
            playersToInsert.push(`('${players[i].uuid}', '${name}')`);
        }

        await new Promise(r => setTimeout(r, 200));
    };

    if (playersToInsert.length >= 1) {
        const result: number = await prisma.$executeRawUnsafe(`
            INSERT INTO player ("playerId", name)
            VALUES ${playersToInsert.join(',')}
            ON CONFLICT ("playerId") DO UPDATE
                SET "playerId" = EXCLUDED."playerId",
                    name = EXCLUDED.name
        `);
        return console.log('Rows inserted: ', result);
    }
    return console.log("All names up to date");
}

export const updatePlayers = async () => {
    const existingPlayers: ExistingPlayer[] = await prisma.$queryRaw`
        SELECT
            "playerId" AS uuid,
            name
        FROM player
        ;
    `;

    let playersToUpdate: String[] = [];

    for (let i: number = 0; i < existingPlayers.length; i++) {
        const player = existingPlayers[i];

        let name: string = await getName(player.uuid);

        if (name === '') {
            console.log(`Error: Name is undefined due to a fetch error. Skipping player ${i + 1}/${existingPlayers.length}.`);
        }
        else if (name === player.name) {
            console.log(`Player ${i + 1}/${existingPlayers.length} up to date. Name: ${player.name}`);
        }
        else {
            console.log(`Updating: ${i + 1}/${existingPlayers.length}. Name: ${name}`);
            playersToUpdate.push(`('${existingPlayers[i].uuid}', '${name}')`);
        }

        await new Promise(r => setTimeout(r, 200));
    };

    if (playersToUpdate.length >= 1) {
        const result: number = await prisma.$executeRawUnsafe(`
            INSERT INTO player ("playerId", name)
            VALUES ${playersToUpdate.join(',')}
            ON CONFLICT ("playerId") DO UPDATE
                SET "playerId" = EXCLUDED."playerId",
                    name = EXCLUDED.name
        `);
        return console.log('Rows inserted: ', result);
    }
    return console.log("All names up to date");
}