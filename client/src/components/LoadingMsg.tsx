import TableCell from "./TableCell";
import TableRow from "./TableRow";

interface LoadingMsg {
    colSpan?: number;
}

export default function LoadingMsg ({colSpan = 1}: LoadingMsg) {
    return <TableRow>
        <TableCell colSpan={colSpan}>
            Loading...
        </TableCell>
    </TableRow>
}