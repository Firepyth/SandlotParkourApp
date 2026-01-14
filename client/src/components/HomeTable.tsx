import { toDate, toTitle } from '../helpers/convert';
import { PlayerImg } from './stylePresets/presetStyles';
import TableCell from "./stylePresets/TableCell";
import TableRow from "./stylePresets/TableRow";

interface Data {
    course_id: number;
    course_created: string;
    course_name: string;
    player_id: string;
    player_name: string;
    completed_courses: number;
}

export default function HomeTable ({ data, type }: { data: Data[], type: string}) {
    if (type === "course") {
        data = data.filter((item) => item.course_id !== null);

        return data.map((item) => {
            return <TableRow responsive={false} key={item.course_id} route={`/courses/${item.course_id}`} className="cursor-pointer" scrollDown={true}>
                    <TableCell responsive={false}>{toTitle(item.course_name)}</TableCell>
                    <TableCell responsive={false}>{toDate(item.course_created)}</TableCell>
                </TableRow>
        })
    }
    else {
        data = data.filter((item) => item.player_id !== null);

        return data.map((item) => {
            return <TableRow responsive={false} key={item.player_id} route={`/players?playerId=${item.player_id}`} className="cursor-pointer" scrollDown={true}>
                    <TableCell responsive={false}>
                        <PlayerImg player_id={item.player_id} player_name={item.player_name} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.25rem]"/>
                        {item.player_name}
                    </TableCell>
                    <TableCell responsive={false}>{item.completed_courses}</TableCell>
                </TableRow>
        })
    }
}