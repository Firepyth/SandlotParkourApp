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
}

export default function Search ({searchParams}: SearchParams) {
    return <input className="border-1" type="text" value={searchParams.search} onChange={async (e) => {
        handleSearch({...searchParams, newSearch: e.target.value});
    }} />
}