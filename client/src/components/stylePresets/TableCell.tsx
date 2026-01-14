import { useIsMobile } from "../../helpers/hooks";

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
    colSpan?: number;
    responsive?: boolean;
    colName?: string;
}

export default function TableCell ({children, className = '', colSpan = 1, responsive = true, colName = ''}: TableCellProps) {
    const isMobile = useIsMobile();

    if (responsive) {
        return <td className={`flex items-center h-[2rem] border-b-[1px] border-[#333333] md:table-cell md:border-[#111111] md:h-[2.5rem] ${className}`} colSpan={colSpan}>
            {isMobile && colName ? <p className="w-1/2 font-normal">{colName}</p> : ''}
            {children}
        </td>
    }
    return <td className={`border-b-[1px] table-cell border-[#111111] h-[2.5rem] ${className}`} colSpan={colSpan}>
        {children}
    </td>
}