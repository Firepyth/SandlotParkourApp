interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
    colSpan?: number;
}

export default function TableCell ({children, className = '', colSpan = 1}: TableCellProps) {
    return <td className={`border-b-[2px] border-dotted border-[#000000] h-[2.5rem] ${className}`} colSpan={colSpan}>
        {children}
    </td>
}