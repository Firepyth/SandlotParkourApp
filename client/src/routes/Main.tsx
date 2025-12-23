import { useQuery } from '@tanstack/react-query';
import HomeTable from '../components/HomeTable';
import { Link } from "react-router";
import Footer from '../components/Footer';

export default function Main () {
    const { data, isPending, error } = useQuery({
        queryKey: ['Main'],
        queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/playercourse/recent`).then(r => r.json())
    });

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
        <h1>Main Title</h1>
        <h2>About</h2>
        <p>Basic site description :D</p>
        <div className="flex gap-5">
            <div>
                <h2>Recently added courses</h2>
                <table>
                    <thead>
                        <tr>
                            <th>
                                Course name
                            </th>
                            <th>
                                Date added
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? loadingMsg : error ? errorMsg :
                            <>
                                <HomeTable data={data} type="course" />
                            </>
                        }
                    </tbody>
                </table>
                <Link to="/courses">See all</Link>
            </div>
            <div>
                <h2>Top players</h2>
                <table>
                    <thead>
                        <tr>
                            <th>
                                Player name
                            </th>
                            <th>
                                Courses
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? loadingMsg : error ? errorMsg :
                            <>
                                <HomeTable data={data} type="player" />
                            </>
                        }
                    </tbody>
                </table>
                <Link to="/players">See all</Link>
            </div>
        </div>
        <Footer />
    </>
}