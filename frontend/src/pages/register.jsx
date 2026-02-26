import { useState } from "react";
import api from "../services/api";

function Register({ onClose, onSwitchToLogin, onRegisterSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak sama!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name: form.username,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (onRegisterSuccess) {
        onRegisterSuccess(res.data.user);
      } else {
        alert("Akun berhasil dibuat! Silakan login.");
        onSwitchToLogin();
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || "Gagal membuat akun, coba lagi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 mt-1.5 mb-3.5 rounded-lg border-2 border-[#ddd] outline-none focus:border-[#ff004f] transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]">
      <div className="bg-white w-[1000px] p-[50px] rounded-xl text-center relative">
        <span
          className="absolute right-[15px] top-[10px] text-[22px] cursor-pointer"
          onClick={onClose}
        >
          ×
        </span>

        <h2 className="mb-2.5 text-2xl">Daftar Akun</h2>
        <p className="text-[#777] mb-6">Buat akun untuk mulai berbelanja</p>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <form className="text-left" onSubmit={handleSubmit}>
          <label className="text-base font-medium">Username</label>
          <input
            className={inputClass}
            type="text"
            name="username"
            placeholder="Masukkan username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label className="text-base font-medium">Email</label>
          <input
            className={inputClass}
            type="email"
            name="email"
            placeholder="Masukkan email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="text-base font-medium">Password</label>
          <input
            className={inputClass}
            type="password"
            name="password"
            placeholder="Masukkan password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="text-base font-medium">Konfirmasi Password</label>
          <input
            className={inputClass}
            type="password"
            name="confirmPassword"
            placeholder="Konfirmasi password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ff004f] text-white border-none rounded-lg font-bold cursor-pointer hover:bg-[#e60045] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Daftar"}
          </button>
        </form>

        <p className="mt-[15px] text-sm">
          Sudah punya akun?{" "}
          <span
            className="text-[#ff004f] cursor-pointer font-medium"
            onClick={onSwitchToLogin}
          >
            Masuk di sini
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
