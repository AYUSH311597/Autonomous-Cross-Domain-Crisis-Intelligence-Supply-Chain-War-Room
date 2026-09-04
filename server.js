const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("<h1 style='color: #ef4444; background: #090d16; padding: 20px; text-align: center;'>CASCADIA CRISIS INTELLIGENCE DASHBOARD IS LIVE</h1>");
});

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "cascadia-core" });
});

app.listen(PORT, () => {
  console.log(`[CASCADIA] Server running on port ${PORT}`);
});
