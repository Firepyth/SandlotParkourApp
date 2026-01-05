import { Link } from "react-router";
import GlobalSearch from "./GlobalSearch";

export default function NavBar ({ showSearch, setShowSearch }: {showSearch: boolean, setShowSearch: Function}) {
    return <>
        <header className="bg-[#bf1e36] h-[4rem] flex-[0_1_auto]">
            <div className="flex justify-between mx-auto max-w-[75rem] h-full">
                <p className="inline-block font-minecraft text-[2rem]/[1em] my-auto pb-[.125rem]">
                    <Link to="/">Sandlot PK</Link>
                </p>
                <nav className="font-minecraft font-[.75rem] tracking-[.2em] my-auto uppercase">
                    <Link className="inline-block ml-[.5rem] tracking-[.1em]" to="/">Home</Link>
                    <Link className="inline-block ml-[.5rem] tracking-[.1em]" to="/players">Players</Link>
                    <Link className="inline-block ml-[.5rem] tracking-[.1em]" to="/courses">Courses</Link>
                    <button className="cursor-pointer uppercase inline-block ml-[.5rem] tracking-[.1em]" onClick={() => setShowSearch(!showSearch)}>Search</button>
                </nav>
                {showSearch ? <GlobalSearch setShowSearch={setShowSearch} /> : ''}
            </div>
        </header>
    </>
}