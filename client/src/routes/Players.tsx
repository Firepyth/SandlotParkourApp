import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from "react-router";
import TableHeading from '../components/TableHeading';

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

    const [sort, setSort] = useState('player_name');
    const [search, setSearch] = useState('');
    const [direction, setDirection] = useState('ASC');
    const [fetchTimeout, setFetchTimeout] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['Players'],
        queryFn: (): Promise<Player[]> => fetch(`${import.meta.env.VITE_API_URL}/players?sort=${sort}&search=${search}&direction=${direction}`).then(r => r.json())
    });

    const handleSort = async (newSort: string) => {
        if (sort === newSort) {
            await setDirection(direction === 'ASC' ? 'DESC' : 'ASC');
        }
        else {
            await setDirection('ASC');
            await setSort(newSort);
        }
        queryClient.invalidateQueries({queryKey: ['Players']});
    }

    const handleSearch = async (newSearch: string) => {
        if (search !== newSearch) {
            await setSearch(newSearch);
            clearTimeout(fetchTimeout);
            setFetchTimeout(setTimeout(async () => queryClient.invalidateQueries({queryKey: ['Players']}), 150));
        }
    }

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
                <td key={`${player.player_id}_name`} className="flex">
                    <img src={`https://mc-heads.net/avatar/${player.player_id}`} alt={player.player_name} width="24px" height="24px"/>
                    {player.player_name}
                </td>
                <td key={`${player.player_id}_created`}>
                    {player.completed_courses}
                </td>
                <td key={`${player.player_id}_avg`}>
                    {Number(player.avg_position).toFixed(1)}
                </td>
                <td key={`${player.player_id}_record`}>
                    {player.total_records}
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
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'player_name'}>
                        Player name
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'completed_courses'}>
                        Completed courses
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'avg_position'}>
                        Average placement
                    </TableHeading>
                    <TableHeading handleSort={handleSort} sort={sort} direction={direction} column={'total_records'}>
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