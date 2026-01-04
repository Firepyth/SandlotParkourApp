import type { QueryClient } from "@tanstack/react-query";
import { handleSearch } from "../helpers/handleFilter"

interface SearchParams {
    searchParams: {
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
}

export default function Search ({searchParams = 0, autofocus = false, id}: SearchParams | {searchParams?: 0, autofocus?: boolean, id: string}) {
    if (searchParams !== 0) {
        return <div className="p-[.25rem] bg-[#333333] rounded-[.5rem] flex">
            <label htmlFor={id}><i className="fa-solid fa-magnifying-glass"></i></label>
            <input className="w-full" id={id} autoFocus={autofocus} type="text" value={searchParams.search} onChange={async (e) => {
                handleSearch({...searchParams, newSearch: e.target.value});
            }} />
        </div>
    }
    return <input className="border-1 pointer-events-none" type="text" />
}