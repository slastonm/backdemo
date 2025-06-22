const express = require("express");
const router = express.Router();

// Якщо ви на Node.js 18+, fetch вже доступний глобально
// Тобто немає потреби ні в node-fetch, ні в require/import

router.get("/external", async (req, res) => {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      message: "Successfully fetched external data",
      data,
    });
  } catch (err) {
    console.error("Proxy fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch from external API" });
  }
});

module.exports = router;
