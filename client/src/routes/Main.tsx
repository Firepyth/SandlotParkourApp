import { useQuery } from '@tanstack/react-query';
import HomeTable from '../components/homeTable';
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
        <div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>
                                Date added
                            </th>
                            <th>
                                Course name
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
                <table>
                    <thead>
                        <tr>
                            <th>
                                Courses
                            </th>
                            <th>
                                Player name
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