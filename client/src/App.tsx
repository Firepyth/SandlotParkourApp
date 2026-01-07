import { Outlet } from "react-router"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import { useState } from "react";

function App({children}: {children?: React.ReactNode}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className={`bg-[#333333] text-[#ffffff] font-rubik font-light text-[100%]/[1.5rem] h-[100vh] flex flex-col pb-[8rem]`} onClick={() => showSearch === true ? setShowSearch(false) : ''}>
      <NavBar showSearch={showSearch} setShowSearch={setShowSearch} />
      <main className={`max-w-[75rem] mx-auto block overflow-hidden w-full flex flex-col flex-[1_1_auto]${showSearch ? ' pointer-events-none' : ''}`}>
        {children}
        <Outlet />
      </main>
      <Footer className={showSearch ? 'pointer-events-none' : ''}/>
    </div>
  )
}

export default App
