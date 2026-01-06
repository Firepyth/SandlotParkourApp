import { Link, useLocation } from "react-router";
import GlobalSearch from "./GlobalSearch";

export default function NavBar ({ showSearch, setShowSearch }: {showSearch: boolean, setShowSearch: Function}) {
    const location = useLocation();
    return <>
        <header className="bg-[#bf1e36] h-[4rem] flex-[0_1_auto]">
            <div className="flex justify-between mx-auto max-w-[75rem] h-full">
                <p className={`inline-block font-minecraft text-[2rem]/[1em] my-auto pb-[.125rem]${showSearch ? ' pointer-events-none' : ''}`}>
                    <Link to="/">Sandlot PK</Link>
                </p>
                <nav className={`font-minecraft font-[.75rem] tracking-[.2em] my-auto uppercase flex gap-[1rem] h-full${showSearch ? ' pointer-events-none' : ''}`}>
                    <Link className={`block tracking-[.1em] mt-[1.25rem] duration-100 ${location.pathname === '/' ? 'border-b-[.375em] hover:border-b-[.625em]' : 'hover:border-b-[.25em]'}`} to="/">Home</Link>
                    <Link className={`block tracking-[.1em] mt-[1.25rem] duration-100 ${location.pathname.substring(0, 8) === '/players' ? 'border-b-[.375em] hover:border-b-[.625em]' : 'hover:border-b-[.25em]'}`} to="/players">Players</Link>
                    <Link className={`block tracking-[.1em] mt-[1.25rem] duration-100 ${location.pathname.substring(0, 8) === '/courses' ? 'border-b-[.375em] hover:border-b-[.625em]' : 'hover:border-b-[.25em]'}`} to="/courses">Courses</Link>
                    <button className="cursor-pointer uppercase block tracking-[.1em] overflow-none flex flex-col duration-100 hover:border-b-[.25em]" onClick={() => setShowSearch(!showSearch)}><p className={`w-full flex-[1_1_auto] mt-[1.25rem]`}>Search</p></button>
                </nav>
                {showSearch ? <GlobalSearch setShowSearch={setShowSearch} /> : ''}
            </div>
        </header>
    </>
}