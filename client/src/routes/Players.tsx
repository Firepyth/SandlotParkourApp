import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from "react-router";
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/TableRow';
import Pager from '../components/Pager';

interface Player {
    player_id: string;
    completed_courses: number;
    avg_position: number;
    total_records: number;
    player_name: string;
}

interface Players {
    matched_players: number;
    players: Player[];
}

export default function Players () {
    const queryClient = useQueryClient();
    const showTop = useLocation().state?.showTop;

    const [sort, setSort] = useState(showTop === true ? 'completed_courses' : 'player_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState(showTop === true ? 'DESC' : 'ASC');
    const [page, setPage] = useState(1);
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Players'],
        queryFn: (): Promise<Players> => fetch(`${import.meta.env.VITE_API_URL}/players?sort=${sort}&search=${search}&direction=${direction}&page=${page}`).then(r => r.json())
    });

    const loadCourses = (data: Player[]) => {
        if (data.length === 0) {
            return <TableRow>
                <TableCell colSpan={5}>
                    No results for: {search}
                </TableCell>
            </TableRow>
        }
        return data.map((player: Player) => {
            return <TableRow key={player.player_id} route={`/players/${player.player_id}`} className="cursor-pointer">
                <TableCell className="flex">
                    <img src={`https://mc-heads.net/avatar/${player.player_id}`} alt={player.player_name} width="24px" height="24px"/>
                    {player.player_name}
                </TableCell>
                <TableCell>
                    {player.completed_courses}
                </TableCell>
                <TableCell>
                    {Number(player.avg_position).toFixed(1)}
                </TableCell>
                <TableCell>
                    {player.total_records}
                </TableCell>
            </TableRow>
        });
    }

    const searchParams = {
        search,
        fetchTimeout,
        setFetchTimeout,
        setSearch,
        setPage,
        queryClient,
        queryKey: 'Players'
    }

    const sortParams = {
        sort,
        setPage,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: 'Players'
    }

    const pagerParams = {
        page,
        setPage,
        fetchTimeout,
        queryClient,
        queryKey: 'Players',
        maxItems: data?.matched_players
    }

    return <>
        <h1>Courses</h1>
        <Search searchParams={searchParams}/>
        <table>
            <thead>
                <TableRow>
                    <TableHeading sortParams={{...sortParams, newSort: 'player_name'}}>
                        Player name
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'completed_courses'}}>
                        Completed courses
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'avg_position'}}>
                        Average placement
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'total_records'}}>
                        Total records
                    </TableHeading>
                </TableRow>
            </thead>
            <tbody>
                {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4}/> :
                    loadCourses(data?.players || [])
                }
            </tbody>
        </table>
        {isPending ? '' : error ? '' :
            <Pager pagerParams={pagerParams}/>
        }
    </>
}