import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toTime } from '../helpers/convert';

interface Player {
    player_name: string;
    player_id: string;
    completed_courses: number;
    total_completions: number;
    total_records: number;
    avg_position: number;
}

interface PlayerTime {
    course_name: string;
    course_id: number;
    fastest_time: number;
    deaths: number;
    leaderboard_position: number;
    time_id: number;
}

const CourseDetailsTable = ({ id }: { id: string }) => {
    const navigate = useNavigate();

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetailsCompletions${id}`],
        queryFn: (): Promise<PlayerTime[]> => fetch(`${import.meta.env.VITE_API_URL}/players/completions/finished/${id}`).then(r => r.json())
    });

    const loadCourses = (data: PlayerTime[]) => {
        return data.map((playerTime: PlayerTime) => {
            return <tr key={playerTime.course_id} onClick={() => navigate(`/players/${id}/${playerTime.course_id}`)} className="cursor-pointer">
                <td key={`${playerTime.course_id}_name`}>
                    {playerTime.course_name}
                </td>
                <td key={`${playerTime.course_id}_rank`}>
                    {playerTime.leaderboard_position}
                </td>
                <td key={`${playerTime.course_id}_time`}>
                    {toTime(playerTime.fastest_time)}
                </td>
                <td key={`${playerTime.course_id}_deaths`}>
                    {playerTime.deaths}
                </td>
            </tr>
        });
    }

    const loadingMsg = <>
        <tr>
            <td>
                Loading...
            </td>
        </tr>
    </>

    const errorMsg = <>
        <tr>
            <td>
                Error retrieving data.
            </td>
        </tr>
    </>

    return <>
        {isPending ? loadingMsg : error ? errorMsg :
            loadCourses(data)
        }
    </>
}

export default function PlayerDetails () {
    const { id } = useParams();

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetails${id}`],
        queryFn: (): Promise<Player> => fetch(`${import.meta.env.VITE_API_URL}/players/${id}`).then(r => r.json())
    });

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    return <>
        <h1 className="flex"><img src={`https://mc-heads.net/avatar/${data.player_id}`} alt={data.player_name} width="48px" height="48px"/>{data.player_name}</h1>
        <p>Completed courses: {data.completed_courses}</p>
        <p>Total completions: {data.total_completions}</p>
        <p>Total records: {data.total_records}</p>
        <p>Average leaderboard position: {Number(data.avg_position).toFixed(1)}</p>
        <table>
            <thead>
                <tr>
                    <th>
                        Name
                    </th>
                    <th>
                        Rank
                    </th>
                    <th>
                        Time
                    </th>
                    <th>
                        Deaths
                    </th>
                </tr>
            </thead>
            <tbody>
                {id ? <CourseDetailsTable id={id}/> : ''}
            </tbody>
        </table>
    </>
}