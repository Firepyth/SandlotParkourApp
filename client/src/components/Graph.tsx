import { useEffect, useRef, useState, type JSX } from "react";
import { toDate, toTime } from "../helpers/convert";
import type { NavigateFunction } from "react-router";
import { H2, PlayerImg } from "./stylePresets/presetStyles";

interface Completion {
    time: number;
    achieved: string;
    deaths: number;
    player_id: string;
    player_name: string;
}

interface HoverContent extends Completion {
    x: number;
    y: number;
}

interface GraphParams {
    graphParams: {
        hoverContent?: HoverContent;
        setHoverContent: Function;
        id?: number;
        navigate?: NavigateFunction;
        completions: Completion[];
    },
    isPending: boolean;
    error: Error | null;
}

const createPath = (completions: Completion[], width: number, height: number, setHoverContent: Function | undefined = undefined, navigate: NavigateFunction | undefined = undefined, course_id: number = 0) => {
    let path: string;
    let lines: JSX.Element[] = [];
    let text: JSX.Element[] = [];
    let images: JSX.Element[] = [];
    let circles: JSX.Element[] = [];

    if (completions !== null) {
        const maxTime = completions[0].time;
        const minTime = completions[completions.length - 1].time;

        const firstDate = Date.parse(completions[0].achieved);
        const lastDate= Date.parse(completions[completions.length - 1].achieved);

        const day = 1000*60*60*24;

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
                if ((maxTime - minTime) / timeIncrements[i] < 8) {
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

            const startTime = Math.floor(minTime / timeIncrement) * timeIncrement;
            const endTime = Math.ceil(maxTime / timeIncrement) * timeIncrement + 1;

            let currentTime = Math.floor(startTime / timeIncrement) * timeIncrement;
            while (currentTime < endTime) {
                const y = (endTime - currentTime) / (endTime - startTime) * (height - 150) + 50;
                lines.push(<line stroke="#404040" x1={0} x2={1000} y1={y} y2={y} z={-2}/>);
                text.push(<text x={0} y={y - 10} fill="#999999" stroke="none" className="font-rubik">{toTime(currentTime)}</text>);
                currentTime += timeIncrement;
            }

            let currentDate = Math.floor(firstDate / dateIncrement) * dateIncrement;
            while (currentDate < Math.ceil(lastDate / dateIncrement) * dateIncrement + 1) {
                const x = (currentDate - firstDate) / (lastDate - firstDate) * (width - 200) + 150;
                lines.push(<line stroke="#404040" x1={x} x2={x} y1={0} y2={height - 50}/>);
                text.push(<text x={x - 50} y={height - 25} fill="#999999" stroke="none" className="font-rubik">{toDate(new Date(currentDate).toISOString())}</text>);
                currentDate += dateIncrement;
            }

            let lastY = Math.abs(completions[0].time - endTime) / (endTime - startTime) * (height - 150) + 50;
            path = `M150 ${lastY} `;
            completions.forEach((item) => {
                const x = (Date.parse(item.achieved) - firstDate) / (lastDate - firstDate) * (width - 200) + 150;
                const y = Math.abs(item.time - endTime) / (endTime - startTime) * (height - 150) + 50;
                
                if (item.player_id !== undefined && setHoverContent !== undefined) images.push(
                    <image x={x + 6} y={y - 30} width={25} height={25} href={`https://mc-heads.net/avatar/${item.player_id}`} className={navigate !== undefined ? 'cursor-pointer' : ''}
                    onMouseMove={(e) => setHoverContent({...item, x: e.pageX, y: e.pageY})} onMouseLeave={() => setHoverContent(undefined)}
                    onClick={() => navigate !== undefined && course_id !== 0 ? navigate(`/players/${item.player_id}/${course_id}`) : undefined}/>
                );
                circles.push(<circle r="3px" cx={x} cy={y} fill="#d41b36"/>);
                path += `L${x} ${lastY}`;
                lastY = y;
                path += `L${x} ${y}`;
            });
        } else {
            let currentTime = Math.ceil(minTime / 1000) * 1000 - 4 * 1000;
            for (let i = 0; i < 8; i++) {
                const y = Math.abs(currentTime - (maxTime + 4 * 1000)) / (8 * 1000) * (height - 150) + 50;
                lines.push(<line stroke="#404040" x1={0} x2={width} y1={y} y2={y}/>);
                text.push(<text x={0} y={y - 10} fill="#999999" stroke="none" className="font-rubik">{toTime(currentTime)}</text>);
                currentTime += 1000;
            }

            let currentDate = Math.floor(firstDate / day) * day;
            for (let i = 0; i < 7; i++) {
                const x = i / 6 * (width - 200) + 150;
                lines.push(<line stroke="#404040" x1={x} x2={x} y1={0} y2={height - 50}/>);
                text.push(<text x={x - 50} y={height - 25} fill="#999999" stroke="none" className="font-rubik">{toDate(new Date(currentDate).toISOString())}</text>);
                currentDate += day;
            }

            path = `M150 ${(height - 150) / 2 + 50} L${width - 50} ${(height - 150) / 2 + 50}`;
        }
    } else {
        text.push(<text x={width / 2 - 159.5} y={height / 2 - 19.5} fill="#999999" stroke="none" fontSize={32} className="font-rubik">No completions found</text>)
        path = '';
    }

    return <>
        {...lines}
        {...text}
        {...circles}
        {...images}
        {path !== '' ? <path d={path}/> : ''}
    </>
}

export default function Graph ({graphParams: {hoverContent, completions, setHoverContent, navigate, id}, isPending, error}: GraphParams) {
    const ref = useRef<HTMLInputElement | null>(null);
    const [dimensions, setDimensions] = useState<{width: number, height: number}>();

    useEffect(() => {
        const currentElement = ref.current;
        if (!currentElement) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width: Math.floor(width), height: Math.floor(height) });
                
            }
        });

        resizeObserver.observe(currentElement);

        return () => {
            resizeObserver.unobserve(currentElement);
        };
    }, []);

    return <>
        {hoverContent !== undefined ? <div className="absolute bg-[#232323] p-[1rem] border-[1px] border-[#404040] rounded-[.5rem]" style={{bottom: `${window.innerHeight - hoverContent.y + 2}px`, right: `${window.innerWidth - hoverContent.x + 5}px`}}>
            <H2 className="mb-[0] leading-[2.5rem]">
                <PlayerImg player_id={hoverContent.player_id} player_name={hoverContent.player_name} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.375rem]"></PlayerImg>
                {hoverContent.player_name}
            </H2>
            <p>{toTime(hoverContent.time)} ({hoverContent.deaths} deaths)</p>
            <p>{toDate(hoverContent.achieved)}</p>
        </div> : ''}
        <div ref={ref} className="bg-[#333333] w-full h-full rounded-[.25rem] p-[1rem] flex flex-col flex-[1_1_auto] overflow-hidden">
            {isPending ? <p>Loading...</p> : error ? <p>Error loading data.</p> :
                <svg viewBox={`0 0 ${dimensions !== undefined ? dimensions.width * 1.5 : 0} ${dimensions !== undefined ? dimensions.height * 1.5: 0}`}>
                    <g stroke="#d41b36" fill="none" strokeWidth=".25rem" strokeLinecap="round" strokeLinejoin="round">
                        {dimensions !== undefined ? createPath(completions, dimensions.width * 1.5, dimensions.height * 1.5, setHoverContent, navigate, id !== undefined ? Number(id) : 0) : ''}
                    </g>
                </svg>
            }
        </div>
    </>
}