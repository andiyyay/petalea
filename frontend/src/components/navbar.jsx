import { useState, useRef, useEffect } from "react";

function Navbar({ user, onLoginClick, onLogout, isAdmin, onAdminClick, onOrderStatusClick, onOrderHistoryClick, onCartClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <button
                onClick={onOrderStatusClick}
                className="text-black font-medium hover:text-[#e11d48] transition-colors duration-300 bg-transparent border-none cursor-pointer text-lg"
              >
                Status Pesanan
              </button>
            </li>
            <li>
              <button
                onClick={onOrderHistoryClick}
                className="text-black font-medium hover:text-[#e11d48] transition-colors duration-300 bg-transparent border-none cursor-pointer text-lg"
              >
                Riwayat Pemesanan
              </button>
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
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 bg-[#ffe6ef] text-[#e6005c] rounded-full font-bold flex items-center justify-center text-sm hover:bg-[#ffd6eb] transition-colors duration-300">
                {initial}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="font-medium text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>

                {isAdmin && (
                  <button
                    className="w-full text-left px-4 py-3 text-[#e11d48] hover:bg-pink-50 transition-colors duration-200 flex items-center gap-2"
                    onClick={() => {
                      onAdminClick();
                      setShowProfileMenu(false);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Admin Panel
                  </button>
                )}

                <button
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        <span
          className="flex items-center justify-center cursor-pointer hover:text-[#e11d48] transition-colors duration-300 relative"
          onClick={user ? onCartClick : onLoginClick}
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
