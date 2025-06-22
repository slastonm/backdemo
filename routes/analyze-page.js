const express = require("express");
const path = require("path");
const router = express.Router();
const analyzeLargeFile = require("../utils/analyzeLargeFile");

router.get("/analyze-file", async (req, res) => {
  try {
    const result = await analyzeLargeFile("large-text.txt");
    res.json(result);
  } catch (err) {
    console.error("File analysis failed:", err);
    res.status(500).json({ error: "Failed to analyze file" });
  }
});

module.exports = router;
