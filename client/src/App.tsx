import { Outlet } from "react-router";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";

function App({children}: {children?: React.ReactNode}) {
  const [showModal, setShowModal] = useState<string | false>(false);

  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      e.key === 'Escape' ? setShowModal(false) : '';
    });
  }, [])

  return (
    <div className={`bg-[url('./assets/images/site-bg.png')] bg-no-repeat bg-position-[calc(50%)_4rem] bg-[#333333] text-[#ffffff] font-rubik font-light text-[100%]/[1.5rem] min-h-[100vh] xl:h-[100vh] flex flex-col xl:pb-[4rem]`}
      onClick={() => showModal !== false ? setShowModal(false) : ''}
      >
      <NavBar showModal={showModal} setShowModal={setShowModal} />
      <main className={`px-[1rem] pb-[4rem] mx-auto block w-full flex flex-col flex-[1_1_auto] xs:px-[2rem] lg:px-[0] lg:max-w-[55rem] min-h-[50rem] xl:overflow-hidden xl:max-w-[75rem]${showModal ? ' pointer-events-none' : ''}`}>
        {children}
        <Outlet context={{showModal, setShowModal}}/>
      </main>
      <Footer className={showModal ? 'pointer-events-none' : ''}/>
    </div>
  )
}

export default App;