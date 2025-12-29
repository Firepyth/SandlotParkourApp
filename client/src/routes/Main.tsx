import { useQuery } from '@tanstack/react-query';
import HomeTable from '../components/HomeTable';
import { Link } from "react-router";
import Footer from '../components/Footer';
import TableHeading from '../components/TableHeading';
import ErrorMsg from '../components/ErrorMsg';
import LoadingMsg from '../components/LoadingMsg';
import TableRow from '../components/TableRow';

export default function Main () {
    const { data, isPending, error } = useQuery({
        queryKey: ['Main'],
        queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/playercourse/recent`).then(r => r.json())
    });

    return <>
        <h1>Main Title</h1>
        <h2>About</h2>
        <p>Basic site description :D</p>
        <div className="flex gap-5">
            <div>
                <h2>Recently added courses</h2>
                <table>
                    <thead>
                        <TableRow>
                            <TableHeading>
                                Course name
                            </TableHeading>
                            <TableHeading>
                                Date added
                            </TableHeading>
                        </TableRow>
                    </thead>
                    <tbody>
                        {isPending ? <LoadingMsg colSpan={2}/> : error ? <ErrorMsg colSpan={2}/> :
                            <HomeTable data={data} type="course" />
                        }
                    </tbody>
                </table>
                <Link to={{pathname: "/courses", search: "?showRecent=true"}}>See all</Link>
            </div>
            <div>
                <h2>Top players</h2>
                <table>
                    <thead>
                        <TableRow>
                            <TableHeading>
                                Player name
                            </TableHeading>
                            <TableHeading>
                                Courses
                            </TableHeading>
                        </TableRow>
                    </thead>
                    <tbody>
                        {isPending ? <LoadingMsg colSpan={2}/> : error ? <ErrorMsg colSpan={2}/> :
                            <HomeTable data={data} type="player" />
                        }
                    </tbody>
                </table>
                <Link to={{pathname: "/players", search: "?showTop=true"}}>See all</Link>
            </div>
        </div>
        <Footer />
    </>
}