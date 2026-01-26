import "./login.css";

function Login({ onClose }) {
  return (
    <div className="login-modal">
      <button className="close-btn" onClick={onClose}>✕</button>

      <h2>Masuk ke Petaléa</h2>
      <p>Login untuk melanjutkan belanja</p>

      <label>Email</label>
      <input type="email" placeholder="Masukkan email" />

      <label>Password</label>
      <input type="password" placeholder="Masukkan password" />

      <button className="btn-login">Masuk</button>

      <p className="register">
        Belum punya akun? <span>Daftar di sini</span>
      </p>
    </div>
  );
}

export default Login;
