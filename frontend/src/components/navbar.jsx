import { useState } from "react";
import "./Navbar.css";
import Login from "./login";

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo">Petaléa</div>

        <ul className="nav-menu">
          <li><a href="#shop">Shop</a></li>
          <li><a href="#about">About</a></li>
        </ul>

        <div className="nav-icons">
          <span className="login" onClick={() => setShowLogin(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 16-4 16 0" />
            </svg>
            Login
          </span>

          <span className="love">♡</span>

          <span onClick={() => setShowLogin(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.6 13h11.4l2-8H6" />
            </svg>
          </span>

        </div>
      </nav>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}

    </>
  );
}

export default Navbar;
