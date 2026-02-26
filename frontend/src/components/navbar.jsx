function Navbar({ user, onLoginClick, onLogout }) {
  const getInitial = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const initial = getInitial(user?.name);

  return (
    <nav className="flex items-center justify-between px-16 py-5 bg-white">
      <div className="text-[26px] font-bold text-[#e91e63]">Petaléa</div>

      <ul className="flex list-none gap-8 text-lg">
        <li>
          <a href="#shop" className="text-black no-underline font-medium hover:text-[#e11d48] transition-colors duration-300">
            Shop
          </a>
        </li>
        <li>
          <a href="#about" className="text-black no-underline font-medium hover:text-[#e11d48] transition-colors duration-300">
            About
          </a>
        </li>
        {user && (
          <>
            <li>
              <a href="#status" className="text-black no-underline font-medium hover:text-[#e11d48] transition-colors duration-300">
                Status Pesanan
              </a>
            </li>
            <li>
              <a href="#riwayat" className="text-black no-underline font-medium hover:text-[#e11d48] transition-colors duration-300">
                Riwayat Pemesanan
              </a>
            </li>
          </>
        )}
      </ul>

      <div className="flex items-center gap-[18px]">
        {!user && (
          <span
            className="flex items-center gap-1.5 text-[#e91e63] cursor-pointer font-medium rounded px-2 py-1 hover:bg-pink-50 transition-colors duration-300"
            onClick={onLoginClick}
          >
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
          <div className="flex items-center gap-5">
            <div className="w-8 h-8 bg-[#ffe6ef] text-[#e6005c] rounded-full font-bold flex items-center justify-center text-sm">
              {initial}
            </div>
            <span
              className="cursor-pointer hover:text-[#e6005c] transition-colors duration-300"
              onClick={onLogout}
              title="Logout"
            >
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

        <span
          className="flex items-center justify-center cursor-pointer hover:text-[#e11d48] transition-colors duration-300"
          onClick={!user ? onLoginClick : undefined}
        >
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
