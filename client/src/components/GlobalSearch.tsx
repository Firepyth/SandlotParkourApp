import { useState } from "react";
import Search from "./Search";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TableRow from "./stylePresets/TableRow";
import TableHeading from "./stylePresets/TableHeading";
import LoadingMsg from "./LoadingMsg";
import ErrorMsg from "./ErrorMsg";
import TableCell from "./stylePresets/TableCell";
import { toTitle } from "../helpers/convert";
import { PlayerImg, Table, TableContainer, TBody, THead } from "./stylePresets/presetStyles";

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
            return <TableRow route={`/courses/${item.course_id}`} className="cursor-pointer" setShowSearch={setShowSearch} key={item.course_id}>
                <TableCell>
                    {toTitle(item.course_name || '')}
                </TableCell>
            </TableRow>
        }).filter(item => item !== undefined);

        if (rows.length === 0) {
            return noResult;
        }

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
            return <TableRow route={`/players?playerId=${item.player_id}`} className="cursor-pointer" setShowSearch={setShowSearch} key={item.player_id}>
                <TableCell>
                    <PlayerImg player_id={item.player_id || ''} player_name={item.player_name || ''} className="inline-block w-[1.5rem] h-[1.5rem] mt-[-.25rem]"/>
                    {item.player_name}
                </TableCell>
            </TableRow>
        }).filter(item => item !== undefined);

        if (rows.length === 0) {
            return noResult;
        }

        return rows;
    }

    return <TableContainer className="absolute left-0 right-0 w-[32.5rem] top-20 mx-auto z-1 shadow-[0_0_0_max(100vh,_100vw)_rgba(0,_0,_0,_.5)]" onClick={(e: Event) => e.stopPropagation()}>
        <Search searchParams={searchParams} autofocus={true} id="global-search"/>
        <div className="flex gap-[1rem]">
            <Table className="w-full h-[8.9375rem]" strictHeight={true}>
                <THead>
                    <TableRow>
                        <TableHeading>
                            Player name
                        </TableHeading>
                    </TableRow>
                </THead>
                <TBody>
                    {isPending ? <LoadingMsg /> : error ? <ErrorMsg /> : loadPlayers(data)}
                </TBody>
            </Table>
            <Table className="w-full h-[8.9375rem]" strictHeight={true}>
                <THead>
                    <TableRow>
                        <TableHeading>
                            Course name
                        </TableHeading>
                    </TableRow>
                </THead>
                <TBody>
                    {isPending ? <LoadingMsg /> : error ? <ErrorMsg /> : loadCourses(data)}
                </TBody>
            </Table>
        </div>
    </TableContainer>
}