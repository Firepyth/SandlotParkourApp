import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import TableHeading from '../components/TableHeading';

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

    const [sort, setSort] = useState('course_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Courses'],
        queryFn: (): Promise<Course[]> => fetch(`${import.meta.env.VITE_API_URL}/courses?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const handlePlayerNavigate = (e: any, course: Course) => {
        e.stopPropagation();
        navigate(`/players/${course.fastest_player_id}/${course.course_id}`);
    }

    const handleSort = async (newSort: string) => {
        if (sort === newSort) {
            await setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
        }
        else {
            await setDirection('ASC');
            await setSort(newSort);
        }
        queryClient.invalidateQueries({queryKey: ['Courses']});
    }

    const handleSearch = async (newSearch: string) => {
        if (search !== newSearch) {
            await setSearch(newSearch);
            clearTimeout(fetchTimeout);
            setFetchTimeout(setTimeout(async () => queryClient.invalidateQueries({queryKey: ['Courses']}), 150));
        }
    }

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
                <td key={`${course.course_id}_name`}>
                    {toTitle(course.course_name)}
                </td>
                <td key={`${course.course_id}_created`}>
                    {toDate(course.course_created)}
                </td>
                <td key={`${course.course_id}_avg`}>
                    {toTime(course.avg_time)}
                </td>
                <td key={`${course.course_id}_record`}>
                    {toTime(course.fastest_time)}
                </td>
                <td key={`${course.course_id}_player`} className="flex" onClick={(e) => handlePlayerNavigate(e, course)}>
                    <img src={`https://mc-heads.net/avatar/${course.fastest_player_id}`} alt={course.fastest_player_name} width="24px" height="24px"/>
                    {course.fastest_player_name}
                </td>
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

    return <>
        <h1>Courses</h1>
        <input className="border-1" type="text" value={search} onChange={(e) => handleSearch(e.target.value)} />
        <table>
            <thead>
                <tr>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'course_name'}>
                        Course name
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'course_created'}>
                        Date added
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'avg_time'}>
                        Average time
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'fastest_time'}>
                        Fastest time
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'fastest_player_name'}>
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