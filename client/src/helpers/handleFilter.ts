import type { QueryClient } from "@tanstack/react-query";

interface HandleSortParams {
    sort: string;
    newSort: string;
    direction: string;
    setDirection: Function;
    setSort: Function;
    queryClient: QueryClient;
    queryKey: string;
}

export const handleSort = async ({sort, newSort, direction, setDirection, setSort, queryClient, queryKey}: HandleSortParams) => {
    if (sort === newSort) {
        await setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
    }
    else {
        await setDirection('ASC');
        await setSort(newSort);
    }
    queryClient.invalidateQueries({queryKey: [queryKey]});
}

interface HandleSearchParams {
    search: string;
    newSearch: string;
    fetchTimeout: number;
    setFetchTimeout: Function;
    setSearch: Function;
    queryClient: QueryClient;
    queryKey: string;
}

export const handleSearch = async ({search, newSearch, fetchTimeout, setFetchTimeout, setSearch, queryClient, queryKey}: HandleSearchParams) => {
    if (search !== newSearch) {
        await setSearch(newSearch);
        clearTimeout(fetchTimeout);
        setFetchTimeout(setTimeout(async () => queryClient.invalidateQueries({queryKey: [queryKey]}), 150));
    }
}