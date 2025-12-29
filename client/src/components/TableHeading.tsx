import type { QueryClient } from "@tanstack/react-query";
import { handleSort } from "../helpers/handleFilter"

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
    } | null;
    column?: string;
}

export default function TableHeading ({children, sortParams = null}: TableHeadingProps) {
    if (sortParams === null) {
        return <th>
            {children}
        </th>
    }
    return <th className="cursor-pointer" onClick={() => handleSort(sortParams)}>
        {children}
        <span className="mx-2">{sortParams.sort !== sortParams.newSort ? '-' : sortParams.direction === 'ASC' ? '⏶' : '⏷'}</span>
    </th>
}