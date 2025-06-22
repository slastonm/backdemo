const express = require("express");
const router = express.Router();
const { PriorityQueue } = require("../utils/priorityQueue");

const queue = new PriorityQueue();

router.post("/enqueue", (req, res) => {
  const { item, priority } = req.body;
  if (!item || typeof priority !== "number") {
    return res.status(400).json({ error: "Missing item or priority" });
  }
  queue.enqueue(item, priority);
  res.json({ success: true });
});

router.get("/peek", (req, res) => {
  const mode = req.query.mode || "highest";
  const item = queue.peek(mode);
  res.json({ mode, item });
});

router.get("/dequeue", (req, res) => {
  const mode = req.query.mode || "highest";
  const item = queue.dequeue(mode);
  res.json({ mode, item });
});

module.exports = router;
