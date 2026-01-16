import { useQuery } from '@tanstack/react-query';
import HomeTable from '../components/HomeTable';
import TableHeading from '../components/stylePresets/TableHeading';
import ErrorMsg from '../components/ErrorMsg';
import LoadingMsg from '../components/LoadingMsg';
import TableRow from '../components/stylePresets/TableRow';
import { H1, H2, Table, TableContainer, TBody, THead, Link } from '../components/stylePresets/presetStyles';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function Main () {
    const scrollUp = useLocation().state?.scrollUp;

    const { data, isPending, error } = useQuery({
        queryKey: ['Main'],
        queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/playercourse/recent`).then(r => r.json())
    });

    useEffect(() => {
        scrollUp ? window.scrollTo(0, 0) : '';
    }, [scrollUp]);

    return <>
        <H1><strong>The&nbsp;Sandlot</strong> Parkour&nbsp;Rankings</H1>
        <div className="items-start xl:flex xl:flex-row xl:gap-[3.2%]">
            <div className="w-full mb-[2rem] xl:mb-0 xl:w-1/3">
                <H2>About</H2>
                <p className="text-[1.5rem]/[1.375em] font-[100] mb-[.75em]">This site is dedicated to displaying the data and rankings for all parkour courses on The&nbsp;Sandlot Minecraft server.</p>
                <p className="mb-[.75em]">The&nbsp;Sandlot is a family-friendly Minecraft environment for younger players that aims to provide a safe space that is free from swearing, abusive language, and mature content that is often found on many Minecraft servers—and the internet in general.</p>
				<p className="mb-[.75em]">The&nbsp;Sandlot features a number of mini-games players can enjoy, including parkour.</p>
                <p className="mt-[1.5rem] uppercase text-[.75em]/[1em] tracking-[.1em]"><a href="https://www.sandlotminecraft.com/pages/about/" target="_blank" className="text-[#ff8066]"><span className="underline">Learn more about The&nbsp;Sandlot</span> <i className="fa-solid fa-arrow-up-right-from-square"></i></a></p>
            </div>
            <div className="w-full lg:flex lg:gap-[3.2%] xl:gap-[5%] xl:w-2/3">
                <TableContainer className="w-full mb-[2rem] lg:mb-0">
                    <H2>Top players</H2>
                    <Table className="max-h-none! min-h-auto!">
                        <THead responsive={false}>
                            <TableRow responsive={false} isTabbable={false}>
                                <TableHeading>
                                    Player name
                                </TableHeading>
                                <TableHeading>
                                    Courses completed
                                </TableHeading>
                            </TableRow>
                        </THead>
                        <TBody>
                            {isPending ? <LoadingMsg colSpan={2}/> : error ? <ErrorMsg colSpan={2}/> :
                                <HomeTable data={data} type="player" />
                            }
                        </TBody>
                    </Table>
                    <Link className="mt-[1.5rem] uppercase text-[.75em]/[1em] tracking-[.1em]" to="/players" state={{showTop: true}} onClick={() => window.scrollTo(0, 0)}>View more</Link>
                </TableContainer>
                <TableContainer className="w-full">
                    <H2>Recent courses</H2>
                    <Table className="max-h-none! min-h-auto!">
                        <THead responsive={false}>
                            <TableRow responsive={false} isTabbable={false}>
                                <TableHeading>
                                    Course name
                                </TableHeading>
                                <TableHeading>
                                    Date added
                                </TableHeading>
                            </TableRow>
                        </THead>
                        <TBody>
                            {isPending ? <LoadingMsg colSpan={2}/> : error ? <ErrorMsg colSpan={2}/> :
                                <HomeTable data={data} type="course" />
                            }
                        </TBody>
                    </Table>
                    <Link className="mt-[1.5rem] uppercase text-[.75em]/[1em] tracking-[.1em]" to="/courses" state={{showRecent: true}} onClick={() => window.scrollTo(0, 0)}>View more</Link>
                </TableContainer>
            </div>
        </div>
    </>
}