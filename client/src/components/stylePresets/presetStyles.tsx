import { Link as ReactLink } from "react-router";

export const H1 = ({children}: {children: React.ReactNode;}) => {
    return <h1 className="border-b-[2px] border-[#404040] m-[3.75rem_0_2rem_0] text-[2rem] pb-[.375em]">{children}</h1>
}

export const H2 = ({children}: {children: React.ReactNode;}) => {
    return <h2 className="font-minecraft text-[1.5rem] mb-[.75em]">{children}</h2>
}

export const TableContainer = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <div className={`bg-[#232323] rounded-[.5rem] p-[1.5rem] flex flex-col flex-[1_1_auto] overflow-hidden ${className}`}>{children}</div>
}

export const Table = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <div className="overflow-y-auto h-full flex-[1_1_auto] border-b-[2px] border-[#404040]">
        <table className={`w-full ${className}`}>{children}</table>
    </div>
}

export const THead = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <thead className={`text-[.75rem]/[1em] font-bold uppercase tracking-[.05em] ${className}`}>{children}</thead>
}

export const TBody = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <tbody className={` ${className}`}>{children}</tbody>
}

export const PlayerImg = ({className = '', player_id, player_name}: {className?: string, player_id: string | undefined, player_name: string}) => {
    return <img className={`border-[2px] border-[#404040] mr-[.5rem] w-[1.5rem] h-[1.5rem] my-auto align-middle ${className}`} src={player_id !== undefined ? `https://mc-heads.net/avatar/${player_id}` : undefined} alt={player_name} width="24px" height="24px"/>
}

export const Link = ({children, className = '', to, state = undefined}: {children: React.ReactNode, className?: string, to: string, state?: object}) => {
    return <p className={`${className}`}><ReactLink className="text-[#ff8066] underline" to={to} state={state}>{children}</ReactLink></p>
}

export const Content = ({children, className = ''}: {children: React.ReactNode, className?: string}) => {
    return <div className={`flex flex-[1_1_auto] h-full overflow-hidden ${className}`}>{children}</div>
}