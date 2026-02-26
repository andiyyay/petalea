import { useState } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const randomNames = ["Andi", "Budi", "Citra", "Dina", "Eka"];

  const handleLogin = () => {
    const randomName =
      randomNames[Math.floor(Math.random() * randomNames.length)];

    setUser({ name: randomName });
    setShowLogin(false);
  };

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
          onRandomLogin={handleLogin}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      <Home />
    </>
  );
}

export default App;
