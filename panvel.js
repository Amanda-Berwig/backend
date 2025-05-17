const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3002;

app.use(cors());

app.get("/produtos", (req, res) => {
  const data = fs.readFileSync("produtos-panvel.json", "utf-8");
  res.json(JSON.parse(data));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
