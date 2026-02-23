import { useState } from "react";
import axios from "axios";
import "./login.css";

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

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Pastikan user punya name / username untuk avatar
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

  // tekan Enter = login
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-modal">
      <button className="close-btn" onClick={onClose}>
        ✕
      </button>

      <h2>Masuk ke Petaléa</h2>
      <p>Login untuk melanjutkan belanja</p>

      {error && <p className="error">{error}</p>}

      <label>Email</label>
      <input
        type="email"
        placeholder="Masukkan email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Masukkan password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="btn-login"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Loading..." : "Masuk"}
      </button>

      <p className="register">
        Belum punya akun?{" "}
        <span onClick={onSwitchToRegister} style={{ cursor: "pointer" }}>
          Daftar di sini
        </span>
      </p>
    </div>
  );
}

export default Login;
