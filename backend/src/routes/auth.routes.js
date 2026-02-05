const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "123456") {
    return res.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: 1,
        email,
      },
      token: "dummy-token",
    });
  }

  res.status(401).json({
    success: false,
    message: "Email atau password salah",
  });
});

module.exports = router;
