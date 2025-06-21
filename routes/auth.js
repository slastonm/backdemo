const router = require("express").Router();
//const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mockUsers = [];

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existing = mockUsers.find((u) => u.email === email);
  if (existing) {
    return res.status(409).send("User already exists");
  }
  const hashed = await bcrypt.hash(password, 10);
  // const user = new User({ username, email, password: hashed });
  const user = { username, email, password: hashed };
  mockUsers.push(user);
  res.status(201).send("Registered");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = mockUsers.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Invalid credentials");
  }
  const token = jwt.sign({ email: user.email }, "secretkey", {
    expiresIn: "2h",
  });
  res.status(200).json({ token, user: { username: user.username } });
});

router.post("/logout", (req, res) => {
  res.send("Logget out");
});

module.exports = router;
