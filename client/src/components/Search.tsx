import type { QueryClient } from "@tanstack/react-query";
import { handleSearch } from "../helpers/handleFilter"

interface SearchParams {
    searchParams?: {
        search: string;
        fetchTimeout: number;
        setFetchTimeout: Function;
        setSearch: Function;
        queryClient: QueryClient;
        queryKey: string;
        setPage: Function;
    };
    autofocus?: boolean;
    id: string;
    className?: string;
}

export default function Search ({searchParams, autofocus = false, id, className = ''}: SearchParams | {searchParams: undefined, autofocus?: boolean, id: string, className?: string}) {
    if (searchParams !== undefined) {
        return <div className={`w-full p-[.25rem] bg-[#404040] rounded-[.25rem] flex mb-[1.5rem] ${className}`}>
            <label htmlFor={id} className="flex items-center"><i className="fa-solid fa-magnifying-glass text-xl block"></i></label>
            <input className="w-full" id={id} autoFocus={autofocus} type="text" value={searchParams.search} onChange={async (e) => {
                handleSearch({...searchParams, newSearch: e.target.value});
            }} />
        </div>
    }
    return <div className={`w-full p-[.25rem] bg-[#333333] rounded-[.25rem] flex mb-[1.5rem] ${className}`}>
        <label htmlFor={id} className="flex items-center"><i className="fa-solid fa-magnifying-glass text-xl block"></i></label>
        <input className="w-full pointer-events-none" id={id} value={''} autoFocus={autofocus} type="text" onChange={() => {}}/>
    </div>
}