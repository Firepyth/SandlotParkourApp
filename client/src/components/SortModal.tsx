import type { QueryClient } from "@tanstack/react-query";
import { TableContainer } from "./stylePresets/presetStyles";

interface SortParams {
    sort: string;
    direction: string;
    setDirection: Function;
    setSort: Function;
    queryClient: QueryClient;
    queryKey: string;
    setPage: Function;
}

interface MobileSortParams extends SortParams {
    newSort: string;
}

interface sortOption {
    name: string;
    sort: string;
}

const handleMobileSort = async (sortParams: MobileSortParams) => {
    await sortParams.setSort(sortParams.newSort);
    await sortParams.setPage(1);

    sortParams.queryClient.invalidateQueries({queryKey: [sortParams.queryKey]});
}

const handleDirection = async (sortParams: SortParams, newDirection: string) => {
    await sortParams.setDirection(newDirection);

    sortParams.queryClient.invalidateQueries({queryKey: [sortParams.queryKey]});
}

export default function SortModal ({name, setShowModal, sortParams, sortOptions}: {name: string, setShowModal: Function, sortParams: SortParams, sortOptions: sortOption[]}) {
    return <TableContainer className="pointer-events-auto fixed left-0 right-0 w-[calc(100vw_-_2rem)] max-w-[15rem] top-20 mx-auto z-1 shadow-[0_0_0_max(1000rem,_100vw)_rgba(0,_0,_0,_.5)] sm:w-[15rem] sm:max-w-[15rem] overflow-visible!" onClick={(e: Event) => e.stopPropagation()}>
        <div className="flex flex-col gap-[1rem]">
            <button className="absolute top-[-.75rem] right-[-.75rem] cursor-pointer bg-[#8b8b8b] text-[#232323] rounded-full min-w-[1.75rem] min-h-[1.75rem] hover:bg-[#999999] flex items-center justify-center" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            <div className="relative">
                <select name={`${name}_direction`} id={`${name}_direction`} onChange={(e) => handleDirection(sortParams, e.target.value)} defaultValue={sortParams.direction}
                        className="appearance-none w-full">
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                </select>
                <i className="fa-solid fa-sort absolute right-0 pointer-events-none top-[0.25rem]"></i>
            </div>
            {sortOptions.map((item) => {
                return <div key={`${name}_${item.name}`} className="flex gap-[1rem] items-center">
                    <input type="radio" name={name} id={`${name}_${item.name}`} onChange={() => {handleMobileSort({...sortParams, newSort: item.sort})}} checked={sortParams.sort === item.sort}/>
                    <label htmlFor={`${name}_${item.name}`}>{item.name}</label>
                </div>
            })}
        </div>
    </TableContainer>
}