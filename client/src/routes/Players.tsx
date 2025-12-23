import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router";

interface Player {
    player_id: string;
    completed_courses: number;
    avg_position: number;
    record_count: number;
    player_name: string;
}

export default function Players () {
    const navigate = useNavigate();
    const { data, isPending, error } = useQuery({
        queryKey: ['Players'],
        queryFn: (): Promise<Player[]> => fetch(`${import.meta.env.VITE_API_URL}/players`).then(r => r.json())
    });

    const loadCourses = (data: Player[]) => {
        return data.map((player: Player) => {
            return <tr key={player.player_id} onClick={() => navigate(`/players/${player.player_id}`)} className="cursor-pointer">
                <td key={`${player.player_id}_name`} className="flex">
                    <img src={`https://mc-heads.net/avatar/${player.player_id}`} alt={player.player_name} width="24px" height="24px"/>
                    {player.player_name}
                </td>
                <td key={`${player.player_id}_created`}>
                    {player.completed_courses}
                </td>
                <td key={`${player.player_id}_avg`}>
                    {Number(player.avg_position).toFixed(1)}
                </td>
                <td key={`${player.player_id}_record`}>
                    {player.record_count}
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
        <h1>Courses</h1>
        <table>
            <thead>
                <tr>
                    <th>
                        Player name
                    </th>
                    <th>
                        Completed courses
                    </th>
                    <th>
                        Average placement
                    </th>
                    <th>
                        Total records
                    </th>
                </tr>
            </thead>
            <tbody>
                {isPending ? loadingMsg : error ? errorMsg :
                    loadCourses(data)
                }
            </tbody>
        </table>
    </>
}