import { useState } from "react";
import axios from "axios";
import "./login.css";

function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      
      console.log("Login sukses:", res.data);

      alert("Login berhasil");
      onClose(); 
    } catch (err) {
      setError(
        err.response?.data?.message || "Login gagal, silahkan coba lagi"
      );
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>Masuk ke Petaléa</h2>
        <p>Login untuk melanjutkan belanja</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button className="btn-login" type="submit">
            Masuk
          </button>
        </form>

        <p className="register">
          Belum punya akun? <span>Daftar di sini</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
