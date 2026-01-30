import { useState } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./components/about";
import Catalog from "./components/catalog";
import Banner from "./components/banner";
import Footer from "./components/footer";
import Login from "./components/login";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(userData) => {
            setUser(userData);
            setShowLogin(false);
          }}
        />
      )}

      <Home />
      <About />
      <Catalog />
      <Banner />
      <Footer />
    </>
  );
}

export default App;
