import { useState } from "react";
import api from "../services/api";

function Login({ onClose, onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      const userData = {
        ...res.data.user,
        name:
          res.data.user.name ||
          res.data.user.username ||
          res.data.user.email?.charAt(0).toUpperCase(),
      };

      onLoginSuccess(userData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Email atau password salah"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[920px] p-[42px] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[9999]">
      <button
        className="absolute top-4 right-4 bg-transparent border-none text-[22px] cursor-pointer"
        onClick={onClose}
      >
        ✕
      </button>

      <h2 className="text-center mb-4">Masuk ke Petaléa</h2>
      <p className="text-center text-[#555] mb-6 text-[17px]">Login untuk melanjutkan belanja</p>

      {error && <p className="text-red-500 my-2 text-sm">{error}</p>}

      <label className="block pt-4 pb-2 mb-3 font-semibold">Email</label>
      <input
        className="w-full p-3.5 rounded-[10px] border border-[#ddd] mb-[18px] outline-none focus:border-[#e6005c]"
        type="email"
        placeholder="Masukkan email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <label className="block pt-4 pb-2 mb-3 font-semibold">Password</label>
      <input
        className="w-full p-3.5 rounded-[10px] border border-[#ddd] mb-[18px] outline-none focus:border-[#e6005c]"
        type="password"
        placeholder="Masukkan password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="w-full p-3.5 mb-5 bg-[#e6005c] text-white border-none rounded-xl text-base cursor-pointer hover:bg-[#cc0052] transition-colors duration-300 disabled:opacity-60"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Loading..." : "Masuk"}
      </button>

      <p className="text-center text-[#555]">
        Belum punya akun?{" "}
        <span
          className="text-[#e6005c] cursor-pointer font-medium"
          onClick={onSwitchToRegister}
        >
          Daftar di sini
        </span>
      </p>
    </div>
  );
}

export default Login;
