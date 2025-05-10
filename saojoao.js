const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express(); // ✅ certifique-se que essa linha existe antes de usar "app"

const PORT = 3000;

app.use(cors());

app.get("/produtos", (req, res) => {
  try {
    const data = fs.readFileSync("produtos-saojoao.json", "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);
    res.status(500).send("Erro ao carregar os produtos.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
