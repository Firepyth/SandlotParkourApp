import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from "react-router";
import { toDate, toTime, toTitle } from '../helpers/convert';
import TableHeading from '../components/stylePresets/TableHeading';
import TableCell from '../components/stylePresets/TableCell';
import Search from '../components/Search';
import LoadingMsg from '../components/LoadingMsg';
import ErrorMsg from '../components/ErrorMsg';
import TableRow from '../components/stylePresets/TableRow';
import Pager from '../components/Pager';
import { Content, H1, H2, PlayerImg, Table, TableContainer, TBody, THead } from '../components/stylePresets/presetStyles';

interface Course {
    course_id: number;
    course_name: string;
    course_created: string;
    fastest_time: number;
    fastest_player_id: string;
    fastest_player_name: string;
    avg_time: number;
}

interface Courses {
    matched_courses: number;
    courses: Course[];
}

export default function Courses () {
    const queryClient = useQueryClient();
    const showRecent = useLocation().state?.showRecent;

    const [sort, setSort] = useState(showRecent === true ? 'course_created' : 'course_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState(showRecent === true ? 'DESC' : 'ASC');
    const [page, setPage] = useState(1);
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Courses'],
        queryFn: (): Promise<Courses> => fetch(`${import.meta.env.VITE_API_URL}/courses?sort=${sort}&search=${search}&direction=${direction}&page=${page}`).then(r => r.json())
    });

    const loadCourses = (data: Course[]) => {
        if (data.length === 0) {
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
                <TableCell className="flex min-w-[16ch] items-center">
                    <PlayerImg player_id={course.fastest_player_id} player_name={course.fastest_player_name}/>
                    {course.fastest_player_name}
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
        queryKey: 'Courses'
    }

    const sortParams = {
        sort,
        setPage,
        direction,
        setDirection,
        setSort,
        queryClient,
        queryKey: 'Courses'
    }

    const pagerParams = {
        page,
        setPage,
        fetchTimeout,
        queryClient,
        queryKey: 'Courses',
        maxItems: data?.matched_courses
    }

    return <>
        <H1>Courses</H1>
        <Content className="gap-[3.2%]">
            <TableContainer>
                <Search searchParams={searchParams} id="course-search"/>
                <Table>
                    <THead>
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
                    </THead>
                    <TBody>
                        {isPending ? <LoadingMsg colSpan={5}/> : error ? <ErrorMsg colSpan={5}/> :
                            loadCourses(data.courses || [])
                        }
                    </TBody>
                </Table>
                {isPending ? '' : error ? '' :
                    <Pager pagerParams={pagerParams}/>
                }
            </TableContainer>
            <TableContainer>
                <H2>[Course name]</H2>
                <table>
                    <tr>
                        <td>Date added:</td>
                        <td>–</td>
                    </tr>
                    <tr>
                        <td>Total completions:</td>
                        <td>–</td>
                    </tr>
                    <tr>
                        <td>Players completed:</td>
                        <td>–</td>
                    </tr>
                    <tr>
                        <td colSpan={3}>Fastest player:</td>
                    </tr>
                    <tr>
                        <td><img src={undefined} alt="" className="w-[24px] h-[24px] inline"/> –</td>
                        <td>00:00:00.000</td>
                        <td>(– deaths)</td>
                    </tr>
                    <tr>
                        <td>Average first time:</td>
                        <td>00:00:00.000</td>
                        <td>(– deaths)</td>
                    </tr>
                </table>
                <Content className="flex-col">
                    <Search id="" />
                    <Table>
                        <THead>
                            <TableRow>
                                <TableHeading fakeSort={true}>
                                    Rank
                                </TableHeading>
                                <TableHeading fakeSort={true}>
                                    Player name
                                </TableHeading>
                                <TableHeading fakeSort={true}>
                                    Time
                                </TableHeading>
                                <TableHeading fakeSort={true}>
                                    Deaths
                                </TableHeading>
                            </TableRow>
                        </THead>
                        <tbody>
                            
                        </tbody>
                    </Table>
                    <Pager pagerParams={{page: 1, setPage: () => {}, queryClient, maxItems: 1, queryKey: "blank"}}/>
                </Content>
            </TableContainer>
        </Content>
    </>
}