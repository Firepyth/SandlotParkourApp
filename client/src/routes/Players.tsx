import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from "react-router";
import TableHeading from '../components/TableHeading';
import TableCell from '../components/TableCell';
import Search from '../components/Search';

interface Player {
    player_id: string;
    completed_courses: number;
    avg_position: number;
    total_records: number;
    player_name: string;
}

export default function Players () {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [queryParams] = useSearchParams();

    const [sort, setSort] = useState(queryParams.get('showTop') === 'true' ? 'completed_courses' : 'player_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState(queryParams.get('showTop') === 'true' ? 'DESC' : 'ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Players'],
        queryFn: (): Promise<Player[]> => fetch(`${import.meta.env.VITE_API_URL}/players?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const loadCourses = (data: Player[]) => {
        if (data.length === undefined) {
            return <tr>
                <td colSpan={5}>
                    No results for: {search}
                </td>
            </tr>
        }
        return data.map((player: Player) => {
            return <tr key={player.player_id} onClick={() => navigate(`/players/${player.player_id}`)} className="cursor-pointer">
                <TableCell className="flex">
                    <img src={`https://mc-heads.net/avatar/${player.player_id}`} alt={player.player_name} width="24px" height="24px"/>
                    {player.player_name}
                </TableCell>
                <TableCell>
                    {player.completed_courses}
                </TableCell>
                <TableCell>
                    {Number(player.avg_position).toFixed(1)}
                </TableCell>
                <TableCell>
                    {player.total_records}
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
        queryKey: 'Players'
    }

    return <>
        <h1>Courses</h1>
        <Search searchParams={searchParams}/>
        <table>
            <thead>
                <tr>
                    <TableHeading sortParams={{...sortParams, newSort: 'player_name'}}>
                        Player name
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'completed_courses'}}>
                        Completed courses
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'avg_position'}}>
                        Average placement
                    </TableHeading>
                    <TableHeading sortParams={{...sortParams, newSort: 'total_records'}}>
                        Total records
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