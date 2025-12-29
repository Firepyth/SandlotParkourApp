import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import { useState } from 'react';
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';

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

const CourseDetailsTable = ({ id, sort, search, direction }: { id: number, sort: string, search: string, direction: string }) => {
    const navigate = useNavigate();

    const { data, isPending, error } = useQuery({
        queryKey: [`CourseDetailsCompletions${id}`],
        queryFn: (): Promise<CourseTime[]> => fetch(`${import.meta.env.VITE_API_URL}/courses/completions/${id}?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: CourseTime[]) => {
        if (data.length === undefined) {
            return <tr>
                <td colSpan={4}>
                    No completions found.
                </td>
            </tr>
        }
        return data.map((courseTime: CourseTime) => {
            return <tr key={courseTime.time_id} onClick={() => navigate(`/players/${courseTime.player_id}/${id}`)} className="cursor-pointer">
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
            </tr>
        });
    }

    const loadingMsg = <>
        <tr>
            <td colSpan={4}>
                Loading...
            </td>
        </tr>
    </>

    const errorMsg = <>
        <tr>
            <td colSpan={4}>
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

export default function CourseDetails () {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams();

    const [sort, setSort] = useState('rank');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: [`CourseDetails${id}`],
        queryFn: (): Promise<Course> => fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`).then(r => r.json())
    });

    if (isPending) return <p>Loading...</p>;
    if (error) return <p>Error retrieving data.</p>;

    const searchParams = {
        search,
        fetchTimeout,
        setFetchTimeout,
        setSearch,
        queryClient,
        queryKey: `CourseDetailsCompletions${id}`
    }

    const sortParams = {
        sort,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: `CourseDetailsCompletions${id}`
    }

    return <>
        <h1>{toTitle(data.course_name)}</h1>
        <p>Created: {toDate(data.course_created)}</p>
        {data.total_completions === null ? <p>No completions found.</p> : <>
            <p>Total completions: {data.total_completions}</p>
            <p>Unique completions: {data.unique_completions}</p>
            <p>Fastest time: {toTime(data.fastest_time)}</p>
            <p>Fastest deaths: {data.fastest_deaths}</p>
            <p onClick={() => navigate(`/players/${data.fastest_player_id}/${id}`)} className="flex cursor-pointer">
                Fastest player: <img src={`https://mc-heads.net/avatar/${data.fastest_player_id}`} alt={data.fastest_player_name} width="24px" height="24px"/>{data.fastest_player_name}
            </p>
            <p>Average first time: {toTime(data.avg_first_time)}</p>
            <p>Average first deaths: {Number(data.avg_first_deaths).toFixed(1)}</p>
        </>}
        <Search searchParams={searchParams}/>
        <table>
            <thead>
                <tr>
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
                </tr>
            </thead>
            <tbody>
                <CourseDetailsTable id={Number(id)} sort={sort} search={search} direction={direction}/>
            </tbody>
        </table>
    </>
}