import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import { useEffect, useRef, useState } from 'react';
import TableHeading from '../components/stylePresets/TableHeading';
import TableCell from '../components/stylePresets/TableCell';
import Search from '../components/Search';
import TableRow from '../components/stylePresets/TableRow';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import Pager from '../components/Pager';
import { Content, H1, PlayerImg, Table, TableContainer, TBody, THead, Link, H2 } from '../components/stylePresets/presetStyles';
import Graph from '../components/Graph';
import PlaceholderCourseTable from '../components/PlaceholderCourseTable';
import { useIsMobile } from '../helpers/hooks';
import SortModal from '../components/SortModal';
import SortButton from '../components/SortButton';

interface Course {
    course_name: string;
    course_created: string;
    total_completions: number;
    unique_completions: number;
    fastest_time: number;
    fastest_deaths: number;
    fastest_player_id: string;
    avg_first_time: number;
    avg_first_deaths: number;
    fastest_player_name: string;
    records: Record[]
}

interface Record {
    time: number;
    achieved: string;
    player_id: string;
    player_name: string;
    deaths: number;
}

interface HoverContent extends Record {
    x: number;
    y: number;
}

interface CourseTime {
    rank: number;
    player_id: string;
    player_name: string;
    time: number;
    deaths: number;
    time_id: number;
}

interface CourseTimes {
    matched_completions: number;
    completions: CourseTime[];
}

const CourseDetailsTable = ({ id }: { id: number }) => {
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();

    const [sort, setSort] = useState('rank');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [page, setPage] = useState(1);
    const [fetchTimeout, setFetchTimeout] = useState(0);
    const {showModal, setShowModal} = useOutletContext<{showModal: string | false, setShowModal: Function}>();

    const { data, isPending, error } = useQuery({
        queryKey: [`CourseDetailsCompletions${id}`],
        queryFn: (): Promise<CourseTimes> => fetch(`${import.meta.env.VITE_API_URL}/courses/completions/${id}?sort=${sort}&search=${search}&direction=${direction}&page=${page}`).then(r => r.json())
    });

    const loadCourses = (data: CourseTime[]) => {
        if (data.length === 0) {
            return <TableRow>
                <TableCell colSpan={4}>
                    No completions found.
                </TableCell>
            </TableRow>
        }
        return data.map((courseTime: CourseTime) => {
            return <TableRow key={courseTime.player_id} route={`/players/${courseTime.player_id}/${id}`} className="cursor-pointer">
                <TableCell colName="Rank" className={isMobile ? 'bg-[#333333]' : ''}>
                    {courseTime.rank}
                </TableCell>
                <TableCell colName="Player name">
                    <div>
                        <PlayerImg player_id={courseTime.player_id} player_name={courseTime.player_name} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.25rem]"/>
                        {courseTime.player_name}
                    </div>
                </TableCell>
                <TableCell colName="Time">
                    {toTime(courseTime.time)}
                </TableCell>
                <TableCell colName="Deaths">
                    {courseTime.deaths}
                </TableCell>
            </TableRow>
        });
    }

    const searchParams = {
        search,
        setPage,
        fetchTimeout,
        setFetchTimeout,
        setSearch,
        queryClient,
        queryKey: `CourseDetailsCompletions${id}`
    }

    const sortParams = {
        sort,
        setPage,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: `CourseDetailsCompletions${id}`
    }

    const pagerParams = {
        page,
        setPage,
        fetchTimeout,
        queryClient,
        queryKey: `CourseDetailsCompletions${id}`,
        maxItems: data?.matched_completions
    }

    return <>
        {showModal === 'courseDetailFilter' ?
            <SortModal setShowModal={setShowModal}
                         sortParams={sortParams}
                         sortOptions={[
                            {name: 'Rank', sort: 'rank'},
                            {name: 'Player name', sort: 'player_name'},
                            {name: 'Time', sort: 'time'},
                            {name: 'Deaths', sort: 'deaths'}
                         ]}
                         name="courseDetailFilter"/>
        : ''}
        {isMobile ?
        <div className="flex gap-[1rem] mb-[1.5rem]">
            <Search searchParams={searchParams} id="course-player-search" className="mb-0!"/>
            <SortButton setShowModal={() => setShowModal('courseDetailFilter')} />
        </div>
        : 
        <Search searchParams={searchParams} id="course-player-search"/>}
        <Table>
            <THead>
                <TableRow isTabbable={false}>
                    <TableHeading sortParams={{...sortParams, newSort: 'rank'}}>
                        Rank
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'player_name'}}>
                        Player name
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'time'}}>
                        Time
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'deaths'}}>
                        Deaths
                    </TableHeading>
                </TableRow>
            </THead>
            <TBody>
                {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4}/> :
                    loadCourses(data.completions || [])
                }
            </TBody>
        </Table>
        {isPending || error ? <Pager pagerParams={{page: 1, maxItems: 1}}/> :
            <Pager pagerParams={pagerParams}/>
        }
    </>
}

export default function CourseDetails () {
    const navigate = useNavigate();
    const { id } = useParams();
    const ref = useRef<HTMLHeadingElement | null>(null);
    const scrollDown = useLocation().state?.scrollDown;
    const scrollUp = useLocation().state?.scrollUp;

    const [hoverContent, setHoverContent]: [hoverContent: undefined | HoverContent, setHoverContent: Function] = useState();

    const { data, isPending, error } = useQuery({
        queryKey: [`CourseDetails${id}`],
        queryFn: (): Promise<Course> => fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`).then(r => r.json())
    });

    useEffect(() => {
        scrollDown ? ref.current?.scrollIntoView() : '';
        scrollUp ? window.scrollTo(0, 0) : '';
    }, [scrollDown, scrollUp]);

    const isLoaded = !isPending && !error;

    if (isLoaded && data.course_name === undefined) {
        return <>
            <H1>Error 404</H1>
            <Content>
                <H2>No course found with the ID {id}. <Link to="/courses" className="inline">Go back to courses.</Link></H2>
            </Content>
        </>
    }

    const graphParams = {
        navigate,
        id: Number(id),
        hoverContent,
        setHoverContent,
        completions: isLoaded ? data.records : [{time: 0, achieved: '', player_id: '', player_name: '', deaths: 0}]
    }

    return <>
        <H1>Course Stats</H1>
        <Content className="gap-[3.2%]">
            <TableContainer className="h-full mb-[2rem] xl:mb-0">
                <H2>Record Progression</H2>
                <Graph graphParams={graphParams} isPending={isPending} error={error}/>
            </TableContainer>
            <div className="flex flex-[1_1_auto] overflow-hidden xl:max-w-[39.8%] xl:min-w-[39.8%] flex-col!">
                <H2 ref={ref}>{isLoaded ? toTitle(data.course_name) : '[Course name]'}</H2>
                <TableContainer>
                    {!isLoaded ? <PlaceholderCourseTable /> :
                        <table className="mb-[.5rem]">
                            <tbody>
                                <tr>
                                    <td className="font-semibold">Date added:</td>
                                    <td>{toDate(data.course_created)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">Total completions:</td>
                                    <td>{data.total_completions ? data.total_completions : '–'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold pb-[1rem]">Players completed:</td>
                                    <td className="pb-[1rem]">{data.total_completions ? data.unique_completions : '–'}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">Fastest player:</td>
                                    <td>
                                        {data.total_completions ?
                                            <Link to={`/players/${data.fastest_player_id}/${id}`}>
                                                <PlayerImg 
                                                    player_id={data.fastest_player_id}
                                                    player_name={data.fastest_player_name}
                                                    className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.25rem]"/>
                                                {data.fastest_player_name}
                                            </Link>
                                            :
                                            <><PlayerImg 
                                                player_id={undefined}
                                                player_name={''}
                                                className="inline-block w-[1.5rem] h-[1.5rem]"/> –</>
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">Fastest time:</td>
                                    <td>{data.total_completions ? toTime(data.fastest_time) : '00:00:00.000'} ({data.total_completions ? data.fastest_deaths : '–'} deaths)</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold pb-[1rem]">Average first time:</td>
                                    <td className="pb-[1rem]">{data.total_completions ? toTime(data.avg_first_time) : '00:00:00.000'} ({data.total_completions ? Number(data.avg_first_deaths).toFixed(1) : '–'} deaths)</td>
                                </tr>
                            </tbody>
                        </table>
                    }
                    
                    <CourseDetailsTable id={Number(id)}/>
                </TableContainer>
            </div>
        </Content>
    </>
}