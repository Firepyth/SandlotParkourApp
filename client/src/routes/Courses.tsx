import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/TableRow';

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
    const queryClient = useQueryClient();
    const showRecent = useLocation().state?.showRecent;

    const [sort, setSort] = useState(showRecent === true ? 'course_created' : 'course_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState(showRecent === true ? 'DESC' : 'ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Courses'],
        queryFn: (): Promise<Course[]> => fetch(`${import.meta.env.VITE_API_URL}/courses?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: Course[]) => {
        if (data.length === undefined) {
            return <TableRow>
                <TableCell colSpan={5}>
                    No results for: {search}
                </TableCell>
            </TableRow>
        }
        return data.map((course: Course) => {
            return <TableRow key={course.course_id} route={`/courses/${course.course_id}`} className="cursor-pointer">
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
                <TableCell className="flex">
                    <img src={`https://mc-heads.net/avatar/${course.fastest_player_id}`} alt={course.fastest_player_name} width="24px" height="24px"/>
                    {course.fastest_player_name}
                </TableCell>
            </TableRow>
        });
    }

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
                <TableRow>
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
                </TableRow>
            </thead>
            <tbody>
                {isPending ? <LoadingMsg colSpan={5}/> : error ? <ErrorMsg colSpan={5}/> :
                    loadCourses(data)
                }
            </tbody>
        </table>
    </>
}