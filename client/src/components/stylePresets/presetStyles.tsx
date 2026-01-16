import { Link as ReactLink } from "react-router";
import { useIsMobile } from "../../helpers/hooks";

export const H1 = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <h1 className={`border-b-[2px] border-[#404040] m-[3.75rem_0_2rem_0] text-[2rem]/[2rem] pb-[.375em] ${className}`}>{children}</h1>
}

export const H2 = ({children, className = '', ref}: {children: React.ReactNode, className?: string, ref?: React.RefObject<HTMLHeadingElement | null>}) => {
    return <h2 ref={ref ? ref : undefined} className={`pt-[4rem] mt-[-4rem] font-minecraft text-[1.5rem] mb-[.75em] ${className}`}>{children}</h2>
}

export const TableContainer = ({children, className = '', onClick = undefined}: {children: React.ReactNode, className?: string, onClick?: Function | undefined}) => {
    return <div className={`bg-[#232323] rounded-[.5rem] p-[1.5rem] flex flex-col flex-[1_1_auto] overflow-hidden ${className}`} onClick={onClick !== undefined ? (e) => onClick(e) :  () => {}}>{children}</div>
}

export const Table = ({children, className = '', strictHeight = false}: {children: React.ReactNode, className?: string, strictHeight?: boolean}) => {
    return <div className={`overflow-y-auto ${strictHeight ? '' : 'h-full'} flex-[1_1_auto] border-b-[2px] border-[#404040] max-h-[calc(40vh_+_10rem)] min-h-[calc(40vh_+_10rem)] xl:max-h-none xl:min-h-auto ${className}`}>
        <table className={`border-separate w-full border-spacing-0`}>{children}</table>
    </div>
}

export const THead = ({children, className = '', responsive = true}: {children: React.ReactNode, className?: string, responsive?: boolean}) => {
    const isMobile = useIsMobile();
    if (responsive && isMobile) return;
    return <thead className={`text-[.75rem]/[1em] uppercase tracking-[.05em] ${className}`}>{children}</thead>
}

export const TBody = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <tbody className={` ${className}`}>{children}</tbody>
}

export const PlayerImg = ({className = '', player_id, player_name}: {className?: string, player_id: string | undefined, player_name: string}) => {
    if (player_id === undefined) return <div className={`border-[2px] border-[#404040] mr-[.5rem] my-auto align-middle ${className}`}></div>
    return <img className={`border-[2px] border-[#404040] mr-[.5rem] my-auto pointer-events-none ${className}`} src={player_id !== undefined ? `https://mc-heads.net/avatar/${player_id}` : undefined} alt={player_name}/>
}

export const Link = ({children, className = '', to, state = undefined, onClick}: {children: React.ReactNode, className?: string, to: string, state?: object, onClick?: Function}) => {
    return <div className={`${className}`}><ReactLink className="text-[#ff8066] underline" to={to} state={state} onClick={onClick ? () => onClick() : undefined}>{children}</ReactLink></div>
}

export const Content = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <div className={`flex flex-col xl:flex-row flex-[1_1_auto] h-full overflow-hidden ${className}`}>{children}</div>
}