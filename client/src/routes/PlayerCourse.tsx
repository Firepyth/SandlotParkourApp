import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useOutletContext, useParams } from "react-router";
import { toTime, toDate, toTitle } from '../helpers/convert';
import { useEffect, useState } from 'react';
import TableHeading from '../components/stylePresets/TableHeading';
import TableCell from '../components/stylePresets/TableCell';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/stylePresets/TableRow';
import Pager from '../components/Pager';
import { Content, H1, H2, Link, PlayerImg, Table, TableContainer, TBody, THead } from '../components/stylePresets/presetStyles';
import Graph from '../components/Graph';
import { useIsMobile } from '../helpers/hooks';
import SortButton from '../components/SortButton';
import SortModal from '../components/SortModal';

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
    personal_bests: {
        time: number;
        achieved: string;
        deaths: number;
        player_id: string;
        player_name: string;
    }[]
}

interface PlayerCourseTimes {
    time_id: number;
    time: number;
    deaths: number;
    leaderboard_position: number;
    time_achieved: string;
}

interface HoverData {
    time: number;
    achieved: string;
    deaths: number;
    player_id: string;
    player_name: string;
}

interface HoverContent extends HoverData {
    x: number;
    y: number;
}

const PlayerCourseTable = ({ player_id, course_id, total_completions, isMobile, showModal, setShowModal }: { player_id: string, course_id: number, total_completions: number, isMobile: boolean, showModal: string | false, setShowModal: Function }) => {
    const queryClient = useQueryClient();

    const [sort, setSort] = useState('time');
    const [direction, setDirection] = useState('ASC');
    const [page, setPage] = useState(1);

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerCourseCompletions${player_id}_${course_id}`],
        queryFn: (): Promise<PlayerCourseTimes[]> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/completions/${player_id}/${course_id}?sort=${sort}&direction=${direction}&page=${page}`).then(r => r.json())
    });

    const loadCourses = (data: PlayerCourseTimes[]) => {
        return data.map((playerCourseTime: PlayerCourseTimes) => {
            return <TableRow key={playerCourseTime.time_id}>
                <TableCell colName="Time" className={isMobile ? 'bg-[#333333]' : ''}>
                    {toTime(playerCourseTime.time)}
                </TableCell>
                <TableCell colName="Deaths">
                    {playerCourseTime.deaths}
                </TableCell>
                <TableCell colName="Date">
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
        {showModal === 'playerCourseFilter' ?
        <SortModal setShowModal={setShowModal}
                        sortParams={sortParams}
                        sortOptions={[
                        {name: 'Time', sort: 'time'},
                        {name: 'Deaths', sort: 'deaths'},
                        {name: 'Date', sort: 'time_achieved'}
                    ]}
                    name="playerCourseFilter"/>
        : ''}
        <Table>
            <THead>
                <TableRow>
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
            </THead>
            <TBody>
                {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4}/> :
                    loadCourses(data)
                }
            </TBody>
        </Table>
        {isPending || error ? <Pager pagerParams={{page: 1, maxItems: 1}}/> :
            <Pager pagerParams={pagerParams}/>
        }
    </>
}

export default function PlayerCourse () {
    const isMobile = useIsMobile();
    const { player_id, course_id } = useParams();
    const scrollUp = useLocation().state?.scrollUp;

    const [hoverContent, setHoverContent]: [hoverContent: undefined | HoverContent, setHoverContent: Function] = useState();
    const {showModal, setShowModal} = useOutletContext<{showModal: string | false, setShowModal: Function}>();

    const { data, isPending, error } = useQuery({
        queryKey: [`PlayerCourse${player_id}_${course_id}`],
        queryFn: (): Promise<PlayerCourse> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/${player_id}/${course_id}`).then(r => r.json())
    });

    useEffect(() => {
        scrollUp ? window.scrollTo(0, 0) : '';
    }, [scrollUp]);

    const isLoaded = !isPending && !error;

    if (isLoaded && data.course_name === undefined) {
        return <>
            <H1>Error 404</H1>
            <Content>
                <H2>No completions on course {course_id} found by {player_id}. <Link to="/courses">Go back to courses.</Link></H2>
            </Content>
        </>
    }

    const graphParams = {
        hoverContent,
        setHoverContent,
        completions: isLoaded ? data.personal_bests : [{time: 0, achieved: '', player_id: '', player_name: '', deaths: 0}]
    }

    return <>
        <H1>Player Stats by Course</H1>
        <Content className="gap-[3.2%]">
            <TableContainer className="h-full mb-[2rem] xl:mb-0">
                <H2>Personal Best Progression</H2>
                <Graph graphParams={graphParams} isPending={isPending} error={error}/>
            </TableContainer>
            <div className="flex flex-[1_1_auto] overflow-hidden xl:max-w-[39.8%] xl:min-w-[39.8%] flex-col!">
                <H2>
                    <Link className="inline cursor-pointer" to={`/players?playerId=${player_id}`}><PlayerImg player_id={isLoaded ? data.player_id : undefined} player_name={isLoaded ? data.player_name : ''} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.375rem]"/>{isLoaded ? data.player_name : '[Player name]'}</Link> on <Link className="inline cursor-pointer" to={`/courses/${course_id}`}>{isLoaded ? toTitle(data.course_name) : '[Course name]'}</Link>
                </H2>
                <TableContainer>
                    {!isLoaded ? 
                        <>
                            <table className="mb-[.5rem]">
                                <tbody>
                                    <tr>
                                        <td className="pb-[1rem] font-bold">Highest rank:</td>
                                        <td className="pb-[1rem]">–</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Fastest time:</td>
                                        <td>–</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Average time:</td>
                                        <td>–</td>
                                    </tr>
                                    <tr>
                                        <td className="pb-[1rem] font-bold">First time:</td>
                                        <td className="pb-[1rem]">–</td>
                                    </tr>
                                </tbody>
                            </table>
                            {isMobile ?
                                <div className="flex gap-[1rem] mb-[1.5rem]">
                                    <SortButton />
                                </div>
                            : ''}
                            <Table>
                                <THead>
                                    <TableRow>
                                        <TableHeading fakeSort={true}>
                                            Time
                                        </TableHeading>
                                        <TableHeading fakeSort={true}>
                                            Deaths
                                        </TableHeading>
                                        <TableHeading fakeSort={true}>
                                            Date
                                        </TableHeading>
                                    </TableRow>
                                </THead>
                                <TBody>
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            {isPending ? 'Loading...' : error ? 'Error loading data.' : ''}
                                        </TableCell>
                                    </TableRow>
                                </TBody>
                            </Table>
                            <Pager pagerParams={{page: 1, maxItems: 1}}/>
                        </>
                    :
                        <>
                            <table className="mb-[.5rem]">
                                <tbody>
                                    <tr>
                                        <td className="pb-[1rem] font-bold">Highest rank:</td>
                                        <td className="pb-[1rem]">{data.leaderboard_position}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Fastest time:</td>
                                        <td>{toTime(data.fastest_time)} ({data.fastest_deaths} deaths)</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Average time:</td>
                                        <td>{toTime(data.avg_time)} ({Number(data.avg_deaths).toFixed(1)} deaths)</td>
                                    </tr>
                                    <tr>
                                        <td className="pb-[1rem] font-bold">First time:</td>
                                        <td className="pb-[1rem]">{toTime(data.first_time)} ({data.first_deaths} deaths)</td>
                                    </tr>
                                </tbody>
                            </table>
                            {isMobile ?
                                <div className="flex gap-[1rem] mb-[1.5rem]">
                                    <SortButton setShowModal={() => setShowModal('playerCourseFilter')} />
                                </div>
                            : ''}
                            {player_id && course_id ? <PlayerCourseTable player_id={player_id} course_id={Number(course_id)} total_completions={data.total_completions} isMobile={isMobile} showModal={showModal} setShowModal={setShowModal}/> : ''}
                        </>
                    }
                </TableContainer>
            </div>
        </Content>
    </>
}