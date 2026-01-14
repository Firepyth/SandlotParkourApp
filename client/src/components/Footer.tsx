export default function Footer ({className = ''}: {className: string}) {
    return <>
        <footer className={`bg-[#121212] py-[1rem] w-full flex items-center justify-center lg:h-[4rem] xl:fixed xl:bottom-0 ${className}`}>
            <p className="text-[#8b8b8b] text-[.75rem] text-center px-[1rem] xs:px-[2rem] sm:px-[4rem]">
                @ 2025 website built by Firepyth with permission from The&nbsp;Sandlot. This is not an official Minecraft product, and is neither approved by nor associated with Mojang or Microsoft.
            </p>
        </footer>
    </>
}