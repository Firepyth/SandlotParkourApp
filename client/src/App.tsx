import { Outlet } from "react-router";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { useState } from "react";

function App({children}: {children?: React.ReactNode}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className={`bg-[url('./assets/images/site-bg.png')] bg-no-repeat bg-position-[calc(50%)_4rem] bg-[#333333] text-[#ffffff] font-rubik font-light text-[100%]/[1.5rem] min-h-[100vh] lg:h-[100vh] flex flex-col lg:pb-[4rem]`} onClick={() => showSearch === true ? setShowSearch(false) : ''}>
      <NavBar showSearch={showSearch} setShowSearch={setShowSearch} />
      <main className={`px-[4rem] pb-[4rem] mx-auto block w-full flex flex-col flex-[1_1_auto] lg:px-[0] lg:max-w-[55rem] lg:overflow-hidden xl:max-w-[75rem]${showSearch ? ' pointer-events-none' : ''}`}>
        {children}
        <Outlet />
      </main>
      <Footer className={showSearch ? 'pointer-events-none' : ''}/>
    </div>
  )
}

export default App;