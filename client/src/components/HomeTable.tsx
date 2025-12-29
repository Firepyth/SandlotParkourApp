import { useNavigate } from "react-router";
import { toDate, toTitle } from '../helpers/convert';
import TableCell from "./TableCell";

interface Data {
    course_id: number;
    course_created: string;
    course_name: string;
    player_id: string;
    player_name: string;
    completed_courses: number;
}

export default function HomeTable ({ data, type }: { data: Data[], type: string}) {
    const navigate = useNavigate();

    if (type === "course") {
        data = data.filter((item) => item.course_id !== null);

        return data.map((item) => {
            return <tr key={`${item.course_id}_row`} onClick={() => navigate(`/courses/${item.course_id}`)} className="cursor-pointer">
                    <TableCell>{toTitle(item.course_name)}</TableCell>
                    <TableCell>{toDate(item.course_created)}</TableCell>
                </tr>
        })
    }
    else {
        data = data.filter((item) => item.player_id !== null);

        return data.map((item) => {
            return <tr key={`${item.player_id}_row`} onClick={() => navigate(`/players/${item.player_id}`)} className="cursor-pointer">
                    <TableCell className="flex">
                        <img src={`https://mc-heads.net/avatar/${item.player_id}`} alt={item.player_name} width="24px" height="24px"/>
                        {item.player_name}
                    </TableCell>
                    <TableCell>{item.completed_courses}</TableCell>
                </tr>
        })
    }
}