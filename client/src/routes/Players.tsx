import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useOutletContext, useSearchParams } from "react-router";
import TableHeading from '../components/stylePresets/TableHeading';
import TableCell from '../components/stylePresets/TableCell';
import Search from '../components/Search';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/stylePresets/TableRow';
import Pager from '../components/Pager';
import { PlayerDetailsTable } from '../components/PlayerDetailsTable';
import { Content, H1, PlayerImg, Table, TableContainer, TBody, THead } from '../components/stylePresets/presetStyles';
import SortButton from '../components/SortButton';
import { useIsMobile } from '../helpers/hooks';
import SortModal from '../components/SortModal';

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
    const isMobile = useIsMobile();
    const [queryParams] = useSearchParams();
    const queryClient = useQueryClient();
    const showTop = useLocation().state?.showTop;
    const ref = useRef<HTMLHeadingElement | null>(null);
    const scrollDown = useLocation().state?.scrollDown;
    const scrollUp = useLocation().state?.scrollUp;

    const [sort, setSort] = useState(showTop === true ? 'completed_courses' : 'player_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState(showTop === true ? 'DESC' : 'ASC');
    const [page, setPage] = useState(1);
    const [fetchTimeout, setFetchTimeout] = useState(0);
    const {showModal, setShowModal} = useOutletContext<{showModal: string | false, setShowModal: Function}>();

    const { data, isPending, error } = useQuery({
        queryKey: ['Players'],
        queryFn: (): Promise<Players> => fetch(`${import.meta.env.VITE_API_URL}/players?sort=${sort}&search=${search}&direction=${direction}&page=${page}`).then(r => r.json())
    });

    useEffect(() => {
        scrollDown ? ref.current?.scrollIntoView() : '';
        scrollUp ? window.scrollTo(0, 0) : '';
    }, [scrollDown, scrollUp]);

    const loadCourses = (data: Player[]) => {
        if (data.length === 0) {
            return <TableRow>
                <TableCell colSpan={5} className="w-[18ch]">
                    No results for: {search}
                </TableCell>
            </TableRow>
        }
        return data.map((player: Player) => {
            return <TableRow key={player.player_id} route={`/players?playerId=${player.player_id}`} className={`cursor-pointer${queryParams.get('playerId') === player.player_id ? (isMobile ? ' bg-[#2a2a2a]' : ' bg-[#5a5a5a]') : ''}`} scrollTo={ref}>
                <TableCell colName="Player name" className={isMobile ? 'bg-[#333333]' : ''}>
                    <div>
                        <PlayerImg player_id={player.player_id} player_name={player.player_name} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.25rem]"/>
                        {player.player_name}
                    </div>
                </TableCell>
                <TableCell colName="Courses completed">
                    {player.completed_courses}
                </TableCell>
                <TableCell colName="Avg rank">
                    {Number(player.avg_position).toFixed(1)}
                </TableCell>
                <TableCell colName="Number of records">
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
        {showModal === 'playerFilter' ?
        <SortModal setShowModal={setShowModal}
                        sortParams={sortParams}
                        sortOptions={[
                        {name: 'Player name', sort: 'player_name'},
                        {name: 'Courses completed', sort: 'completed_courses'},
                        {name: 'Avg rank', sort: 'avg_position'},
                        {name: 'Number of records', sort: 'total_records'}
                    ]}
                    name="playerFilter"/>
        : ''}
        <H1>Players</H1>
        <Content className="gap-[3.2%]">
            <TableContainer className="h-full mb-[2rem] xl:mb-0">
                {isMobile ?
                <div className="flex gap-[1rem] mb-[1.5rem]">
                    <Search searchParams={searchParams} id="player-search" className="mb-0!"/>
                    <SortButton setShowModal={() => setShowModal('playerFilter')} />
                </div>
                : 
                <Search searchParams={searchParams} id="player-search"/>}
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
                <Pager pagerParams={isPending || error ? {page: 1, maxItems: 1} : pagerParams}/>
            </TableContainer>
            <Content className="xl:max-w-[39.8%] xl:min-w-[39.8%] flex-col!">
                <PlayerDetailsTable ref={ref} isMobile={isMobile} showModal={showModal} setShowModal={setShowModal}/>
            </Content>
        </Content>
    </>
}