import type { QueryClient } from "@tanstack/react-query";
import { handleSearch } from "../helpers/handleFilter"
import { useEffect, useRef } from "react";

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
    autoFocus?: boolean;
    id: string;
    className?: string;
}

export default function Search ({searchParams, autoFocus = false, id, className = ''}: SearchParams | {searchParams: undefined, autoFocus?: boolean, id: string, className?: string}) {
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        ref.current?.focus();
    }, [searchParams?.queryKey]);

    if (searchParams !== undefined) {
        return <div className={`w-full p-[.25rem] bg-[#404040] rounded-[.25rem] flex mb-[1.5rem] ${className}`}>
            <label htmlFor={id} className="flex items-center"><i className="fa-solid fa-magnifying-glass text-xl block"></i></label>
            <input ref={ref} className="w-full" id={id} autoFocus={autoFocus} type="text" value={searchParams.search} onChange={async (e) => {
                handleSearch({...searchParams, newSearch: e.target.value});
            }} />
        </div>
    }
    return <div className={`w-full p-[.25rem] bg-[#333333] rounded-[.25rem] flex mb-[1.5rem] ${className}`}>
        <label htmlFor={id} className="flex items-center text-[#888888]"><i className="fa-solid fa-magnifying-glass text-xl block"></i></label>
        <input className="w-full pointer-events-none" id={id} value={''} type="text" onChange={() => {}} tabIndex={-1}/>
    </div>
}