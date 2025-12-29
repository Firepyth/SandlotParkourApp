import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router";
import { toTime, toTitle } from '../helpers/convert';
import { useState } from 'react';
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/TableRow';

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

const CourseDetailsTable = ({ id, sort, search, direction, category }: { id: string, sort: string, search: string, direction: string, category: string }) => {

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetailsCompletions${id}`],
        queryFn: (): Promise<PlayerTime[]> => fetch(`${import.meta.env.VITE_API_URL}/players/completions/${category}/${id}?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: PlayerTime[]) => {
        if (data.length === undefined) {
            return <TableRow>
                <TableCell colSpan={5}>
                    No results for: {search}
                </TableCell>
            </TableRow>
        }
        return data.map((playerTime: PlayerTime) => {
            if (playerTime.fastest_time === null) {
                return <TableRow key={playerTime.course_id} route={`/players/${id}/${playerTime.course_id}`} className="cursor-pointer">
                    <TableCell>
                        {toTitle(playerTime.course_name)}
                    </TableCell>
                    <TableCell colSpan={3} className="text-center">
                        <i>N/A</i>
                    </TableCell>
                </TableRow>
            }
            return <TableRow key={playerTime.course_id} route={`/players/${id}/${playerTime.course_id}`} className="cursor-pointer">
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
            </TableRow>
        });
    }

    return <>
        {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4} /> :
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
    const [category, setCategory] = useState('finished');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetails${id}`],
        queryFn: (): Promise<Player> => fetch(`${import.meta.env.VITE_API_URL}/players/${id}`).then(r => r.json())
    });

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    const handleCategoryChange = async (newCategory: string) => {
        await setCategory(newCategory);
        queryClient.invalidateQueries({queryKey: [`PlayerDetailsCompletions${id}`]});
    }

    const searchParams = {
        search,
        fetchTimeout,
        setFetchTimeout,
        setSearch,
        queryClient,
        queryKey: `PlayerDetailsCompletions${id}`
    }

    const sortParams = {
        sort,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: `PlayerDetailsCompletions${id}`
    }

    return <>
        <h1 className="flex"><img src={`https://mc-heads.net/avatar/${data.player_id}`} alt={data.player_name} width="48px" height="48px"/>{data.player_name}</h1>
        <p>Completed courses: {data.completed_courses}</p>
        <p>Total completions: {data.total_completions}</p>
        <p>Total records: {data.total_records}</p>
        <p>Average leaderboard position: {Number(data.avg_position).toFixed(1)}</p>
        <select className="block" onChange={e => handleCategoryChange(e.target.value)}>
            <option value="finished">Finished</option>
            <option value="unfinished">Unfinished</option>
            <option value="all">All</option>
        </select>
        <Search searchParams={searchParams}/>
        <table>
            <thead>
                <TableRow>
                    <TableHeading sortParams={{...sortParams, newSort: 'course_name'}}>
                        Name
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'leaderboard_position'}}>
                        Rank
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'fastest_time'}}>
                        Time
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'deaths'}}>
                        Deaths
                    </TableHeading>
                </TableRow>
            </thead>
            <tbody>
                {id ? <CourseDetailsTable id={id} sort={sort} search={search} direction={direction} category={category}/> : ''}
            </tbody>
        </table>
    </>
}