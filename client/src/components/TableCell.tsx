interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
    colSpan?: number;
}

export default function TableCell ({children, className = '', colSpan = 1}: TableCellProps) {
    return <td className={`${className}`} colSpan={colSpan}>
        {children}
    </td>
}