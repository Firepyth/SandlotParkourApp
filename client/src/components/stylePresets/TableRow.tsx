import { useNavigate } from "react-router";

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    route?: string | null;
    setShowModal?: Function | null;
    responsive?: boolean;
    scrollTo?: React.RefObject<HTMLHeadingElement | null>;
    scrollDown?: boolean;
    isTabbable?: boolean;
}

export default function TableRow ({children, className = '', route = null, setShowModal = null, responsive = true, scrollTo, scrollDown, isTabbable = true}: TableCellProps) {
    const navigate = useNavigate();

    const handleNavigate = (route: string) => {
        scrollTo ? scrollTo.current?.scrollIntoView() : '';
        setShowModal ? setShowModal(false) : '';
        navigate(route, {state: {scrollDown: scrollDown ? true : false}})
    }

    return <tr className={`mb-[2rem] ${responsive ? 'block md:table-row' : ''} ${className}`} onClick={route ? () => {handleNavigate(route)} : undefined} onKeyDown={route ? (e) => e.key === "Enter" ? handleNavigate(route) : undefined : undefined} tabIndex={isTabbable ? 0 : -1}>
        {children}
    </tr>
}