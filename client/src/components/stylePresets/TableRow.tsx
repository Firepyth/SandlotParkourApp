import { useNavigate } from "react-router";

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
    setShowSearch?: Function | null;
}

export default function TableRow ({children, className = '', route = null, setShowSearch = null}: TableCellProps) {
    const navigate = useNavigate();

    const handleNavigate = (route: string) => {
        setShowSearch ? setShowSearch(false) : '';
        navigate(route)
    }

    return <tr className={`${className}`} onClick={route ? () => {handleNavigate(route)} : undefined} tabIndex={route ? 0 : undefined}>
        {children}
    </tr>
}