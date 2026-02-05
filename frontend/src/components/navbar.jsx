import "./Navbar.css";

function Navbar({ user, onLoginClick, onLogout, onRiwayatClick, onHomeClick }) {
  const initial = user?.name?.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="logo" onClick={onHomeClick}>Petaléa</div>

      <ul className="nav-menu">
        <li onClick={onHomeClick}>Shop</li>
        <li onClick={onHomeClick}>About</li>

        {user && (
          <li onClick={onRiwayatClick}>Riwayat Pemesanan</li>
        )}
      </ul>

      <div className="nav-icons">
        {!user && (
          <span className="login" onClick={onLoginClick}>
            Login
          </span>
        )}

        {user && (
          <div className="user-area">
            <div className="user-avatar">{initial}</div>

            <span className="logout" onClick={onLogout}>
              Logout
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
