import { toDate, toTime } from "./convert";

interface completion {
    time: number;
    achieved: string;
    deaths: number;
    player_id?: string;
    player_name?: string;
}

export default function createPath (completions: completion[]) {
    let path: string;
    let elements = [];

    if (completions !== null) {
        const maxTime = completions[0].time;
        const minTime = completions[completions.length - 1].time;

        const firstDate = Date.parse(completions[0].achieved);
        const lastDate= Date.parse(completions[completions.length - 1].achieved);

        const day = 1000*60*60*24;

        let lastY = 50;
        if (completions.length > 1) {
            const timeIncrements = [
                250,
                500,
                1000,
                2000,
                5000,
                10000,
                15000,
                20000,
                30000,
                60000,
                120000,
                180000,
                240000,
                300000,
                450000,
                600000,
                900000,
                1200000,
                1800000,
                3600000,
                7200000,
                14400000,
                28800000,
                57600000
            ];

            let timeIncrement;

            for (let i = 0; i < timeIncrements.length; i++) {
                if ((maxTime - minTime) / timeIncrements[i] < 10) {
                    timeIncrement = timeIncrements[i];
                    break;
                }
            }

            const dateIncrements = [
                1 * day,
                2 * day,
                3 * day,
                4 * day,
                7 * day,
                14 * day,
                30 * day,
                60 * day,
                120 * day,
                180 * day,
                365 * day
            ];

            let dateIncrement;

            for (let i = 0; i < dateIncrements.length; i++) {
                if ((lastDate - firstDate) / dateIncrements[i] < 8) {
                    dateIncrement = dateIncrements[i];
                    break;
                }
            }

            if (dateIncrement === undefined) dateIncrement = 365 * day;
            if (timeIncrement === undefined) timeIncrement = 480000;

            let currentTime = Math.ceil(minTime / timeIncrement) * timeIncrement;
            while (currentTime < maxTime) {
                const y = Math.abs(currentTime - maxTime) / (maxTime - minTime) * 850 + 50;
                elements.push(<line stroke="#404040" x1={0} x2={1000} y1={y} y2={y}/>);
                elements.push(<text x={0} y={y - 10} fill="#999999" stroke="none" className="font-rubik">{toTime(currentTime)}</text>);
                currentTime += timeIncrement;
            }

            path = "M150 50 ";
            let currentDate = Math.floor(firstDate / dateIncrement) * dateIncrement;
            while (currentDate < lastDate) {
                const x = (currentDate - firstDate) / (lastDate - firstDate) * 800 + 150;
                elements.push(<line stroke="#404040" x1={x} x2={x} y1={0} y2={950}/>);
                elements.push(<text x={x - 50} y={975} fill="#999999" stroke="none" className="font-rubik">{toDate(new Date(currentDate).toISOString())}</text>);
                currentDate += dateIncrement;
            }

            completions.forEach((item) => {
                const x = (Date.parse(item.achieved) - firstDate) / (lastDate - firstDate) * 800 + 150;
                const y = Math.abs(item.time - maxTime) / (maxTime - minTime) * 850 + 50;
                
                if (item.player_id !== undefined) elements.push(<image x={x + 6} y={y - 30} width={25} height={25} href={`https://mc-heads.net/avatar/${item.player_id}`}/>);
                elements.push(<circle r="3px" cx={x} cy={y} fill="#d41b36"/>);
                path += `L${x} ${lastY}`;
                lastY = y;
                path += `L${x} ${y}`;
            });

            path += 'L950 900';
        } else {
            let currentTime = Math.ceil(minTime / 1000) * 1000 - 4 * 1000;
            for (let i = 0; i < 8; i++) {
                const y = Math.abs(currentTime - (maxTime + 4 * 1000)) / (8 * 1000) * 850 + 50;
                elements.push(<line stroke="#404040" x1={0} x2={1000} y1={y} y2={y}/>);
                elements.push(<text x={0} y={y - 10} fill="#999999" stroke="none" className="font-rubik">{toTime(currentTime)}</text>);
                currentTime += 1000;
            }

            let currentDate = Math.floor(firstDate / day) * day;
            for (let i = 0; i < 7; i++) {
                const x = i / 6 * 800 + 150;
                elements.push(<line stroke="#404040" x1={x} x2={x} y1={0} y2={950}/>);
                elements.push(<text x={x - 50} y={975} fill="#999999" stroke="none" className="font-rubik">{toDate(new Date(currentDate).toISOString())}</text>);
                currentDate += day;
            }

            path = 'M150 475 L950 475';
        }
    } else {
        elements.push(<text x={330} y={490} fill="#999999" stroke="none" fontSize={32} className="font-rubik">No completions found</text>)
        path = '';
    }

    return <>
        {...elements}
        {path !== '' ? <path d={path}/> : ''}
    </>
}