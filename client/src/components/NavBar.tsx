import { Link, useLocation } from "react-router";
import GlobalSearch from "./GlobalSearch";

export default function NavBar ({ showModal, setShowModal }: {showModal: string | false, setShowModal: Function}) {
    const location = useLocation();
    return <>
        <header className="sticky top-[-3.125rem] md:top-0 bg-[#bf1e36] min-h-[4rem] flex-[0_1_auto] z-1">
            <div className="px-[1rem] xs:px-[2rem] lg:px-0 lg:max-w-[55rem] xl:max-w-[75rem] md:flex justify-between mx-auto min-h-[4rem]">
                <p className={`inline-block font-minecraft text-[2rem]/[1em] my-auto pb-[.125rem] pt-[1rem] md:pt-0${showModal ? ' pointer-events-none' : ''}`}>
                    <Link to="/">Sandlot PK</Link>
                </p>
                <nav className={`font-minecraft font-[.75rem] tracking-[.2em] my-auto uppercase min-h-[4rem] flex gap-[1rem] ${showModal ? ' pointer-events-none' : ''}`}>
                    <Link className={`block tracking-[.1em] mt-[1.25rem] duration-100 ${location.pathname === '/' ? 'border-b-[.375em] hover:border-b-[.625em]' : 'hover:border-b-[.25em]'}`} to="/" state={{scrollUp: true}}>Home</Link>
                    <Link className={`block tracking-[.1em] mt-[1.25rem] duration-100 ${location.pathname.substring(0, 8) === '/players' ? 'border-b-[.375em] hover:border-b-[.625em]' : 'hover:border-b-[.25em]'}`} to="/players" state={{scrollUp: true}}>Players</Link>
                    <Link className={`block tracking-[.1em] mt-[1.25rem] duration-100 ${location.pathname.substring(0, 8) === '/courses' ? 'border-b-[.375em] hover:border-b-[.625em]' : 'hover:border-b-[.25em]'}`} to="/courses" state={{scrollUp: true}}>Courses</Link>
                    <button className="cursor-pointer uppercase block tracking-[.1em] overflow-none flex flex-col duration-100 hover:border-b-[.25em]" onClick={() => setShowModal('search')}><p className={`w-full flex-[1_1_auto] mt-[1.25rem]`}>Search</p></button>
                </nav>
                {showModal === 'search' ? <GlobalSearch setShowModal={setShowModal} /> : ''}
            </div>
        </header>
    </>
}