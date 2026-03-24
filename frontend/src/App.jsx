import { useState, useEffect } from "react";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Admin from "./pages/admin";
import OrderStatus from "./pages/orderStatus";
import OrderHistory from "./pages/orderHistory";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import PaymentSuccess from "./pages/paymentSuccess";
import PaymentFailed from "./pages/paymentFailed";
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentFailed, setShowPaymentFailed] = useState(false);

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

  const handleCheckoutClick = (action) => {
    setShowCart(false);
    if (action === "login") {
      setShowLogin(true);
    } else if (action === "checkout") {
      setShowCheckout(true);
    }
  };

  const handlePaymentPending = (paymentData) => {
    setShowCheckout(false);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");
    if (paymentStatus === "success") {
      setShowPaymentSuccess(true);
    } else if (paymentStatus === "failed") {
      setShowPaymentFailed(true);
    }
  }, []);

  return (
    <CartProvider>
      <Navbar
        user={user}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onAdminClick={() => setShowAdmin(true)}
        onOrderStatusClick={() => setShowOrderStatus(true)}
        onOrderHistoryClick={() => setShowOrderHistory(true)}
        onCartClick={() => setShowCart(true)}
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

      {showCart && (
        <Cart
          onClose={() => setShowCart(false)}
          onCheckoutClick={handleCheckoutClick}
          user={user}
        />
      )}

      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(false)}
          user={user}
          onPaymentPending={handlePaymentPending}
        />
      )}

      {showPaymentSuccess && (
        <PaymentSuccess onClose={() => setShowPaymentSuccess(false)} />
      )}

      {showPaymentFailed && (
        <PaymentFailed
          onClose={() => setShowPaymentFailed(false)}
          onTryAgain={() => setShowCheckout(true)}
        />
      )}

      <Home />
    </CartProvider>
  );
}

export default App;
