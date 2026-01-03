import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from "react-router";
import { toTime, toTitle } from '../helpers/convert';
import { useEffect, useState } from 'react';
import TableHeading from './TableHeading';
import TableCell from './TableCell';
import Search from './Search';
import LoadingMsg from './LoadingMsg';
import ErrorMsg from './ErrorMsg';
import TableRow from './TableRow';
import Pager from './Pager';

interface PlayerTime {
    course_name: string;
    course_id: number;
    fastest_time: number;
    deaths: number;
    leaderboard_position: number;
    time_id: number;
}

interface PlayerTimes {
    matched_courses: number;
    player_name: string;
    completions: PlayerTime[];
}

export const PlayerDetailsTable = () => {
    const [queryParams] = useSearchParams();
    const queryClient = useQueryClient();

    const [id, setId] = useState('');
    const [sort, setSort] = useState('course_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [category, setCategory] = useState('finished');
    const [page, setPage] = useState(1);
    const [fetchTimeout, setFetchTimeout] = useState(0);

    useEffect(() => {
        setId(queryParams.get('playerId') || '');
        setSort('course_name');
        setSearch('');
        setDirection('ASC');
        setCategory('finished');
        setPage(1);
        queryClient.invalidateQueries({queryKey: [`PlayerDetailsCompletions${id}`]});
    }, [queryParams]);

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerDetailsCompletions${id}`],
        queryFn: (): Promise<PlayerTimes> => {
            if (id === '') return new Promise((resolve) => resolve({matched_courses: -1, player_name: '[Player name]', completions: []}));
            return fetch(`${import.meta.env.VITE_API_URL}/players/completions/${category}/${id}?sort=${sort}&search=${search}&direction=${direction}&page=${page}`).then(r => r.json())
        }
    });

    const handleCategoryChange = async (newCategory: string) => {
        await setCategory(newCategory);
        await setPage(1);
        queryClient.invalidateQueries({queryKey: [`PlayerDetailsCompletions${id}`]});
    }

    const loadCourses = (data: PlayerTime[]) => {
        if (id === '') {
            return <TableRow>
                <TableCell colSpan={5}>
                    Select a player to view completed courses.
                </TableCell>
            </TableRow>
        }
        if (data.length === 0) {
            return <TableRow>
                <TableCell colSpan={5}>
                    No results for: {search}
                </TableCell>
            </TableRow>
        }
        return data.map((playerTime: PlayerTime, ) => {
            if (playerTime.course_name === null) return;
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
                    {playerTime.leaderboard_position}
                </TableCell>
                <TableCell>
                    {toTitle(playerTime.course_name)}
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

    const searchParams = {
        search,
        fetchTimeout,
        setFetchTimeout,
        setPage,
        setSearch,
        queryClient,
        queryKey: `PlayerDetailsCompletions${id}`
    }

    const sortParams = {
        sort,
        direction,
        setDirection,
        setPage,
        setSort,
        queryClient,
        queryKey: `PlayerDetailsCompletions${id}`
    }

    const pagerParams = {
        page,
        setPage,
        fetchTimeout,
        queryClient,
        queryKey: `PlayerDetailsCompletions${id}`,
        maxItems: data?.matched_courses
    }

    return <>
        <img src={id !== '' ? `https://mc-heads.net/avatar/${id}` : undefined} alt={isPending || error ? '' : data.player_name} width="64px" height="64px"/>
        <h2>{isPending || error ? '[Player name]' : data.player_name}</h2>
        <div className="flex gap-5">
            <Search searchParams={searchParams}/>
            <select className="block" onChange={e => handleCategoryChange(e.target.value)}>
                <option value="finished">Finished</option>
                <option value="unfinished">Unfinished</option>
                <option value="all">All</option>
            </select>
        </div>
        <table>
            <thead>
                <TableRow>
                    <TableHeading sortParams={{...sortParams, newSort: 'course_name'}}>
                        Rank
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'leaderboard_position'}}>
                        Course name
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
                {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4} /> :
                    loadCourses(data.completions || [])
                }
            </tbody>
        </table>
        {isPending || error || data.matched_courses === -1 ? '' : 
            <Pager pagerParams={pagerParams}/>
        }
    </>
}