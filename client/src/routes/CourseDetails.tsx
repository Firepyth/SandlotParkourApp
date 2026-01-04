import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import { useState } from 'react';
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';
import TableRow from '../components/TableRow';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import Pager from '../components/Pager';

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
    const queryClient = useQueryClient();

    const [sort, setSort] = useState('rank');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [page, setPage] = useState(1);
    const [fetchTimeout, setFetchTimeout] = useState(0);

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
                <TableCell>
                    {courseTime.rank}
                </TableCell>
                <TableCell className="flex">
                    <img src={`https://mc-heads.net/avatar/${courseTime.player_id}`} alt={courseTime.player_name} width="24px" height="24px"/>
                    {courseTime.player_name}
                </TableCell>
                <TableCell>
                    {toTime(courseTime.time)}
                </TableCell>
                <TableCell>
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
        <Search searchParams={searchParams}/>
        <table>
            <thead>
                <TableRow>
                    <TableHeading sortParams={{...sortParams, newSort: 'rank'}}>
                        Rank
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'player_name'}}>
                        Name
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'time'}}>
                        Time
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'deaths'}}>
                        Deaths
                    </TableHeading>
                </TableRow>
            </thead>
            <tbody>
                {isPending ? <LoadingMsg colSpan={4}/> : error ? <ErrorMsg colSpan={4}/> :
                    loadCourses(data.completions || [])
                }
            </tbody>
        </table>
        {isPending ? '' : error ? '' :
            <Pager pagerParams={pagerParams}/>
        }
    </>
}

export default function CourseDetails () {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isPending, error } = useQuery({
        queryKey: [`CourseDetails${id}`],
        queryFn: (): Promise<Course> => fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`).then(r => r.json())
    });

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    return <>
        <h1>Course Stats</h1>
        <h2>{toTitle(data.course_name)}</h2>
        <table>
            <tr>
                <td>Date added:</td>
                <td>{toDate(data.course_created)}</td>
            </tr>
            <tr>
                <td>Total completions:</td>
                <td>{data.total_completions ? data.total_completions : '–'}</td>
            </tr>
            <tr>
                <td>Players completed:</td>
                <td>{data.total_completions ? data.unique_completions : '–'}</td>
            </tr>
            <tr>
                <td colSpan={3}>Fastest player:</td>
            </tr>
            <tr>
                <td onClick={data.total_completions ? () => navigate(`/players/${data.fastest_player_id}/${id}`) : undefined} className="flex cursor-pointer">
                    <img 
                        src={data.total_completions ? `https://mc-heads.net/avatar/${data.fastest_player_id}` : undefined}
                        alt={data.total_completions ? data.fastest_player_name : ''}
                        width="24px" height="24px"/>
                    {data.total_completions ? data.fastest_player_name : '–'}
                </td>
                <td>{data.total_completions ? toTime(data.fastest_time) : '00:00:00.000'}</td>
                <td>({data.total_completions ? data.fastest_deaths : '–'} deaths)</td>
            </tr>
            <tr>
                <td>Average first time:</td>
                <td>{data.total_completions ? toTime(data.avg_first_time) : '00:00:00.000'}</td>
                <td>({data.total_completions ? Number(data.avg_first_deaths).toFixed(1) : '–'} deaths)</td>
            </tr>
        </table>
        
        
        <CourseDetailsTable id={Number(id)}/>
    </>
}