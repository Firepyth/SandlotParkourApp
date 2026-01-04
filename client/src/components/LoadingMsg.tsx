import TableCell from "./stylePresets/TableCell";
import TableRow from "./stylePresets/TableRow";

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