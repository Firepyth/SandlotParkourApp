import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router";
import { toDate, toTime } from '../helpers/convert';

interface Course {
    name: string;
    created: string;
    total_completions: number;
    unique_completions: number;
    fastest_time: number;
    fastest_deaths: number;
    fastest_player_id: string;
    average_first_time: number;
    average_first_deaths: number;
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

const CourseDetailsTable = ({ id }: { id: number }) => {
    const navigate = useNavigate();

    const { data, isPending, error } = useQuery({
        queryKey: [`CourseDetailsCompletions${id}`],
        queryFn: (): Promise<CourseTime[]> => fetch(`${import.meta.env.VITE_API_URL}/courses/times/${id}`).then(r => r.json())
    });

    const loadCourses = (data: CourseTime[]) => {
        return data.map((courseTime: CourseTime) => {
            return <tr key={courseTime.time_id} onClick={() => navigate(`/players/${courseTime.player_id}/${id}`)} className="cursor-pointer">
                <td key={`${courseTime.time_id}_rank`}>
                    {courseTime.rank}
                </td>
                <td key={`${courseTime.time_id}_name`} className="flex">
                    <img src={`https://mc-heads.net/avatar/${courseTime.player_id}`} alt={courseTime.player_name} width="24px" height="24px"/>
                    {courseTime.player_name}
                </td>
                <td key={`${courseTime.time_id}_time`}>
                    {toTime(courseTime.time)}
                </td>
                <td key={`${courseTime.time_id}_deaths`}>
                    {courseTime.deaths}
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
        {isPending ? loadingMsg : error ? errorMsg :
            loadCourses(data)
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
        <h1>{data.name}</h1>
        <p>Created: {toDate(data.created)}</p>
        <p>Total completions: {data.total_completions}</p>
        <p>Unique completions: {data.unique_completions}</p>
        <p>Fastest time: {toTime(data.fastest_time)}</p>
        <p>Fastest deaths: {data.fastest_deaths}</p>
        <p onClick={() => navigate(`/players/${data.fastest_player_id}/${id}`)} className="flex cursor-pointer">
            Fastest player: <img src={`https://mc-heads.net/avatar/${data.fastest_player_id}`} alt={data.fastest_player_name} width="24px" height="24px"/>{data.fastest_player_name}
        </p>
        <p>Average first time: {toTime(data.average_first_time)}</p>
        <p>Average first deaths: {Number(data.average_first_deaths).toFixed(1)}</p>
        <table>
            <thead>
                <tr>
                    <th>
                        Rank
                    </th>
                    <th>
                        Name
                    </th>
                    <th>
                        Time
                    </th>
                    <th>
                        Deaths
                    </th>
                </tr>
            </thead>
            <tbody>
                <CourseDetailsTable id={Number(id)}/>
            </tbody>
        </table>
    </>
}