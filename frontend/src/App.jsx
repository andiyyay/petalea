import { useState } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./components/about";
import Catalog from "./components/catalog";
import Banner from "./components/banner";
import Footer from "./components/footer";
import Login from "./components/login";
import RiwayatPesanan from "./components/riwayat";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [page, setPage] = useState("home"); // ⬅️ NAVIGASI

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onRiwayatClick={() => setPage("riwayat")}
        onHomeClick={() => setPage("home")}
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

      {/* ===== HALAMAN HOME ===== */}
      {page === "home" && (
        <>
          <Home />
          <About />
          <Catalog />
          <Banner />
          <Footer />
        </>
      )}

      {/* ===== HALAMAN RIWAYAT ===== */}
      {page === "riwayat" && (
        <RiwayatPesanan onClose={() => setPage("home")} />
      )}
    </>
  );
}

export default App;
