import { Link } from "react-router";

export default function NavBar () {
    return <>
        <header className="flex justify-between">
            <div>
                Logo
            </div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/players">Players</Link>
                <Link to="/courses">Courses</Link>
                <button className="cursor-pointer">Search</button>
            </nav>
        </header>
    </>
}