import type { QueryClient } from "@tanstack/react-query";
import { handleSort } from "../../helpers/handleFilter"

interface TableHeadingProps {
    children: React.ReactNode, 
    sortParams?: {
        sort: string;
        newSort: string;
        direction: string;
        setDirection: Function;
        setSort: Function;
        queryClient: QueryClient;
        queryKey: string;
        setPage: Function;
    } | null;
    fakeSort?: boolean;
}

export default function TableHeading ({children, sortParams = null, fakeSort = false}: TableHeadingProps) {
    const classes = 'pb-[.5rem] text-left sticky top-0 bg-[#232323] shadow-[0_2px_#404040]';
    if (fakeSort) {
        return <th className={classes}>
            {children}
            <span className="mx-2">-</span>
        </th>
    }
    if (sortParams === null) {
        return <th className={classes}>
            {children}
        </th>
    }
    return <th className={`cursor-pointer ${classes}`} onClick={() => handleSort(sortParams)}>
        {children}
        <span className="mx-2">{sortParams.sort !== sortParams.newSort ? '-' : sortParams.direction === 'ASC' ? '⏶' : '⏷'}</span>
    </th>
}