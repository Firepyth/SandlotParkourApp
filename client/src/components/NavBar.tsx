import { Link } from "react-router";
import GlobalSearch from "./GlobalSearch";

export default function NavBar ({ showSearch, setShowSearch }: {showSearch: boolean, setShowSearch: Function}) {
    return <>
        <header className="flex justify-between">
            <div>
                <Link to="/">Sandlot PK</Link>
            </div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/players">Players</Link>
                <Link to="/courses">Courses</Link>
                <button className="cursor-pointer" onClick={() => setShowSearch(!showSearch)}>Search</button>
            </nav>
            {showSearch ? <GlobalSearch setShowSearch={setShowSearch} /> : ''}
        </header>
    </>
}