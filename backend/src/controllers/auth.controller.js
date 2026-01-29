exports.login = (req, res) => {
  const { email, password } = req.body;

  // sementara hardcode dulu (testing)
  if (email === "test@gmail.com" && password === "123456") {
    return res.json({
      success: true,
      message: "Login berhasil",
      user: {
        email,
        name: "Test User"
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: "Email atau password salah"
  });
};
