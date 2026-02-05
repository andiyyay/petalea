import { useState } from "react";
import axios from "axios";
import "./login.css";

function Login({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // kirim user ke App.jsx
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError("Email atau password salah");
    }
  };

  return (
    <div className="login-modal">
      <button className="close-btn" onClick={onClose}>✕</button>

      <h2>Masuk ke Petaléa</h2>
      <p>Login untuk melanjutkan belanja</p>

      {error && <p className="error">{error}</p>}

      <label>Email</label>
      <input
        type="email"
        placeholder="Masukkan email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Masukkan password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn-login" onClick={handleLogin}>
        Masuk
      </button>

      <p className="register">
        Belum punya akun? <span>Daftar di sini</span>
      </p>
    </div>
  );
}

export default Login;
