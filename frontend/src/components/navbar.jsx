import "./Navbar.css";

function Navbar({ user, onLoginClick, onLogout }) {
  const initial = user?.name?.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="logo">Petaléa</div>

      <ul className="nav-menu">
        <li><a href="#shop">Shop</a></li>
        <li><a href="#about">About</a></li>

        {user && (
          <>
            <li><a href="#status">Status Pesanan</a></li>
            <li><a href="#riwayat">Riwayat Pemesanan</a></li>
          </>
        )}
      </ul>

      <div className="nav-icons">

        {!user && (
          <span className="login" onClick={onLoginClick}>
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
        )}

        {user && (
          <div className="user-area">
            <div className="user-avatar">{initial}</div>

            <span className="logout" onClick={onLogout} title="Logout">
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
          </div>
        )}

        <span className="love">♡</span>

        <span onClick={!user ? onLoginClick : undefined}>
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
  );
}

export default Navbar;
