import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';

interface Course {
    course_id: number;
    course_name: string;
    course_created: string;
    fastest_time: number;
    fastest_player_id: string;
    fastest_player_name: string;
    avg_time: number;
}

export default function Courses () {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [queryParams] = useSearchParams();

    const [sort, setSort] = useState(queryParams.get('showRecent') === 'true' ? 'course_created' : 'course_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState(queryParams.get('showRecent') === 'true' ? 'DESC' : 'ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Courses'],
        queryFn: (): Promise<Course[]> => fetch(`${import.meta.env.VITE_API_URL}/courses?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: Course[]) => {
        if (data.length === undefined) {
            return <tr>
                <td colSpan={5}>
                    No results for: {search}
                </td>
            </tr>
        }
        return data.map((course: Course) => {
            return <tr key={course.course_id} onClick={() => navigate(`/courses/${course.course_id}`)} className="cursor-pointer">
                <TableCell>
                    {toTitle(course.course_name)}
                </TableCell>
                <TableCell>
                    {toDate(course.course_created)}
                </TableCell>
                <TableCell>
                    {toTime(course.avg_time)}
                </TableCell>
                <TableCell>
                    {toTime(course.fastest_time)}
                </TableCell>
                <TableCell className="flex" route={`/players/${course.fastest_player_id}/${course.course_id}`}>
                    <img src={`https://mc-heads.net/avatar/${course.fastest_player_id}`} alt={course.fastest_player_name} width="24px" height="24px"/>
                    {course.fastest_player_name}
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

    const searchParams = {
        search,
        fetchTimeout,
        setFetchTimeout,
        setSearch,
        queryClient,
        queryKey: 'Courses'
    }

    const sortParams = {
        sort,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: 'Courses'
    }

    return <>
        <h1>Courses</h1>
        <Search searchParams={searchParams}/>
        <table>
            <thead>
                <tr>
                    <TableHeading sortParams={{...sortParams, newSort: 'course_name'}}>
                        Course name
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'course_created'}}>
                        Date added
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'avg_time'}}>
                        Average time
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'fastest_time'}}>
                        Fastest time
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'fastest_player_name'}}>
                        Fastest player
                    </TableHeading>
                </tr>
            </thead>
            <tbody>
                {isPending ? loadingMsg : error ? errorMsg :
                    loadCourses(data)
                }
            </tbody>
        </table>
    </>
}