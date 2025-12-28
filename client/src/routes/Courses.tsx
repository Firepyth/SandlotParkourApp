import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router";
import { toDate, toTime } from '../helpers/convert';

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
    const { data, isPending, error } = useQuery({
        queryKey: ['Courses'],
        queryFn: (): Promise<Course[]> => fetch(`${import.meta.env.VITE_API_URL}/courses`).then(r => r.json())
    });

    const handlePlayerNavigate = (e: any, course: Course) => {
        e.stopPropagation();
        navigate(`/players/${course.fastest_player_id}/${course.course_id}`)
    }

    const loadCourses = (data: Course[]) => {
        return data.map((course: Course) => {
            return <tr key={course.course_id} onClick={() => navigate(`/courses/${course.course_id}`)} className="cursor-pointer">
                <td key={`${course.course_id}_name`}>
                    {course.course_name}
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
        <table>
            <thead>
                <tr>
                    <th>
                        Course name
                    </th>
                    <th>
                        Date added
                    </th>
                    <th>
                        Average time
                    </th>
                    <th>
                        Fastest time
                    </th>
                    <th>
                        Fastest player
                    </th>
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