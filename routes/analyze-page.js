const express = require("express");
const path = require("path");
const router = express.Router();
const { analyzeLargeFile } = require("../utils/analyzeLargeFile");

router.get("/analyze-file", async (req, res) => {
  try {
    const result = await analyzeLargeFile("data/large-text.txt");
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error("File analysis failed:", err);
    res.status(500).json({ error: "Failed to analyze file" });
  }
});

module.exports = router;
