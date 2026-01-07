import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, useSearchParams } from "react-router";
import TableHeading from '../components/stylePresets/TableHeading';
import TableCell from '../components/stylePresets/TableCell';
import Search from '../components/Search';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/stylePresets/TableRow';
import Pager from '../components/Pager';
import { PlayerDetailsTable } from '../components/PlayerDetailsTable';
import { Content, H1, PlayerImg, Table, TableContainer, TBody, THead } from '../components/stylePresets/presetStyles';

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
    const [queryParams] = useSearchParams();
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
                <TableCell colSpan={5} className="w-[18ch]">
                    No results for: {search}
                </TableCell>
            </TableRow>
        }
        return data.map((player: Player) => {
            return <TableRow key={player.player_id} route={`/players?playerId=${player.player_id}`} className={`cursor-pointer${queryParams.get('playerId') === player.player_id ? ' bg-[#5a5a5a]' : ''}`}>
                <TableCell>
                    <PlayerImg player_id={player.player_id} player_name={player.player_name} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.25rem]"/>
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
        <H1>Players</H1>
        <Content className="gap-[3.2%]">
            <TableContainer className="h-full">
                <Search searchParams={searchParams} id="player-search"/>
                <Table>
                    <THead>
                        <TableRow>
                            <TableHeading sortParams={{...sortParams, newSort: 'player_name'}} className="min-w-[24ch]">
                                Player name
                            </TableHeading>
                            <TableHeading sortParams={{...sortParams, newSort: 'completed_courses'}}>
                                Courses completed
                            </TableHeading>
                            <TableHeading sortParams={{...sortParams, newSort: 'avg_position'}}>
                                Avg rank
                            </TableHeading>
                            <TableHeading sortParams={{...sortParams, newSort: 'total_records'}}>
                                Number of records
                            </TableHeading>
                        </TableRow>
                    </THead>
                    <TBody>
                        {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4}/> :
                            loadCourses(data?.players || [])
                        }
                    </TBody>
                </Table>
                {isPending ? '' : error ? '' :
                    <Pager pagerParams={pagerParams}/>
                }
            </TableContainer>
            <Content className="flex-col max-w-[39.8%] min-w-[39.8%]">
                <PlayerDetailsTable />
            </Content>
        </Content>
    </>
}