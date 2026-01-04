import { useState } from "react";
import Search from "./Search";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TableRow from "./stylePresets/TableRow";
import TableHeading from "./stylePresets/TableHeading";
import LoadingMsg from "./LoadingMsg";
import ErrorMsg from "./ErrorMsg";
import TableCell from "./stylePresets/TableCell";
import { toTitle } from "../helpers/convert";

interface SearchResult {
    course_id: number | null;
    course_name: string | null;
    player_id: string | null;
    player_name: string | null;
}

export default function GlobalSearch ({ setShowSearch }: {setShowSearch: Function}) {
    const [search, setSearch] = useState('');
    const [fetchTimeout, setFetchTimeout] = useState(0);
    const queryClient = useQueryClient();
    const setPage = () => {};

    const searchParams = {
        search,
        setPage,
        fetchTimeout,
        setFetchTimeout,
        setSearch,
        queryClient,
        queryKey: `Search`
    }

    const { data, isPending, error } = useQuery({
        queryKey: [`Search`],
        queryFn: (): Promise<SearchResult[]> => fetch(`${import.meta.env.VITE_API_URL}/playercourse/search?search=${search}`).then(r => r.json())
    });

    const loadCourses = (data: SearchResult[]) => {
        const noResult = <TableRow>
                <TableCell>
                    No courses found
                </TableCell>
            </TableRow>;

        if (data.length === undefined) {
            return noResult;
        }

        const rows = data.map((item: SearchResult) => {
            if (item.course_id === null) return;
            return <TableRow route={`/courses/${item.course_id}`} className="cursor-pointer" setShowSearch={setShowSearch}>
                <TableCell className="align-top">
                    {toTitle(item.course_name || '')}
                </TableCell>
            </TableRow>
        }).filter(item => item !== undefined);

        if (rows.length === 0) {
            return noResult;
        }
        console.log(rows);

        return rows;
    }

    const loadPlayers = (data: SearchResult[]) => {
        const noResult = <TableRow>
                <TableCell>
                    No players found
                </TableCell>
            </TableRow>;

        if (data.length === undefined) {
            return noResult;
        }

        const rows = data.map((item: SearchResult) => {
            if (item.player_id === null) return;
            return <TableRow route={`/players?playerId=${item.player_id}`} className="cursor-pointer" setShowSearch={setShowSearch}>
                <TableCell className="flex align-top">
                    <img src={`https://mc-heads.net/avatar/${item.player_id}`} alt={item.player_name || ''} width="24px" height="24px"/>
                    {item.player_name}
                </TableCell>
            </TableRow>
        }).filter(item => item !== undefined);

        if (rows.length === 0) {
            return noResult;
        }
        console.log(rows);

        return rows;
    }

    return <div className="absolute left-0 right-0 w-[400px] top-20 mx-auto bg-white" onClick={(e) => e.stopPropagation()}>
        <Search searchParams={searchParams} autofocus={true} id="global-search"/>
        <div className="flex gap-5">
            <table>
                <thead>
                    <TableHeading>
                        Player name
                    </TableHeading>
                </thead>
                <tbody>
                    {isPending ? <LoadingMsg /> : error ? <ErrorMsg /> : loadPlayers(data)}
                </tbody>
            </table>
            <table>
                <thead>
                    <TableHeading>
                        Course name
                    </TableHeading>
                </thead>
                <tbody>
                    {isPending ? <LoadingMsg /> : error ? <ErrorMsg /> : loadCourses(data)}
                </tbody>
            </table>
        </div>
    </div>
}