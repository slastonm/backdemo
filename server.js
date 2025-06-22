const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
// app.use(require("./routes/gacha"));
app.use("/forum", require("./routes/forum"));
app.use("/generator", require("./routes/event"));
app.use("/priority", require("./routes/priority"));
app.use("/analyze", require("./routes/analyze-page"));
const proxyRouter = require("./routes/proxy");
const proxyAuthMiddleware = require("./middleware/auth-proxy");

app.use("/proxy", proxyAuthMiddleware, proxyRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server runnig on http://localhost:${PORT}`);
});
