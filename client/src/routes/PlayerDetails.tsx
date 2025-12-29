import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toTime, toTitle } from '../helpers/convert';
import { useState } from 'react';
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';

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

const CourseDetailsTable = ({ id, sort, search, direction }: { id: string, sort: string, search: string, direction: string }) => {
    const navigate = useNavigate();

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetailsCompletions${id}`],
        queryFn: (): Promise<PlayerTime[]> => fetch(`${import.meta.env.VITE_API_URL}/players/completions/finished/${id}?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: PlayerTime[]) => {
        if (data.length === undefined) {
            return <tr>
                <td colSpan={5}>
                    No results for: {search}
                </td>
            </tr>
        }
        return data.map((playerTime: PlayerTime) => {
            return <tr key={playerTime.course_id} onClick={() => navigate(`/players/${id}/${playerTime.course_id}`)} className="cursor-pointer">
                <TableCell>
                    {toTitle(playerTime.course_name)}
                </TableCell>
                <TableCell>
                    {playerTime.leaderboard_position}
                </TableCell>
                <TableCell>
                    {toTime(playerTime.fastest_time)}
                </TableCell>
                <TableCell>
                    {playerTime.deaths}
                </TableCell>
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
    const queryClient = useQueryClient();

    const [sort, setSort] = useState('course_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetails${id}`],
        queryFn: (): Promise<Player> => fetch(`${import.meta.env.VITE_API_URL}/players/${id}`).then(r => r.json())
    });

    const handleSort = async (newSort: string) => {
        if (sort === newSort) {
            await setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
        }
        else {
            await setDirection('ASC');
            await setSort(newSort);
        }
        queryClient.invalidateQueries({queryKey: [`PlayerDetailsCompletions${id}`]});
    }

    const handleSearch = async (newSearch: string) => {
        if (search !== newSearch) {
            await setSearch(newSearch);
            clearTimeout(fetchTimeout);
            setFetchTimeout(setTimeout(async () => queryClient.invalidateQueries({queryKey: [`PlayerDetailsCompletions${id}`]}), 150));
        }
    }

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    return <>
        <h1 className="flex"><img src={`https://mc-heads.net/avatar/${data.player_id}`} alt={data.player_name} width="48px" height="48px"/>{data.player_name}</h1>
        <p>Completed courses: {data.completed_courses}</p>
        <p>Total completions: {data.total_completions}</p>
        <p>Total records: {data.total_records}</p>
        <p>Average leaderboard position: {Number(data.avg_position).toFixed(1)}</p>
        <input className="border-1" type="text" value={search} onChange={(e) => handleSearch(e.target.value)} />
        <table>
            <thead>
                <tr>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'course_name'}>
                        Name
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'leaderboard_position'}>
                        Rank
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'fastest_time'}>
                        Time
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'deaths'}>
                        Deaths
                    </TableHeading>
                </tr>
            </thead>
            <tbody>
                {id ? <CourseDetailsTable id={id} sort={sort} search={search} direction={direction}/> : ''}
            </tbody>
        </table>
    </>
}