import { useNavigate } from "react-router";

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
}

export default function TableRow ({children, className = '', route = null}: TableCellProps) {
    const navigate = useNavigate();

    return <tr className={`${className}`} onClick={route ? () => navigate(route) : undefined}>
        {children}
    </tr>
}