import { useState } from "react";
import "./register.css";

function Register({ onClose, onSwitchToLogin }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    alert("Akun berhasil dibuat");
    onClose();
  };

  return (
    <div className="register-overlay">
      <div className="register-box">

        <span className="close" onClick={onClose}>×</span>

        <h2>Daftar Akun</h2>
        <p className="subtitle">Buat akun untuk mulai berbelanja</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Masukkan username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Masukkan email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Masukkan password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Konfirmasi Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Konfirmasi password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-daftar">
            Daftar
          </button>
        </form>

        <p className="login-text">
          Sudah punya akun?{" "}
          <span onClick={onSwitchToLogin}>Masuk di sini</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
