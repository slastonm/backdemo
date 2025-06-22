const express = require("express");
const router = express.Router();
const { createAuthProxy } = require("../utils/authProxy");

const proxy = createAuthProxy({
  type: "OAuth",
  token: "initial-token",
  baseURL: "https://jsonplaceholder.typicode.com",
  enableTokenRenewal: false,
  logRequests: true,
});

router.get("/proxy/posts", async (req, res) => {
  try {
    const response = await proxy.fetch("/posts");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
