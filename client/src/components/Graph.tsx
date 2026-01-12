import { useEffect, useRef, useState, type JSX, memo, useMemo } from "react";
import { toDate, toTime } from "../helpers/convert";
import type { NavigateFunction } from "react-router";
import HoverGraph from "./HoverGraph";

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
    route?: string;
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

interface CreatePathParams {
    completions: Completion[];
    width: number;
    height: number;
    setHoverContent: Function | undefined;
    navigate: NavigateFunction | undefined;
    course_id: number;
}

const handleInteract = async (e: React.PointerEvent<SVGRectElement>, navigate: NavigateFunction | undefined, hoverContentParams: HoverContent, course_id: number, setHoverContent: Function) => {
    if (e.pointerType === 'touch') {
        await setHoverContent(undefined);
        await setHoverContent({...hoverContentParams, route: navigate ? `/players/${hoverContentParams.player_id}/${course_id}` : undefined});
    } else {
        navigate !== undefined && course_id !== 0 ? navigate(`/players/${hoverContentParams.player_id}/${course_id}`) : undefined;
    }
    e.stopPropagation();
}

const handleMove = (e: React.PointerEvent<SVGRectElement>, hoverContentParams: HoverContent, setHoverContent: Function) => {
    if (e.pointerType !== 'touch') setHoverContent(hoverContentParams);
}

const handleLeave = (e: React.PointerEvent<SVGRectElement>, setHoverContent: Function) => {
    if (e.pointerType !== 'touch') setHoverContent(undefined);
}

const CreatePath = memo(({params: {completions, width, height, setHoverContent = undefined, navigate = undefined, course_id = 0}}: {params: CreatePathParams}) => {
    let path: string;
    let lines: JSX.Element[] = [];
    let text: JSX.Element[] = [];
    let images: JSX.Element[] = [];
    let circles: JSX.Element[] = [];

    if (completions !== null) {
        const maxTime = completions[0].time;
        const minTime = completions[completions.length - 1].time;

        const minDate = Date.parse(completions[0].achieved);
        const maxDate= Date.parse(completions[completions.length - 1].achieved);

        const day = 1000*60*60*24;

        const startX = 150
        const endX = 50;
        const startY = 20;
        const endY = 50;

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
            
            let dateIncrement = day;
            
            while ((maxDate - minDate) / dateIncrement > (width - endX - startX) / 150) {
                dateIncrement = Math.ceil(dateIncrement * 1.1);
            }

            if (timeIncrement === undefined) timeIncrement = 480000;

            const startTime = Math.floor(minTime / timeIncrement) * timeIncrement;
            const endTime = Math.ceil(maxTime / timeIncrement) * timeIncrement;

            let currentIndex = 0;
            let currentTime = startTime;
            let endIndex = Math.ceil(endTime / timeIncrement) - Math.floor(startTime / timeIncrement);
            while (currentIndex <= endIndex) {
                const y = ((currentIndex - endIndex) / -endIndex) * (height - endY - startY) + startY;
                lines.push(<line stroke="#404040" x1={startX - 20} x2={width - endX + 20} y1={y} y2={y} z={-2}/>);
                text.push(<text x={startX - 130} y={y + 5} fill="#999999" stroke="none" className="font-rubik">{toTime(currentTime)}</text>);
                currentTime += timeIncrement;
                currentIndex++;
            }

            const startDate = dateIncrement === day ? minDate : Math.floor(minDate / day) * day;
            const endDate = dateIncrement === day ? maxDate : Math.ceil((maxDate - startDate) / dateIncrement) * dateIncrement + startDate;

            currentIndex = 0;
            let currentDate = startDate;
            endIndex = Math.floor(endDate / dateIncrement) - Math.floor(startDate / dateIncrement) || 1;
            while (currentIndex <= endIndex) {
                const x = (currentIndex / endIndex) * (width - endX - startX) + startX;
                lines.push(<line stroke="#404040" x1={x} x2={x} y1={0} y2={height - endY + 20}/>);
                text.push(<text x={x - 50} y={height - endY + 45} fill="#999999" stroke="none" className="font-rubik">{toDate(new Date(currentDate).toISOString())}</text>);
                if (endIndex === 1) break;
                currentDate += dateIncrement;
                currentIndex++;
            }

            let lastY = (endTime - completions[0].time) / (endTime - startTime) * (height - endY - startY) + startY;
            path = `M${(Date.parse(completions[0].achieved) - startDate) / (endDate - startDate) * (width - endX - startX) + startX} ${lastY} `;
            completions.forEach((item) => {
                const x = (Date.parse(item.achieved) - startDate) / (endDate - startDate) * (width - endX - startX) + startX;
                const y = (endTime - item.time) / (endTime - startTime) * (height - endY - startY) + startY;
                
                if (item.player_id !== undefined && setHoverContent !== undefined) images.push(
                    <>
                        <image x={x + 6} y={y - 30} width={25} height={25} href={`https://mc-heads.net/avatar/${item.player_id}`}/>
                        <rect x={x + 6} y={y - 30} width={25} height={25}
                            onPointerMove={(e) => handleMove(e, {...item, x: e.pageX, y: e.pageY}, setHoverContent)} onPointerLeave={(e) => handleLeave(e, setHoverContent)}
                            onPointerDown={(e) => handleInteract(e, navigate, {...item, x: e.pageX, y: e.pageY}, course_id, setHoverContent)}
                            stroke="#00000000" strokeWidth={20} fill="#00000000"
                            className={navigate !== undefined ? 'cursor-pointer' : ''}/>
                    </>
                );
                circles.push(<circle r="3px" cx={x} cy={y} fill="#d41b36"/>);
                path += `L${x} ${lastY}`;
                lastY = y;
                path += `L${x} ${y}`;
            });
        } else {
            let startTime = Math.floor(minTime / 1000) * 1000 - 4000;
            let endTime = startTime + 8000;
            let currentTime = Math.ceil(minTime / 1000) * 1000 - 4 * 1000;
            for (let i = 0; i <= 7; i++) {
                const y = ((i - 7) / -7) * (height - endY - startY) + startY;
                lines.push(<line stroke="#404040" x1={startX - 20} x2={width - endX + 20} y1={y} y2={y}/>);
                text.push(<text x={startX - 130} y={y + 5} fill="#999999" stroke="none" className="font-rubik">{toTime(currentTime)}</text>);
                currentTime += 1000;
            }

            let currentDate = minDate;
            for (let i = 0; i <= Math.floor((width - endX - startX) / 100); i++) {
                const x = (i / Math.floor((width - endX - startX) / 100)) * (width - endX - startX) + startX;
                lines.push(<line stroke="#404040" x1={x} x2={x} y1={0} y2={height - endY + 20}/>);
                text.push(<text x={x - 50} y={height - endY + 45} fill="#999999" stroke="none" className="font-rubik">{toDate(new Date(currentDate).toISOString())}</text>);
                currentDate += day;
            }
            
            const y = (endTime - minTime) / (7000) * (height - endY - startY) + startY;
            path = `M${startX} ${y} L${width - 50} ${y}`;
            circles.push(<circle r="3px" cx={startX} cy={y} fill="#d41b36"/>);
            if (completions[0].player_id !== undefined && setHoverContent !== undefined) images.push(
                <>
                    <image x={startX + 6} y={y - 30} width={25} height={25} href={`https://mc-heads.net/avatar/${completions[0].player_id}`}/>
                    <rect x={startX + 6} y={y - 30} height={25} width={25} className={navigate !== undefined ? 'cursor-pointer' : ''}
                        onPointerMove={(e) => handleMove(e, {...completions[0], x: e.pageX, y: e.pageY}, setHoverContent)} onPointerLeave={(e) => handleLeave(e, setHoverContent)}
                        onPointerDown={(e) => handleInteract(e, navigate, {...completions[0], x: e.pageX, y: e.pageY}, course_id, setHoverContent)}
                        stroke="#00000000" strokeWidth={20} fill="#00000000"/>
                </>
            );
        }
    } else {
        text.push(<text x={width / 2 - 159.5} y={height / 2 - 19.5} fill="#999999" stroke="none" fontSize={32} className="font-rubik">No completions found</text>)
        path = '';
    }

    return <>
        {...lines}
        {...text}
        {...circles}
        {path !== '' ? <path d={path}/> : ''}
        {...images}
    </>
});

export default function Graph ({graphParams: {hoverContent, completions, setHoverContent, navigate, id}, isPending, error}: GraphParams) {
    const ref = useRef<HTMLInputElement | null>(null);
    const [dimensions, setDimensions] = useState<{width: number, height: number}>();

    useEffect(() => {
        const currentElement = ref.current;
        if (!currentElement) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width: width, height: height });
                
            }
        });

        resizeObserver.observe(currentElement);

        return () => {
            resizeObserver.unobserve(currentElement);
        };
    }, []);

    const scale = Math.max(dimensions ? 420 / dimensions.width : 1.5, 1.5);

    const createPathParams = useMemo(() => {
        return {
            completions,
            width: dimensions !== undefined ? dimensions.width * scale : 0,
            height: dimensions !== undefined ? dimensions.height * scale : 0,
            setHoverContent,
            navigate,
            course_id: id !== undefined ? Number(id) : 0
        }
    }, [dimensions, completions]);

    return <>
        {hoverContent !== undefined ? <HoverGraph hoverContent={hoverContent}/> : ''}
        <div ref={ref} className="bg-[#333333] w-full h-full rounded-[.25rem] p-[1rem] flex flex-col flex-[1_1_auto] overflow-hidden max-h-[calc(40vh_+_10rem)] min-h-[calc(40vh_+_10rem)] xl:max-h-none xl:min-h-auto"
             onPointerDown={() => setHoverContent(undefined)}>
            {isPending ? <p>Loading...</p> : error ? <p>Error loading data.</p> :
                <svg viewBox={`0 0 ${dimensions !== undefined ? dimensions.width * scale : 0} ${dimensions !== undefined ? dimensions.height * scale: 0}`}>
                    <g stroke="#d41b36" fill="none" strokeWidth=".25rem" strokeLinecap="round" strokeLinejoin="round">
                        {dimensions !== undefined && createPathParams.completions[0].time !== 0 ? <CreatePath params={createPathParams} /> : ''}
                    </g>
                </svg>
            }
        </div>
    </>
}