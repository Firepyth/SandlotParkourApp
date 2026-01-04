import { Outlet } from "react-router"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import { useState } from "react";

function App() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div onClick={() => showSearch === true ? setShowSearch(false) : ''}>
      <NavBar showSearch={showSearch} setShowSearch={setShowSearch} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
