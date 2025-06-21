const express = require("express");
// const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
// app.use(require("./routes/gacha"));
app.use("/forum", require("./routes/forum"));

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server runnig on http://localhost:${PORT}`);
});

// mongoose
//   .connect("mongodb://localhost:27017/my_database")
//   .then(() => {
//     console.log("MongoDB connected");
//     app.listen(5000, () => console.log("Server running on port 5000"));
//   })
//   .catch((err) => console.error(err));
