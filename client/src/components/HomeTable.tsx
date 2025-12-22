import { useNavigate } from "react-router";
import ToDate from "./ToDate";

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
                    <td key={`${item.course_id}_created`}><ToDate date={item.course_created} /></td>
                    <td key={`${item.course_id}_name`}>{item.course_name}</td>
                </tr>
        })
    }
    else {
        data = data.filter((item) => item.player_id !== null);

        return data.map((item) => {
            return <tr key={`${item.player_id}_row`} onClick={() => navigate(`/players/${item.player_id}`)} className="cursor-pointer">
                    <td key={`${item.player_id}_created`}>{item.completed_courses}</td>
                    <td key={`${item.player_id}_name`} className="flex">
                        <img src={`https://mc-heads.net/avatar/${item.player_id}`} alt={item.player_name} width="24px" height="24px"/>
                        {item.player_name}
                    </td>
                </tr>
        })
    }
}