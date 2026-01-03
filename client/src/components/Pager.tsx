import type { QueryClient } from "@tanstack/react-query";

interface PagerParams {
    pagerParams: {
        page: number;
        setPage: Function;
        fetchTimeout?: number | null;
        queryClient: QueryClient;
        queryKey: string;
        maxItems?: number;
    }
}

export default function Pager ({pagerParams: {page, setPage, fetchTimeout = null, queryClient, maxItems = 0, queryKey}}: PagerParams) {
    return <>
        <button className={`cursor-pointer${page <= 1 ? ' text-[#0008] pointer-events-none': ''}`} onClick={async () => {
            if (page > 1) {
                await setPage(page - 1);
                fetchTimeout !== null ? clearTimeout(fetchTimeout) : '';
                queryClient.invalidateQueries({queryKey: [queryKey]});
            }
        }}>&larr;</button>
        <span className={`inline-block text-center`} style={{minWidth: `${Math.floor(Math.log10(maxItems) + 1) * 3 + 5}ch`}}>{(page - 1) * 50 + 1}-{Math.min(page * 50, maxItems || Infinity)} of {maxItems}</span>
        <button className={`cursor-pointer${page * 50 > maxItems ? ' text-[#0008] pointer-events-none': ''}`} onClick={async () => {
            if (page * 50 <= maxItems) {
                await setPage(page + 1);
                fetchTimeout !== null ? clearTimeout(fetchTimeout) : '';
                queryClient.invalidateQueries({queryKey: [queryKey]});
            }
        }}>&rarr;</button>
    </>
}