import type { QueryClient } from "@tanstack/react-query";

interface PagerParams {
    pagerParams: {
        page: number;
        setPage?: Function;
        fetchTimeout?: number | null;
        queryClient?: QueryClient;
        queryKey?: string;
        maxItems?: number;
    }
}

export default function Pager ({pagerParams: {page, setPage, fetchTimeout = null, queryClient, maxItems = 0, queryKey}}: PagerParams) {
    return <div className="flex justify-center pt-[.5rem]">
        <button className={`cursor-pointer${page <= 1 ? ' text-[#999999] pointer-events-none': ''}`} onClick={async () => {
            if (page > 1) {
                if (setPage) {
                    await setPage(page - 1);
                }
                fetchTimeout !== null ? clearTimeout(fetchTimeout) : '';
                if (queryClient) {
                    queryClient.invalidateQueries({queryKey: [queryKey]});
                }
            }
        }}><i className="fa-solid fa-caret-left"></i></button>
        <span className={`inline-block text-center`} style={{minWidth: `${Math.floor(Math.log10(maxItems) + 1) * 3 + 5}ch`}}>{Math.min((page - 1) * 50 + 1, maxItems)}-{Math.min(page * 50, maxItems)} of {maxItems}</span>
        <button className={`cursor-pointer${page * 50 > maxItems ? ' text-[#999999] pointer-events-none': ''}`} onClick={async () => {
            if (page * 50 <= maxItems) {
                if (setPage) {
                    await setPage(page + 1);
                }
                fetchTimeout !== null ? clearTimeout(fetchTimeout) : '';
                if (queryClient) {
                    queryClient.invalidateQueries({queryKey: [queryKey]});
                }
            }
        }}><i className="fa-solid fa-caret-right"></i></button>
    </div>
}