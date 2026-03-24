import { useState, useEffect } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Admin from "./pages/admin";
import OrderStatus from "./pages/orderStatus";
import OrderHistory from "./pages/orderHistory";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data;
        setUser(userData);
        setIsAdmin(userData.is_admin || false);
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  };

  const randomNames = ["Andi", "Budi", "Citra", "Dina", "Eka"];

  const handleLogin = () => {
    const randomName =
      randomNames[Math.floor(Math.random() * randomNames.length)];

    setUser({ name: randomName });
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAdmin(false);
    setShowAdmin(false);
  };

  return (
    <>
      <Navbar
        user={user}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onAdminClick={() => setShowAdmin(true)}
        onOrderStatusClick={() => setShowOrderStatus(true)}
        onOrderHistoryClick={() => setShowOrderHistory(true)}
        onCartClick={() => {/* TODO: Implement cart */}}
      />

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onLoginSuccess={async (userData) => {
            await checkAuth();
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
          onRegisterSuccess={async (userData) => {
            await checkAuth();
            setShowRegister(false);
          }}
        />
      )}

      {showAdmin && isAdmin && (
        <Admin
          user={user}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {showOrderStatus && (
        <OrderStatus onClose={() => setShowOrderStatus(false)} />
      )}

      {showOrderHistory && (
        <OrderHistory onClose={() => setShowOrderHistory(false)} />
      )}

      <Home />
    </>
  );
}

export default App;
