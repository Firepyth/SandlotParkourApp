export default function SortButton ({setShowModal}: {setShowModal?: Function}) {
    return <button className={`my-auto text-[#232323] text-[1.25rem] rounded-[4px] min-w-[2rem] min-h-[2rem] flex items-center justify-center ${setShowModal !== undefined ? 'hover:bg-[#555555] cursor-pointer bg-[#404040]' : 'bg-[#333333]'}`}
                   onClick={setShowModal ? () => setShowModal() : undefined}
                   tabIndex={setShowModal ? 0 : -1}>
        <i className="fa-solid fa-sort"></i>
    </button>
}