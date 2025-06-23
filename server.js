const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Existing routes
app.use("/auth", require("./routes/auth"));
// app.use(require("./routes/gacha"));
app.use("/forum", require("./routes/forum"));
app.use("/generator", require("./routes/event"));
app.use("/priority", require("./routes/priority"));
app.use("/analyze", require("./routes/analyze-page"));

app.use("/communication", require("./routes/communication"));

// Proxy route with auth middleware
app.use(
  "/proxy",
  require("./middleware/auth-proxy"),
  require("./routes/proxy")
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `Event stream available at http://localhost:${PORT}/events/stream`
  );
});
