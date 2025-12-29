import TableCell from "./TableCell";
import TableRow from "./TableRow";

interface ErrorProps {
    colSpan?: number;
}

export default function ErrorMsg ({colSpan = 1}: ErrorProps) {
    return <TableRow>
        <TableCell colSpan={colSpan}>
            Error retrieving data.
        </TableCell>
    </TableRow>
}