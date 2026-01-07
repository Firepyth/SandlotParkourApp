import { Link as ReactLink } from "react-router";

export const H1 = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <h1 className={`border-b-[2px] border-[#404040] m-[3.75rem_0_2rem_0] text-[2rem] pb-[.375em] ${className}`}>{children}</h1>
}

export const H2 = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <h2 className={`font-minecraft text-[1.5rem] mb-[.75em] ${className}`}>{children}</h2>
}

export const TableContainer = ({children, className = '', onClick = undefined}: {children: React.ReactNode, className?: string, onClick?: Function | undefined}) => {
    return <div className={`bg-[#232323] rounded-[.5rem] p-[1.5rem] flex flex-col flex-[1_1_auto] overflow-hidden ${className}`} onClick={onClick !== undefined ? (e) => onClick(e) :  () => {}}>{children}</div>
}

export const Table = ({children, className = '', strictHeight = false}: {children: React.ReactNode, className?: string, strictHeight?: boolean}) => {
    return <div className={`overflow-y-auto ${strictHeight ? '' : 'h-full'} flex-[1_1_auto] border-b-[2px] border-[#404040] ${className}`}>
        <table className="w-full">{children}</table>
    </div>
}

export const THead = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <thead className={`text-[.75rem]/[1em] uppercase tracking-[.05em] ${className}`}>{children}</thead>
}

export const TBody = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <tbody className={` ${className}`}>{children}</tbody>
}

export const PlayerImg = ({className = '', player_id, player_name}: {className?: string, player_id: string | undefined, player_name: string}) => {
    if (player_id === undefined) return <div className={`border-[2px] border-[#404040] mr-[.5rem] my-auto align-middle ${className}`}></div>
    return <img className={`border-[2px] border-[#404040] mr-[.5rem] my-auto pointer-events-none ${className}`} src={player_id !== undefined ? `https://mc-heads.net/avatar/${player_id}` : undefined} alt={player_name}/>
}

export const Link = ({children, className = '', to, state = undefined}: {children: React.ReactNode, className?: string, to: string, state?: object}) => {
    return <div className={`${className}`}><ReactLink className="text-[#ff8066] underline" to={to} state={state}>{children}</ReactLink></div>
}

export const Content = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <div className={`flex flex-[1_1_auto] h-full overflow-hidden ${className}`}>{children}</div>
}