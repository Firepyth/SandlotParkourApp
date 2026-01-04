import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toTime, toDate, toTitle } from '../helpers/convert';
import { useState } from 'react';
import TableHeading from '../components/stylePresets/TableHeading';
import TableCell from '../components/stylePresets/TableCell';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/stylePresets/TableRow';
import Pager from '../components/Pager';
import { PlayerImg } from '../components/stylePresets/presetStyles';

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

const PlayerCourseTable = ({ player_id, course_id, total_completions }: { player_id: string, course_id: number, total_completions: number }) => {
    const queryClient = useQueryClient();

    const [sort, setSort] = useState('leaderboard_position');
    const [direction, setDirection] = useState('ASC');
    const [page, setPage] = useState(1);

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerCourseCompletions${player_id}_${course_id}`],
        queryFn: (): Promise<PlayerCourseTimes[]> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/completions/${player_id}/${course_id}?sort=${sort}&direction=${direction}&page=${page}`).then(r => r.json())
    });

    const loadCourses = (data: PlayerCourseTimes[]) => {
        return data.map((playerCourseTime: PlayerCourseTimes) => {
            return <TableRow key={playerCourseTime.time_id}>
                <TableCell>
                    {playerCourseTime.leaderboard_position}
                </TableCell>
                <TableCell>
                    {toTime(playerCourseTime.time)}
                </TableCell>
                <TableCell>
                    {playerCourseTime.deaths}
                </TableCell>
                <TableCell>
                    {toDate(playerCourseTime.time_achieved)}
                </TableCell>
            </TableRow>
        });
    }

    const sortParams = {
        sort,
        setPage,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: `PlayerCourseCompletions${player_id}_${course_id}`
    }

    const pagerParams = {
        page,
        setPage,
        queryClient,
        queryKey: `PlayerCourseCompletions${player_id}_${course_id}`,
        maxItems: total_completions
    }

    return <>
        <table>
            <thead>
                <TableRow>
                    <TableHeading sortParams={{...sortParams, newSort: 'leaderboard_position'}}>
                        Rank
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'time'}}>
                        Time
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'deaths'}}>
                        Deaths
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'time_achieved'}}>
                        Date
                    </TableHeading>
                </TableRow>
            </thead>
            <tbody>
                {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4}/> :
                    loadCourses(data)
                }
            </tbody>
        </table>
        {isPending ? '' : error ? '' :
            <Pager pagerParams={pagerParams}/>
        }
    </>
}

export default function PlayerCourse () {
    const navigate = useNavigate();
    const { player_id, course_id } = useParams();

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerCourse${player_id}_${course_id}`],
        queryFn: (): Promise<PlayerCourse> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/${player_id}/${course_id}`).then(r => r.json())
    });

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    return <>
        <h1>Player Stats by Course</h1>
        <h2 className="cursor-pointer" onClick={() => navigate(`/courses/${course_id}`)}>{toTitle(data.course_name)}</h2>
        <h3 className="flex cursor-pointer" onClick={() => navigate(`/players/${player_id}`)}><PlayerImg player_id={data.player_id} player_name={data.player_name}/>{data.player_name}</h3>
        <table>
            <tr>
                <td>Highest rank:</td>
                <td>{data.leaderboard_position}</td>
            </tr>
            <tr>
                <td>Fastest time:</td>
                <td>{toTime(data.fastest_time)}</td>
                <td>({data.fastest_deaths} deaths)</td>
            </tr>
            <tr>
                <td>Average time:</td>
                <td>{toTime(data.avg_time)}</td>
                <td>({Number(data.avg_deaths).toFixed(1)} deaths)</td>
            </tr>
            <tr>
                <td>First time:</td>
                <td>{toTime(data.first_time)}</td>
                <td>({data.first_deaths} deaths)</td>
            </tr>
        </table>
        {player_id && course_id ? <PlayerCourseTable player_id={player_id} course_id={Number(course_id)} total_completions={data.total_completions}/> : ''}
    </>
}