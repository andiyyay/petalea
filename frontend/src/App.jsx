import { useState } from "react";

import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./components/about";
import Catalog from "./components/catalog";
import Banner from "./components/banner";
import Footer from "./components/footer";
import Login from "./components/login";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />

      <Home />
      <About />
      <Catalog />
      <Banner />
      <Footer />

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default App;
