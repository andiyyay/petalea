import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Petaléa</div>

      <ul className="nav-menu">
        <li><a href="#shop">Shop</a> </li>
        <li><a href="#about">About</a></li>
      </ul>

      <div className="nav-icons">
        <span className="login">Login</span>
        <span>♡</span>
        <span>🛒</span>
      </div>
    </nav>
  );
}

export default Navbar;
