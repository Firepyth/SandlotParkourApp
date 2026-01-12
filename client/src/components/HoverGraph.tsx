import { useEffect, useRef, useState } from "react";
import { toDate, toTime } from "../helpers/convert";
import { H2, Link, PlayerImg } from "./stylePresets/presetStyles";

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

const HoverTitle = ({hoverContent}: {hoverContent: HoverContent}) => {
    return <H2 className="mb-[0] leading-[2.5rem] whitespace-nowrap">
        <PlayerImg player_id={hoverContent.player_id} player_name={hoverContent.player_name} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.375rem]"></PlayerImg>
        {hoverContent.player_name}
    </H2>
}

export default function HoverGraph ({hoverContent}: {hoverContent: HoverContent}) {
    const ref = useRef<HTMLInputElement | null>(null);
    const [target, setTarget] = useState<Element>();

    useEffect(() => {
        const currentElement = ref.current;
        if (!currentElement) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setTarget(entry.target);
                
            }
        });

        resizeObserver.observe(currentElement);

        return () => {
            resizeObserver.unobserve(currentElement);
        };
    }, []);

    return <div ref={ref} className="absolute bg-[#232323] p-[1rem] border-[1px] border-[#404040] rounded-[.5rem] z-1" 
                style={{bottom: `${window.innerHeight - hoverContent.y + 5}px`,
                right: window.innerWidth / 2 < hoverContent.x ? `${(target?.clientWidth || Infinity) >= hoverContent.x - 5 ? window.innerWidth - (target?.clientWidth || Infinity) - 2 : window.innerWidth - hoverContent.x + 5}px` : 'auto',
                left: window.innerWidth / 2 >= hoverContent.x ? `${(target?.clientWidth || Infinity) >= window.innerWidth - hoverContent.x - 5 ? window.innerWidth - (target?.clientWidth || Infinity) - 2 : hoverContent.x + 5}px` : 'auto',
                opacity: target?.clientWidth === undefined ? 0 : 100
            }}
                onPointerDown={(e) => e.stopPropagation()}>
        {hoverContent?.route ? <Link to={hoverContent?.route}><HoverTitle hoverContent={hoverContent}/></Link> : <HoverTitle hoverContent={hoverContent} />}
        <p className="whitespace-nowrap">{toTime(hoverContent.time)} ({hoverContent.deaths} deaths)</p>
        <p className="whitespace-nowrap">{toDate(hoverContent.achieved)}</p>
    </div>
}