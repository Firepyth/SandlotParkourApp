import type { QueryClient } from "@tanstack/react-query";

interface HandleSortParams {
    sort: string;
    newSort: string;
    direction: string;
    setDirection: Function;
    setSort: Function;
    queryClient: QueryClient;
    queryKey: string;
    setPage: Function;
}

export const handleSort = async ({sort, newSort, direction, setDirection, setSort, queryClient, queryKey, setPage}: HandleSortParams) => {
    if (sort === newSort) {
        await setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
        await setPage(1);
    }
    else {
        await setDirection('ASC');
        await setSort(newSort);
        await setPage(1);
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
    setPage: Function;
}

export const handleSearch = async ({search, newSearch, fetchTimeout, setFetchTimeout, setSearch, queryClient, queryKey, setPage}: HandleSearchParams) => {
    if (search !== newSearch) {
        await setSearch(newSearch);
        await setPage(1);
        clearTimeout(fetchTimeout);
        setFetchTimeout(setTimeout(async () => queryClient.invalidateQueries({queryKey: [queryKey]}), 150));
    }
}