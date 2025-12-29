import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toTime, toDate, toTitle } from '../helpers/convert';
import { useState } from 'react';
import TableHeading from '../components/TableHeading';

interface PlayerCourse {
    leaderboard_position: number;
    fastest_time: number;
    fastest_deaths: number;
    first_time: number;
    first_deaths: number;
    avg_time: number;
    avg_deaths: number;
    total_completions: number;
    course_name: string;
    player_id: string;
    player_name: string;
}

interface PlayerCourseTimes {
    time_id: number;
    time: number;
    deaths: number;
    leaderboard_position: number;
    time_achieved: string;
}

const PlayerCourseTable = ({ player_id, course_id, sort, direction }: { player_id: string, course_id: number, sort: string, direction: string }) => {
    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerCourseCompletions${player_id}_${course_id}`],
        queryFn: (): Promise<PlayerCourseTimes[]> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/completions/${player_id}/${course_id}?sort=${sort}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: PlayerCourseTimes[]) => {
        return data.map((playerCourseTime: PlayerCourseTimes) => {
            return <tr key={playerCourseTime.time_id}>
                <td key={`${playerCourseTime.time_id}_rank`}>
                    {playerCourseTime.leaderboard_position}
                </td>
                <td key={`${playerCourseTime.time_id}_time`}>
                    {toTime(playerCourseTime.time)}
                </td>
                <td key={`${playerCourseTime.time_id}_deaths`}>
                    {playerCourseTime.deaths}
                </td>
                <td key={`${playerCourseTime.time_id}_achieved`}>
                    {toDate(playerCourseTime.time_achieved)}
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

export default function PlayerCourse () {
    const navigate = useNavigate();
    const { player_id, course_id } = useParams();
    const queryClient = useQueryClient();

    const [sort, setSort] = useState('leaderboard_position');
    const [direction, setDirection] = useState('ASC');

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerCourse${player_id}_${course_id}`],
        queryFn: (): Promise<PlayerCourse> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/${player_id}/${course_id}`).then(r => r.json())
    });

    const handleSort = async (newSort: string) => {
        if (sort === newSort) {
            await setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
        }
        else {
            await setDirection('ASC');
            await setSort(newSort);
        }
        queryClient.invalidateQueries({queryKey: [`PlayerCourseCompletions${player_id}_${course_id}`]});
    }

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    return <>
        <h1 className="flex cursor-pointer" onClick={() => navigate(`/players/${player_id}`)}><img src={`https://mc-heads.net/avatar/${data.player_id}`} alt={data.player_name} width="48px" height="48px"/>{data.player_name}</h1>
        <h2 className="cursor-pointer" onClick={() => navigate(`/courses/${course_id}`)}>{toTitle(data.course_name)}</h2>
        <p>Highest leaderboard position: {data.leaderboard_position}</p>
        <p>Fastest time: {toTime(data.fastest_time)}</p>
        <p>Fastest deaths: {data.fastest_deaths}</p>
        <p>First time: {toTime(data.first_time)}</p>
        <p>First deaths: {data.first_deaths}</p>
        <p>Average time: {toTime(data.avg_time)}</p>
        <p>Average deaths: {Number(data.avg_deaths).toFixed(1)}</p>
        <p>Total completions: {data.total_completions}</p>
        <table>
            <thead>
                <tr>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'leaderboard_position'}>
                        Rank
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'time'}>
                        Time
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'deaths'}>
                        Deaths
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'time_achieved'}>
                        Date
                    </TableHeading>
                </tr>
            </thead>
            <tbody>
                {player_id && course_id ? <PlayerCourseTable player_id={player_id} course_id={Number(course_id)} sort={sort} direction={direction}/> : ''}
            </tbody>
        </table>
    </>
}