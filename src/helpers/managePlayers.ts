import { prisma } from '../../lib/prisma.js';

interface ExistingPlayer {
    uuid: string;
    name: string;
}

interface Player {
    uuid: string;
}

export const insertPlayers = async () => {
    const players: Player[] = await prisma.$queryRaw`
        SELECT
            DISTINCT("playerId") AS uuid
        FROM time
        ;
    `;
    const existingPlayers: ExistingPlayer[] = await prisma.$queryRaw`
        SELECT
            "playerId" AS uuid,
            name
        FROM player
        ;
    `;

    let playersToInsert: string[] = [];

    for (let i: number = 0; i < players.length; i++) {
        const player = players[i];
        let playerExists: boolean = false;

        for (let j: number = 0; j < existingPlayers.length; j++) {
            if (player.uuid.trim() === existingPlayers[j].uuid.trim()) {
                playerExists = true;
                break;
            }
        };

        if (playerExists === false) {
            let name: string = '';
            if (player.uuid.substring(0, 16) === '0000000000000000') {
                try {
                    const bedrockUuid: string = `${player.uuid.slice(0, 7)}-${player.uuid.slice(7,11)}-${player.uuid.slice(11,15)}-${player.uuid.slice(15,20)}-${player.uuid.slice(20)}`;
                    const res = await fetch(`https://mcprofile.io/api/v1/bedrock/fuid/${bedrockUuid}`);
                    if (res.ok === true) {
                        const json = await res.json();
                        name = json.gamertag ? json.gamertag : '';
                    }
                    if (name === '') {
                        console.log("Error: Name is undefined due to a fetch failure. Using fallback API.");
                        const xuid = parseInt(player.uuid, 16)
                        const res = await fetch(`https://api.geysermc.org/v2/xbox/gamertag/${xuid}`);
                        const json = await res.json();
                        name = json.gamertag ? json.gamertag : '';
                    }
                } catch (e) {
                    console.log('Fetch error: ', e);
                    name = '';
                }
            }
            else {
                try {
                    const res = await fetch(`https://playerdb.co/api/player/minecraft/${player.uuid}`, {
                        headers: {
                            "user-agent": "w0487205@nscc.ca"
                        }
                    });
                    const json = await res.json();
                    name = json.data ? json.data.player.username : '';
                } catch (e) {
                    console.log('Fetch error: ', e);
                    name = '';
                }
            }

            if (name === '') {
                console.log(`Error: Name is undefined due to a fetch error. Skipping player #${i + 1}.`);
            }
            else {
                console.log(`Inserting: ${i + 1}/${players.length}`);
                playersToInsert.push(`('${players[i].uuid}', '${name}')`);
            }

            await new Promise(r => setTimeout(r, 500));
        } else {
            console.log(`Player already exists. Skipping ${i + 1}/${players.length}`);
        }
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
    const players: Player[] = await prisma.$queryRaw`
        SELECT
            DISTINCT("playerId") AS uuid
        FROM time
        ;
    `;
    const existingPlayers: ExistingPlayer[] = await prisma.$queryRaw`
        SELECT
            "playerId" AS uuid,
            name
        FROM player
        ;
    `;

    let playersToInsert: string[] = [];

    for (let i: number = 0; i < players.length; i++) {
        const player = players[i];
        let existingIndex: false | number = false;

        for (let j: number = 0; j < existingPlayers.length; j++) {
            if (player.uuid.trim() === existingPlayers[j].uuid.trim()) {
                existingIndex = j;
                break;
            }
        };

        let name: string = '';
        if (player.uuid.substring(0, 16) === '0000000000000000') {
            try {
                const bedrockUuid: string = `${player.uuid.slice(0, 7)}-${player.uuid.slice(7,11)}-${player.uuid.slice(11,15)}-${player.uuid.slice(15,20)}-${player.uuid.slice(20)}`;
                const res = await fetch(`https://mcprofile.io/api/v1/bedrock/fuid/${bedrockUuid}`);
                if (res.ok === true) {
                    const json = await res.json();
                    name = json.gamertag ? json.gamertag : '';
                }
                if (name === '') {
                    console.log("Error: Name is undefined due to a fetch failure. Using fallback API.");
                    const xuid = parseInt(player.uuid, 16)
                    const res = await fetch(`https://api.geysermc.org/v2/xbox/gamertag/${xuid}`);
                    const json = await res.json();
                    name = json.gamertag ? json.gamertag : '';
                }
            } catch (e) {
                console.log('Fetch error: ', e);
                name = '';
            }
        }
        else {
            try {
                const res = await fetch(`https://playerdb.co/api/player/minecraft/${player.uuid}`, {
                    headers: {
                        "user-agent": "w0487205@nscc.ca"
                    }
                });
                const json = await res.json();
                name = json.data ? json.data.player.username : '';
            } catch (e) {
                console.log('Fetch error: ', e);
                name = '';
            }
        }

        if (name === '') {
            console.log(`Error: Name is undefined due to a fetch error. Skipping player #${i + 1}.`);
        }
        else if (existingIndex !== false) {
            if (name !== existingPlayers[existingIndex].name) {
                console.log(`Updating: ${i + 1}/${players.length}`);
                playersToInsert.push(`('${players[i].uuid}', '${name}')`);
            }
        } else {
            console.log(`Inserting: ${i + 1}/${players.length}`);
            playersToInsert.push(`('${players[i].uuid}', '${name}')`);
        }

        await new Promise(r => setTimeout(r, 750));
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