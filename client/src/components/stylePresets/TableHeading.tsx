import type { QueryClient } from "@tanstack/react-query";
import { handleSort } from "../../helpers/handleFilter"

interface TableHeadingProps {
    className?: string;
    children: React.ReactNode;
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

export default function TableHeading ({className, children, sortParams = null, fakeSort = false}: TableHeadingProps) {
    const classes = `pb-[.5rem] font-[600] text-left font-normal sticky top-0 bg-[#232323] border-b-[2px] border-[#404040] ${className}`;
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
        <span className="inline-block min-w-[1.5em] text-center">{sortParams.sort !== sortParams.newSort ? '–' : sortParams.direction === 'ASC' ? <i className="fa-solid fa-caret-up"></i> : <i className="fa-solid fa-caret-down"></i>}</span>
    </th>
}