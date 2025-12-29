import { useNavigate } from "react-router";

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
}

export default function TableCell ({children, className = '', route = null}: TableCellProps) {
    const navigate = useNavigate();

    const handleNavigate = (e: any, route: string) => {
        e.stopPropagation();
        navigate(route);
    }

    return <td className={`${className}`} onClick={route ? (e) => handleNavigate(e, route) : undefined}>
        {children}
    </td>
}